from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import SkillViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),
]