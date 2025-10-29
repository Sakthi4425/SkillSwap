from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Session, Feedback
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
                  'scheduled_time', 'status', 'meeting_link', 'notes']
        read_only_fields = ['id', 'teacher', 'learner', 'skill']

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'session', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']

