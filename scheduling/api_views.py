from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q
from skills.models import Skill
from .models import Session, Feedback, Notification
from .serializers import SessionSerializer, FeedbackSerializer, NotificationSerializer

# --- 1. ADD THESE IMPORTS ---
from datetime import datetime
from django.utils import timezone

class SessionViewSet(viewsets.ModelViewSet):
    serializer_class = SessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Session.objects.filter(
            Q(learner=user) | Q(teacher=user)
        ).order_by('-scheduled_time')
    
    def perform_create(self, serializer):
        teacher_id = self.request.data.get('teacher_id')
        skill_id = self.request.data.get('skill_id')
        teacher = get_object_or_404(User, id=teacher_id)
        skill = get_object_or_404(Skill, id=skill_id)
        
        session = serializer.save(learner=self.request.user, teacher=teacher, skill=skill)
        
        Notification.objects.create(
            recipient=teacher,
            session=session,
            message=f"New session request from {self.request.user.username} for {skill.name}."
        )

    @action(detail=False, methods=['get'])
    def calendar_sessions(self, request):
        user = self.request.user
        queryset = Session.objects.filter(
            Q(learner=user) | Q(teacher=user),
            status__in=['pending', 'confirmed']
        ).order_by('scheduled_time')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    # --- 2. THIS ENTIRE FUNCTION IS REPLACED ---
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        session = self.get_object()
        
        if request.user != session.teacher:
            return Response({'detail': 'Only the teacher can update session status'}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        new_status = request.data.get('status')
        
        if new_status not in ['pending', 'confirmed', 'completed', 'cancelled']:
             return Response({'detail': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        if new_status == 'confirmed':
            # Get the time strings from React
            scheduled_time_str = request.data.get('scheduled_time')
            end_time_str = request.data.get('end_time')
            
            if not scheduled_time_str or not end_time_str:
                return Response(
                    {'detail': 'Start time and end time are required to confirm.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                # Convert the strings to "naive" datetime objects
                naive_start_time = datetime.strptime(scheduled_time_str, '%Y-%m-%dT%H:%M')
                naive_end_time = datetime.strptime(end_time_str, '%Y-%m-%dT%H:%M')

                # Make the datetimes "aware" of your project's timezone
                # This also fixes the "received a naive datetime" warning
                aware_start_time = timezone.make_aware(naive_start_time)
                aware_end_time = timezone.make_aware(naive_end_time)

                # Save the correct datetime objects to the model
                session.scheduled_time = aware_start_time
                session.end_time = aware_end_time
                
            except ValueError:
                return Response(
                    {'detail': 'Invalid datetime format. Expected YYYY-MM-DDTHH:MM'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        session.status = new_status
        session.save() # Now it saves the datetime objects
        
        learner = session.learner
        message = ""
        if new_status == 'confirmed':
            # This line will now work, because session.scheduled_time is a datetime object
            time_str = session.scheduled_time.strftime('%d/%m/%y at %I:%M %p')
            message = f"Your session for {session.skill.name} with {session.teacher.username} has been confirmed for {time_str}."
        elif new_status == 'cancelled':
            message = f"Your session for {session.skill.name} with {session.teacher.username} has been cancelled."
        
        if message:
            Notification.objects.create(
                recipient=learner,
                session=session,
                message=message
            )

        serializer = self.get_serializer(session)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_meeting_link(self, request, pk=None):
        session = self.get_object()
        
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
        session = self.get_object()
        
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
        
        if request.user != session.learner:
            return Response({'detail': 'Only the learner can give feedback'}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        if session.status != 'completed':
            return Response({'detail': 'Feedback can only be given for completed sessions'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        if hasattr(session, 'feedback'):
            return Response({'detail': 'Feedback already exists for this session'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(session=session)

            Notification.objects.create(
                recipient=session.teacher,
                session=session,
                message=f"{session.learner.username} left feedback for your {session.skill.name} session."
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.notifications.all()

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response(status=status.HTTP_204_NO_CONTENT)