from decimal import Decimal
from django.utils import timezone
from .models import AutoRechargeConfig, AutoRechargeEvent, Meter
from django.db import transaction as db_transaction
import logging

logger = logging.getLogger('meters.autorecharge')

# create notifications when events are created/executed
try:
    from notifications.models import Notification
except Exception:
    Notification = None


def run_autorecharge_for_user(user, stdout=None, force: bool = False):
    """Run autorecharge checks for a single user.

    This scans the user's AutoRechargeConfig and their meters, creating
    AutoRechargeEvent rows and performing the same mock execution as the
    management command. Returns a dict with summary information.
    """
    summary = {'triggered': 0, 'executed': 0, 'failed': 0}
    try:
        cfg = None
        try:
            cfg = AutoRechargeConfig.objects.get(user=user)
        except AutoRechargeConfig.DoesNotExist:
            return summary

        if not cfg.enabled and not force:
            return summary

        meters = Meter.objects.filter(user=user)
        for m in meters:
            try:
                balance = Decimal(str(m.current_balance or 0))
                threshold = Decimal(str(cfg.default_threshold or (m.auto_recharge_threshold or 0)))
                # When forced, attempt even if cfg is disabled; otherwise require enabled
                # If force is True, attempt regardless of threshold/balance
                should_attempt = True if force else ((balance < threshold) if threshold is not None else True)
                if (force or cfg.enabled) and should_attempt:
                    ev = AutoRechargeEvent.objects.create(user=user, meter=m, status='pending', amount=cfg.default_amount or m.auto_recharge_amount or None, message='Triggered by run_autorecharge')
                    # create a notification for trigger (best-effort)
                    try:
                        if Notification is not None:
                            Notification.objects.create(
                                user=user,
                                notification_type='system',
                                title='Auto recharge triggered',
                                message=f'Auto recharge triggered for meter {m.meter_number or m.id}. Amount: {ev.amount or "N/A"}'
                            )
                    except Exception:
                        pass
                    if stdout:
                        try:
                            stdout.write(f'Triggered auto-recharge for meter {m.id} user {user.id} event {ev.id}\n')
                        except Exception:
                            pass
                    # attempt execution (mock)
                    try:
                        # amount represents the kWh to add
                        requested_units = Decimal(str(ev.amount or 0))
                        if requested_units > 0:
                            # Attempt to allocate a TokenPool token matching the requested units
                            from .models import TokenPool, Token, TokenPurchase

                            allocated_token = None
                            allocated_units = None
                            allocated_amount = None
                            try:
                                with db_transaction.atomic():
                                    # try to find a pool token with matching units first
                                    pool_token = TokenPool.objects.select_for_update(skip_locked=True).filter(is_allocated=False, units=requested_units).first()
                                    if not pool_token:
                                        # fallback: any unallocated token
                                        pool_token = TokenPool.objects.select_for_update(skip_locked=True).filter(is_allocated=False).first()

                                    if pool_token:
                                        pool_token.is_allocated = True
                                        pool_token.allocated_at = timezone.now()
                                        try:
                                            pool_token.allocated_to = user
                                        except Exception:
                                            pool_token.allocated_to = None
                                        pool_token.allocated_transaction_id = f'auto-{user.id}-{m.id}-{int(timezone.now().timestamp())}'
                                        pool_token.save()

                                        allocated_token = pool_token.token_code
                                        allocated_units = pool_token.units or requested_units
                                        allocated_amount = pool_token.amount or None
                                    else:
                                        # no pool token available; generate synthetic token code
                                        allocated_token = f'AUTO-{user.id}-{m.id}-{int(timezone.now().timestamp())}'
                                        allocated_units = requested_units
                                        allocated_amount = None

                                    # create Token for meter
                                    Token.objects.create(meter=m, token_code=allocated_token, amount=allocated_amount or Decimal('0.00'), units=allocated_units)

                                    # create TokenPurchase audit
                                    TokenPurchase.objects.create(token_code=allocated_token, meter=m, user=user, amount=allocated_amount or Decimal('0.00'), units=allocated_units)

                                    # update meter balance
                                    m.current_balance = (m.current_balance or Decimal('0')) + allocated_units
                                    m.last_top_up = timezone.now()
                                    m.save(update_fields=['current_balance', 'last_top_up'])

                                    ev.status = 'completed'
                                    ev.executed_at = timezone.now()
                                    ev.message = f'Auto recharge executed; token {allocated_token} applied.'
                                    ev.save(update_fields=['status', 'executed_at', 'message'])
                                    summary['executed'] += 1

                                    # create notification for success
                                    try:
                                        if Notification is not None:
                                            Notification.objects.create(
                                                user=user,
                                                notification_type='payment',
                                                title='Auto recharge completed',
                                                message=f'Auto recharge of {allocated_units} kWh completed for meter {m.meter_number or m.id}. Token: {allocated_token}'
                                            )
                                    except Exception:
                                        pass
                            except Exception as e:
                                # on any allocation error mark event failed and log
                                ev.status = 'failed'
                                ev.message = f'Allocation error: {str(e)}'
                                ev.save(update_fields=['status', 'message'])
                                summary['failed'] += 1
                                try:
                                    logger.exception('Auto-recharge allocation error', extra={'user_id': getattr(user, 'id', None), 'meter_id': getattr(m, 'id', None), 'event_id': getattr(ev, 'id', None)})
                                except Exception:
                                    # swallowing to avoid cascading failures
                                    pass
                        else:
                            ev.status = 'failed'
                            ev.message = 'No amount configured'
                            ev.save(update_fields=['status', 'message'])
                            summary['failed'] += 1
                            # notification for failed config
                            try:
                                if Notification is not None:
                                    Notification.objects.create(
                                        user=user,
                                        notification_type='alert',
                                        title='Auto recharge failed',
                                        message=f'Auto recharge failed for meter {m.meter_number or m.id}: no amount configured.'
                                    )
                            except Exception:
                                pass
                    except Exception as e:
                        ev.status = 'failed'
                        ev.message = f'Execution error: {str(e)}'
                        ev.save(update_fields=['status', 'message'])
                        summary['failed'] += 1
                    summary['triggered'] += 1
            except Exception:
                # skip problematic meters
                continue
    except Exception:
        pass
    return summary
