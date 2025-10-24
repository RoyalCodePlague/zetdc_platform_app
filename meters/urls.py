from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MeterViewSet, TokenViewSet, ManualRechargeViewSet
from .views import AutoRechargeViewSet

router = DefaultRouter()
router.register(r'meters', MeterViewSet, basename='meter')
router.register(r'tokens', TokenViewSet, basename='token')
router.register(r'recharges', ManualRechargeViewSet, basename='recharge')

urlpatterns = [
    path('', include(router.urls)),
    # Auto recharge endpoints (under /api/meters/... to align with meters routes)
    path('meters/auto-recharge/settings/', AutoRechargeViewSet.as_view({'get': 'get_config', 'post': 'save_config'}), name='auto-recharge-settings'),
    path('meters/auto-recharge/events/', AutoRechargeViewSet.as_view({'get': 'list_events'}), name='auto-recharge-events'),
    path('meters/auto-recharge/run-now/', AutoRechargeViewSet.as_view({'post': 'run_now'}), name='auto-recharge-run-now'),
    path('meters/auto-recharge/trigger/<int:pk>/', AutoRechargeViewSet.as_view({'post': 'trigger_for_meter'}), name='auto-recharge-trigger'),
]