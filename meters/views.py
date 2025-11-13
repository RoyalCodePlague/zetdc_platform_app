from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Meter, Token, TokenPurchase, TokenPool, ManualRecharge
from .serializers import MeterSerializer, TokenSerializer, ManualRechargeSerializer
from .serializers import AutoRechargeConfigSerializer, AutoRechargeEventSerializer
from .models import AutoRechargeConfig, AutoRechargeEvent
from django.utils import timezone
from django.db import transaction as db_transaction
from rest_framework import mixins
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.viewsets import GenericViewSet


class ManualRechargeViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, GenericViewSet):
    serializer_class = ManualRechargeSerializer

    def get_queryset(self):
        return ManualRecharge.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['get'], url_path='inspect')
    def inspect(self, request):
        """Debug endpoint: return related TokenPool, TokenPurchase, Token and ManualRecharge info for a token_code or manual recharge id.

        Query params:
          - token_code: token code to inspect
          - id: manual recharge id to inspect

        Access: staff users OR owners of the ManualRecharge / Meter.
        """
        token_code = request.query_params.get('token_code')
        mr_id = request.query_params.get('id')

        # prefer id if provided
        mr = None
        if mr_id:
            try:
                mr = ManualRecharge.objects.get(pk=int(mr_id))
            except Exception:
                return Response({'detail': 'ManualRecharge not found'}, status=404)

        if token_code and not mr:
            token_code = ''.join([c for c in token_code if c.isalnum()])
            mr = ManualRecharge.objects.filter(token_code=token_code).order_by('-created_at').first()

        # permission: staff OR owner
        if mr:
            owner_ok = (mr.user and mr.user == request.user) or (mr.meter and mr.meter.user == request.user)
            if not (request.user.is_staff or owner_ok):
                return Response({'detail': 'Not allowed'}, status=403)
        else:
            # no MR found; if token_code provided, allow staff to inspect pool/purchases
            if not request.user.is_staff:
                return Response({'detail': 'Not allowed'}, status=403)

        # gather data
        data = {'manual_recharge': None, 'token': None, 'token_pool': None, 'token_purchase': None}
        if mr:
            data['manual_recharge'] = {
                'id': mr.id,
                'token_code': mr.token_code,
                'masked_token': mr.masked_token,
                'meter_id': mr.meter.id if mr.meter else None,
                'user_id': mr.user.id if mr.user else None,
                'units': str(mr.units) if mr.units is not None else None,
                'status': mr.status,
                'message': mr.message,
                'created_at': mr.created_at.isoformat() if mr.created_at else None,
                'applied_at': mr.applied_at.isoformat() if mr.applied_at else None,
            }

        # inspect token table
        tc = (mr.token_code if mr else token_code)
        if tc:
            t = Token.objects.filter(token_code=tc).first()
            if t:
                data['token'] = {
                    'id': t.id,
                    'token_code': t.token_code,
                    'meter_id': t.meter.id if t.meter else None,
                    'units': str(t.units) if t.units is not None else None,
                    'amount': str(t.amount) if t.amount is not None else None,
                    'is_used': t.is_used,
                    'used_at': t.used_at.isoformat() if t.used_at else None,
                }

            p = TokenPool.objects.filter(token_code=tc).first()
            if p:
                data['token_pool'] = {
                    'id': p.id,
                    'token_code': p.token_code,
                    'is_allocated': p.is_allocated,
                    'allocated_to_id': p.allocated_to.id if p.allocated_to else None,
                    'allocated_transaction_id': p.allocated_transaction_id,
                    'units': str(p.units) if p.units is not None else None,
                    'amount': str(p.amount) if p.amount is not None else None,
                    'created_at': p.created_at.isoformat() if p.created_at else None,
                }

            tp = TokenPurchase.objects.filter(token_code=tc).order_by('-purchased_at').first()
            if tp:
                data['token_purchase'] = {
                    'id': tp.id,
                    'token_code': tp.token_code,
                    'meter_id': tp.meter.id if tp.meter else None,
                    'user_id': tp.user.id if tp.user else None,
                    'amount': str(tp.amount) if tp.amount is not None else None,
                    'units': str(tp.units) if tp.units is not None else None,
                    'purchased_at': tp.purchased_at.isoformat() if tp.purchased_at else None,
                }

        return Response(data)

