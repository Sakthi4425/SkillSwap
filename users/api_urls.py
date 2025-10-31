from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import UserViewSet
from .api_auth import signup, login

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('auth/signup/', signup, name='signup'),
    path('auth/login/', login, name='login'),
    path('', include(router.urls)),
]

