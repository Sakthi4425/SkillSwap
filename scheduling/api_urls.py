from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import SessionViewSet, FeedbackViewSet

router = DefaultRouter()
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'feedback', FeedbackViewSet, basename='feedback')

urlpatterns = [
    path('', include(router.urls)),
]

