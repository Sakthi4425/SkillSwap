# scheduling/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.session_dashboard, name='session_dashboard'),
    path('request-session/<int:teacher_id>/<int:skill_id>/', views.request_session, name='request_session'),
    path('update-session/<int:session_id>/<str:new_status>/', views.update_session_status, name='update_session_status'),
    path('update-link/<int:session_id>/', views.update_session_link, name='update_session_link'),
    path('add-feedback/<int:session_id>/', views.add_feedback, name='add_feedback'),
]