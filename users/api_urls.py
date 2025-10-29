from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import UserViewSet, EndorsementViewSet
from .api_auth import signup, login

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'endorsements', EndorsementViewSet, basename='endorsement')

urlpatterns = [
    path('auth/signup/', signup, name='signup'),
    path('auth/login/', login, name='login'),
    path('', include(router.urls)),
]

