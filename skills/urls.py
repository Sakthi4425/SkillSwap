# skills/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('matches/', views.skill_match_view, name='matches'),
]