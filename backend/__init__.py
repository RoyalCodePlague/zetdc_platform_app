try:
	from .celery import app as celery_app
	# Expose Celery app as a module-level variable for Django/Celery autodiscovery
	__all__ = ('celery_app',)
except Exception:
	# Celery is optional in development environments. If it's not installed
	# importing the celery app would raise ModuleNotFoundError and crash
	# Django startup. We silently ignore import errors here so the project
	# can run without Celery present. Install celery/redis in your venv to
	# enable the worker: `pip install -r requirements.txt`.
	celery_app = None
	__all__ = ()