class MeterViewSet(viewsets.ModelViewSet):
    serializer_class = MeterSerializer
    
    def get_queryset(self):
        return Meter.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def purchase_electricity(self, request, pk=None):
        """Create a pending transaction and schedule mock payment processing.

        The actual token allocation is done in a background thread to simulate
        a delayed payment confirmation (webhook-like). This uses TokenPool
        for DB-backed token allocation.
        """
        meter = self.get_object()
        from decimal import Decimal
        import uuid
        from transactions.models import Transaction
        from meters.models import Token as TokenModel, TokenPool
        from django.utils import timezone
        import threading, time

        if meter.user.id != request.user.id:
            return Response({'detail': 'Unauthorized'}, status=403)

        amount = request.data.get('amount')
        payment_method = request.data.get('payment_method', 'dev')

        try:
            amount_dec = Decimal(str(amount))
        except Exception:
            return Response({'detail': 'Invalid amount'}, status=400)

        # Create pending transaction
        transaction_id = uuid.uuid4().hex
        transaction = Transaction.objects.create(
            user=request.user,
            meter=meter,
            transaction_id=transaction_id,
            amount=amount_dec,
            status='pending',
            transaction_type='purchase',
            payment_method=payment_method,
            description='Pending purchase - awaiting confirmation',
        )

        # Background worker to simulate payment processing and token allocation
        def process_payment(txn_id: str, user_id: int):
            import time
            from decimal import Decimal as _Decimal
            from django.db import transaction as _db_transaction
            from transactions.models import Transaction as _Transaction
            from meters.models import Token as _TokenModel, TokenPool as _TokenPool
            from usersAuth.models import User as UserModel

            # simulate payment delay
            time.sleep(3)  # 3 second delay to simulate processing

            # allocate token from TokenPool atomically
            allocated = None
            try:
                with _db_transaction.atomic():
                    # prefer a pool token that matches the purchase amount, if available
                    pool_token = _TokenPool.objects.select_for_update(skip_locked=True).filter(is_allocated=False, amount=amount_dec).first()
                    if not pool_token:
                        # fall back to any unallocated token
                        pool_token = _TokenPool.objects.select_for_update(skip_locked=True).filter(is_allocated=False).first()
                    if not pool_token:
                        _Transaction.objects.filter(transaction_id=txn_id).update(status='failed', description='No tokens available')
                        return

                    pool_token.is_allocated = True
                    pool_token.allocated_at = timezone.now()
                    # resolve user inside the background thread
                    try:
                        pool_token.allocated_to = UserModel.objects.get(pk=user_id) if user_id is not None else None
                    except Exception:
                        pool_token.allocated_to = None
                    pool_token.allocated_transaction_id = txn_id
                    pool_token.save()

                allocated = pool_token.token_code

                # create TokenModel for meter
                # prefer units from pool metadata; otherwise estimate from amount
                if pool_token.units is not None:
                    units = pool_token.units
                else:
                    units = (amount_dec * _Decimal('4.2')).quantize(_Decimal('0.01'))
                _TokenModel.objects.create(
                    meter=meter,
                    token_code=allocated,
                    amount=pool_token.amount or amount_dec,
                    units=units,
                )

                # update meter balance and last top-up timestamp
                try:
                    meter.current_balance = (meter.current_balance or _Decimal('0')) + units
                    meter.last_top_up = timezone.now()
                    meter.save(update_fields=['current_balance', 'last_top_up'])
                except Exception:
                    pass

                # mark txn completed and set units/token
                _Transaction.objects.filter(transaction_id=txn_id).update(status='completed', description=f'Allocated token {allocated}', units=units, token_code=allocated)

                # create DB-backed audit record for the purchased token (best effort)
                try:
                    from .models import TokenPurchase as _TokenPurchase
                    user_obj = None
                    try:
                        user_obj = UserModel.objects.get(pk=user_id) if user_id is not None else None
                    except Exception:
                        user_obj = None

                    _TokenPurchase.objects.create(
                        token_code=allocated,
                        meter=meter,
                        user=user_obj,
                        amount=pool_token.amount or amount_dec,
                        units=pool_token.units if pool_token.units is not None else (amount_dec * _Decimal('4.2')).quantize(_Decimal('0.01')),
                    )
                    
                    # Create notification for successful token purchase
                    if user_obj:
                        try:
                            from notifications.models import Notification
                            units_display = pool_token.units if pool_token.units is not None else (amount_dec * _Decimal('4.2')).quantize(_Decimal('0.01'))
                            Notification.objects.create(
                                user=user_obj,
                                notification_type='purchase',
                                title='Token Purchase Successful',
                                message=f'You have successfully purchased {units_display} kWh for ${amount_dec}. Token: {allocated[:4]}...{allocated[-4:]}'
                            )
                        except Exception as notif_err:
                            import logging
                            logging.exception('Failed to create purchase notification')
                except Exception:
                    # don't block allocation if audit creation fails; log and continue
                    import logging
                    logging.exception('Failed to create TokenPurchase record')

            except Exception as e:
                _Transaction.objects.filter(transaction_id=txn_id).update(status='failed', description=f'Error allocating token: {str(e)}')

        import threading
        threading.Thread(target=process_payment, args=(transaction.transaction_id, request.user.id if hasattr(request, 'user') else None), daemon=True).start()

        # return pending transaction info
        return Response({'status': 'pending', 'transaction_id': transaction.transaction_id})
    
    @action(detail=True, methods=['post'])
    def recharge_token(self, request, pk=None):
        meter = self.get_object()
        token_code = request.data.get('token')
        if meter.user.id != request.user.id:
            return Response({'detail': 'Unauthorized'}, status=403)

        # basic normalization
        token_code = (token_code or '').strip()
        if not token_code:
            mr = ManualRecharge.objects.create(token_code='', meter=meter, user=request.user, status='failed', message='Missing token')
            return Response({'status': 'failed', 'id': mr.id, 'message': 'Missing token'}, status=400)

        # prefer alphanumeric normalization
        normalized = ''.join([c for c in token_code if c.isalnum()])

        # 1) check Token table (already applied)
        existing_token = Token.objects.filter(token_code=normalized).first()
        if existing_token:
            if existing_token.meter_id == meter.id:
                # already applied to this meter -> success (idempotent)
                mr, _ = ManualRecharge.objects.get_or_create(
                    token_code=normalized,
                    meter=meter,
                    defaults={
                        'user': request.user,
                        'status': 'success',
                        'units': existing_token.units or None,
                        'message': 'Token already applied to this meter',
                        'applied_at': timezone.now()
                    }
                )
                return Response({'status': 'success', 'id': mr.id, 'message': 'Token already applied to this meter', 'units': str(existing_token.units or '0')} , status=200)
            else:
                mr = ManualRecharge.objects.create(token_code=normalized, meter=meter, user=request.user, status='rejected', message='Token already used on another meter', units=existing_token.units or None)
                return Response({'status': 'rejected', 'id': mr.id, 'message': 'Token already used on another meter'}, status=400)

        # 2) check TokenPool
        pool = TokenPool.objects.filter(token_code=normalized).first()
        from decimal import Decimal
        if pool:
            if pool.is_allocated:
                # allocated to someone — check if it's this user
                if getattr(pool, 'allocated_to_id', None) == getattr(request.user, 'id', None):
                    mr, _ = ManualRecharge.objects.get_or_create(
                        token_code=normalized,
                        meter=meter,
                        defaults={
                            'user': request.user,
                            'status': 'success',
                            'units': pool.units or None,
                            'message': 'Token already allocated to this meter',
                            'applied_at': timezone.now()
                        }
                    )
                    return Response({'status': 'success', 'id': mr.id, 'message': 'Token already allocated to this meter', 'units': str(pool.units or '0')}, status=200)
                else:
                    mr = ManualRecharge.objects.create(token_code=normalized, meter=meter, user=request.user, status='rejected', message='Token already used on another meter', units=pool.units or None)
                    return Response({'status': 'rejected', 'id': mr.id, 'message': 'Token already used on another meter'}, status=400)

            # try to allocate from pool atomically
            try:
                with db_transaction.atomic():
                    # lock and re-check
                    pool_locked = TokenPool.objects.select_for_update(skip_locked=True).filter(token_code=normalized, is_allocated=False).first()
                    if pool_locked:
                        pool_locked.is_allocated = True
                        pool_locked.allocated_at = timezone.now()
                        # store user id here for traceability; allocated_to is a User FK in original model
                        try:
                            pool_locked.allocated_to = request.user
                        except Exception:
                            # allocated_to may be a Meter FK in some variants; ignore if assignment fails
                            pass
                        pool_locked.save()

                        units_val = pool_locked.units if pool_locked.units is not None else Decimal('0')
                        token_obj = Token.objects.create(meter=meter, token_code=normalized, amount=pool_locked.amount or Decimal('0.00'), units=units_val)
                        try:
                            meter.current_balance = (meter.current_balance or Decimal('0')) + units_val
                            meter.last_top_up = timezone.now()
                            meter.save(update_fields=['current_balance', 'last_top_up'])
                        except Exception:
                            pass

                        mr = ManualRecharge.objects.create(token_code=normalized, meter=meter, user=request.user, units=units_val, status='success', applied_at=timezone.now(), message='Allocated from pool')
                        return Response({'status': 'success', 'id': mr.id, 'units': str(units_val)})
            except Exception as e:
                mr = ManualRecharge.objects.create(token_code=normalized, meter=meter, user=request.user, status='failed', message=str(e))
                return Response({'status': 'failed', 'id': mr.id, 'message': str(e)}, status=500)

        # 3) not found -> create pending MR and background verify
        mr = ManualRecharge.objects.create(token_code=normalized, meter=meter, user=request.user, status='pending', message='Verification scheduled')

        def background_check(mr_id, tcode, meter_id, user_id):
            import time
            from django.db import transaction as dbt
            attempts = 6
            for attempt in range(attempts):
                time.sleep(2)
                try:
                    with dbt.atomic():
                        p = TokenPool.objects.select_for_update(skip_locked=True).filter(token_code=tcode, is_allocated=False).first()
                        if p:
                            p.is_allocated = True
                            p.allocated_at = timezone.now()
                            # resolve user in background thread
                            try:
                                from usersAuth.models import User as UserModel
                                if user_id is not None:
                                    p.allocated_to = UserModel.objects.get(pk=user_id)
                                else:
                                    p.allocated_to = None
                            except Exception:
                                p.allocated_to = None
                            p.save()
                            units_v = p.units or Decimal('0')
                            mobj = Meter.objects.get(pk=meter_id)
                            Token.objects.create(meter=mobj, token_code=tcode, amount=p.amount or Decimal('0.00'), units=units_v)
                            mr_local = ManualRecharge.objects.get(pk=mr_id)
                            mr_local.status = 'success'
                            mr_local.units = units_v
                            mr_local.applied_at = timezone.now()
                            mr_local.message = 'Allocated from pool (background)'
                            mr_local.save(update_fields=['status', 'units', 'applied_at', 'message'])
                            return
                        tok = Token.objects.filter(token_code=tcode).first()
                        if tok:
                            mr_local = ManualRecharge.objects.get(pk=mr_id)
                            if tok.meter_id == meter_id:
                                mr_local.status = 'success'
                                mr_local.units = tok.units or None
                                mr_local.applied_at = timezone.now()
                                mr_local.message = 'Found applied token during verification'
                                mr_local.save(update_fields=['status', 'units', 'applied_at', 'message'])
                            else:
                                mr_local.status = 'rejected'
                                mr_local.message = 'Token already used on another meter'
                                mr_local.save(update_fields=['status', 'message'])
                            return
                except Exception:
                    pass
            # exhausted
            try:
                mr_local = ManualRecharge.objects.get(pk=mr_id)
                mr_local.status = 'failed'
                mr_local.message = 'Verification timeout - token not found'
                mr_local.save(update_fields=['status', 'message'])
            except Exception:
                pass

        import threading
        threading.Thread(target=background_check, args=(mr.id, normalized, meter.id, request.user.id if hasattr(request, 'user') else None), daemon=True).start()

        return Response({'status': 'pending', 'id': mr.id, 'message': 'Verification scheduled'}, status=202)

    @action(detail=True, methods=['post'])
    def apply_token(self, request, pk=None):
        """Apply a token to a meter even if it's not in TokenPool. Use for external validation flows.

        Accepts: token (string), units (optional decimal), force (boolean)
        """
        meter = self.get_object()
        token_code = request.data.get('token')
        units_val = request.data.get('units')
        force = bool(request.data.get('force'))
        from decimal import Decimal

        if meter.user.id != request.user.id:
            return Response({'detail': 'Unauthorized'}, status=403)

        token_code = (token_code or '').strip()
        if not token_code:
            return Response({'detail': 'token required'}, status=400)

        normalized = ''.join([c for c in token_code if c.isalnum()])

        # If token already exists in Token -> reject or success depending on meter
        existing = Token.objects.filter(token_code=normalized).first()
        if existing:
            if existing.meter_id == meter.id:
                return Response({'status': 'success', 'message': 'Token already applied to this meter', 'units': existing.units}, status=200)
            return Response({'status': 'rejected', 'message': 'Token already used on another meter', 'units': existing.units}, status=400)

        # Try pool
        try:
            with db_transaction.atomic():
                pool = TokenPool.objects.select_for_update(skip_locked=True).filter(token_code=normalized, is_allocated=False).first()
                if pool:
                    pool.is_allocated = True
                    pool.allocated_at = timezone.now()
                    try:
                        pool.allocated_to = request.user
                    except Exception:
                        pass
                    pool.save(update_fields=['is_allocated', 'allocated_at', 'allocated_to'])
                    units = pool.units or Decimal('0')
                else:
                    if units_val is None and not force:
                        return Response({'detail': 'token not found in pool; provide units or set force=true'}, status=404)
                    units = Decimal(str(units_val)) if units_val is not None else Decimal('0')

            # create Token and update meter
            token_obj = Token.objects.create(meter=meter, token_code=normalized, amount=Decimal('0.00'), units=units)
            try:
                meter.current_balance = (meter.current_balance or Decimal('0')) + units
                meter.last_top_up = timezone.now()
                meter.save(update_fields=['current_balance', 'last_top_up'])
            except Exception:
                pass

            mr = ManualRecharge.objects.create(token_code=normalized, meter=meter, user=request.user, units=units, status='success', applied_at=timezone.now(), message='Applied via apply_token')
            return Response({'status': 'success', 'id': mr.id, 'units': str(units)})
        except Exception as e:
            return Response({'status': 'failed', 'message': str(e)}, status=500)

class TokenViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TokenSerializer
    
    def get_queryset(self):
        return Token.objects.filter(meter__user=self.request.user)


class AutoRechargeViewSet(viewsets.ViewSet):
    """Simple endpoints for managing user auto-recharge configuration and events."""

    def get_config(self, request):
        obj, _ = AutoRechargeConfig.objects.get_or_create(user=request.user)
        serializer = AutoRechargeConfigSerializer(obj)
        return Response(serializer.data)

    def save_config(self, request):
        obj, _ = AutoRechargeConfig.objects.get_or_create(user=request.user)
        serializer = AutoRechargeConfigSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # If apply_to_all is true, optionally update meters defaults
            if serializer.validated_data.get('apply_to_all'):
                # apply defaults to meters where fields are empty
                meters = Meter.objects.filter(user=request.user)
                update_fields = []
                for m in meters:
                    changed = False
                    if obj.default_threshold is not None and (m.auto_recharge_threshold is None):
                        m.auto_recharge_threshold = obj.default_threshold
                        changed = True
                    if obj.default_amount is not None and (m.auto_recharge_amount is None):
                        m.auto_recharge_amount = obj.default_amount
                        changed = True
                    if changed:
                        m.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def list_events(self, request):
        qs = AutoRechargeEvent.objects.filter(user=request.user).order_by('-triggered_at')
        serializer = AutoRechargeEventSerializer(qs, many=True)
        return Response(serializer.data)

    def trigger_for_meter(self, request, pk=None):
        """Manually trigger an auto-recharge attempt for a meter (developer action)."""
        try:
            meter = Meter.objects.get(pk=int(pk), user=request.user)
        except Exception:
            return Response({'detail': 'Meter not found'}, status=404)
        amount = request.data.get('amount')
        ev = AutoRechargeEvent.objects.create(user=request.user, meter=meter, amount=amount or None, status='pending')
        return Response({'status': 'triggered', 'id': ev.id})

    @action(detail=False, methods=['post'], url_path='run-now')
    def run_now(self, request):
        """Trigger auto-recharge checks for the current user and run them synchronously in a background thread.

        This endpoint returns immediately with a 'started' response while the actual
        work is performed in a daemon thread. The work writes AutoRechargeEvent rows
        to the database so the frontend can poll `/events/` to see the results.
        """
        from .utils import run_autorecharge_for_user
        import threading

        user = request.user

        def worker():
            try:
                # Force a run to ensure an attempt even if config is disabled
                run_autorecharge_for_user(user, force=True)
            except Exception:
                # swallow exceptions — events/errors are recorded to DB by the util
                pass

        t = threading.Thread(target=worker, daemon=True)
        t.start()
        return Response({'status': 'started'})