from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import SessionViewSet, FeedbackViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'feedback', FeedbackViewSet, basename='feedback')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]

