from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q
from skills.models import Skill
from .models import Session, Feedback
from .serializers import SessionSerializer, FeedbackSerializer

class SessionViewSet(viewsets.ModelViewSet):
    serializer_class = SessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Session.objects.filter(
            Q(learner=user) | Q(teacher=user)
        ).order_by('-scheduled_time')
    
    def perform_create(self, serializer):
        # Get IDs from request data
        teacher_id = self.request.data.get('teacher_id')
        skill_id = self.request.data.get('skill_id')
        
        # Get objects
        teacher = get_object_or_404(User, id=teacher_id)
        skill = get_object_or_404(Skill, id=skill_id)
        
        # Set the learner to the current user
        serializer.save(learner=self.request.user, teacher=teacher, skill=skill)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        session = self.get_object()
        
        # Only teacher can update status
        if request.user != session.teacher:
            return Response({'detail': 'Only the teacher can update session status'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        new_status = request.data.get('status')
        if new_status in ['pending', 'confirmed', 'completed', 'cancelled']:
            session.status = new_status
            session.save()
            serializer = self.get_serializer(session)
            return Response(serializer.data)
        
        return Response({'detail': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def update_meeting_link(self, request, pk=None):
        session = self.get_object()
        
        # Only teacher can update meeting link
        if request.user != session.teacher:
            return Response({'detail': 'Only the teacher can update meeting link'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        meeting_link = request.data.get('meeting_link')
        session.meeting_link = meeting_link
        session.save()
        serializer = self.get_serializer(session)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_notes(self, request, pk=None):
        session = self.get_object()
        
        # Both teacher and learner can update notes
        if request.user != session.teacher and request.user != session.learner:
            return Response({'detail': 'Only participants can update notes'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        notes = request.data.get('notes', '')
        session.notes = notes
        session.save()
        serializer = self.get_serializer(session)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def get_feedback(self, request, pk=None):
        """Get feedback for a session"""
        session = self.get_object()
        
        # Only participants can view feedback
        if request.user != session.teacher and request.user != session.learner:
            return Response({'detail': 'Only participants can view feedback'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        if hasattr(session, 'feedback'):
            from .serializers import FeedbackSerializer
            serializer = FeedbackSerializer(session.feedback)
            return Response(serializer.data)
        
        return Response({'detail': 'No feedback found'}, status=status.HTTP_404_NOT_FOUND)

class FeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Feedback.objects.all()
    
    def create(self, request, *args, **kwargs):
        session_id = request.data.get('session_id')
        try:
            session = Session.objects.get(id=session_id)
        except Session.DoesNotExist:
            return Response({'detail': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Only learner can give feedback
        if request.user != session.learner:
            return Response({'detail': 'Only the learner can give feedback'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Check if session is completed
        if session.status != 'completed':
            return Response({'detail': 'Feedback can only be given for completed sessions'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Check if feedback already exists
        if hasattr(session, 'feedback'):
            return Response({'detail': 'Feedback already exists for this session'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Create feedback
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(session=session)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

