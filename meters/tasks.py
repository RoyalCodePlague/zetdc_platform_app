from celery import shared_task
from django.core import management


@shared_task
def run_autorecharge_task():
    """Wrapper task that invokes the management command to run autorecharge checks.

    This keeps the actual logic in the management command but allows running it
    from Celery beat or ad-hoc with a worker.
    """
    try:
        management.call_command('run_autorecharge')
        return {'status': 'ok'}
    except Exception as e:
        # let Celery record the exception and optionally retry
        raise
