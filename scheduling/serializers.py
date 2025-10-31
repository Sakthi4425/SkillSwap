from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Session, Feedback, Notification
from skills.models import Skill

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class SessionSerializer(serializers.ModelSerializer):
    teacher = UserBasicSerializer(read_only=True)
    learner = UserBasicSerializer(read_only=True)
    skill = SkillSerializer(read_only=True)
    teacher_id = serializers.IntegerField(write_only=True, required=False)
    learner_id = serializers.IntegerField(write_only=True, required=False)
    skill_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Session
        fields = ['id', 'teacher', 'learner', 'skill', 'teacher_id', 'learner_id', 'skill_id', 
                  'scheduled_time', 'end_time', 'status', 'meeting_link', 'notes']
        read_only_fields = ['id', 'teacher', 'learner', 'skill']
        extra_kwargs = {
            'scheduled_time': {'required': False, 'allow_null': True},
            'end_time': {'required': False, 'allow_null': True}
        }

class FeedbackSerializer(serializers.ModelSerializer):
    learner_username = serializers.ReadOnlyField(source='session.learner.username')
    skill_name = serializers.ReadOnlyField(source='session.skill.name')

    class Meta:
        model = Feedback
        fields = ['id', 'session', 'rating', 'comment', 'created_at','learner_username', 'skill_name']
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'session': {'required': False, 'allow_null': True}
        }

class NotificationSerializer(serializers.ModelSerializer):

    session_id = serializers.ReadOnlyField(source='session.id')
    skill_name = serializers.ReadOnlyField(source='session.skill.name')
    learner_username = serializers.ReadOnlyField(source='session.learner.username')

    class Meta:
        model = Notification
        fields = [
            'id', 
            'message', 
            'is_read', 
            'created_at', 
            'session_id', 
            'skill_name',
            'learner_username'
        ]
        read_only_fields = fields