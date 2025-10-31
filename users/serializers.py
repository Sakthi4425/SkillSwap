from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile
from skills.models import Skill
from scheduling.models import Feedback, Session
from scheduling.serializers import FeedbackSerializer
from django.db.models import Q, Max  # <-- 1. IMPORT Max

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']

class ProfileSerializer(serializers.ModelSerializer):
    skills_to_teach = SkillSerializer(many=True, read_only=True)
    skills_to_learn = SkillSerializer(many=True, read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    image = serializers.SerializerMethodField()
    received_feedback = serializers.SerializerMethodField()
    is_busy = serializers.SerializerMethodField()
    
    # --- 2. ADD THE NEW FIELD ---
    active_session_end_time = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        # --- 3. ADD THE NEW FIELD TO THE LIST ---
        fields = ['user_id', 'username', 'image', 'bio', 
                  'skills_to_teach', 'skills_to_learn', 
                  'received_feedback', 'is_busy', 
                  'active_session_end_time'] # <-- Added here
        read_only_fields = ['user_id', 'username']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            try:
                return request.build_absolute_uri(obj.image.url)
            except:
                return None
        return None

    def get_received_feedback(self, obj):
        try:
            feedbacks = Feedback.objects.filter(session__teacher=obj.user).order_by('-created_at')
            serializer = FeedbackSerializer(feedbacks, many=True, context=self.context)
            return serializer.data
        except Feedback.DoesNotExist:
            return []

    def get_is_busy(self, obj):
        # This logic stays the same
        is_busy = Session.objects.filter(
            (Q(teacher=obj.user) | Q(learner=obj.user)) &
            Q(status__in=['pending', 'confirmed'])
        ).exists()
        return is_busy

    # --- 4. ADD THE NEW METHOD ---
    def get_active_session_end_time(self, obj):
        """
        Finds the latest 'end_time' from all pending or confirmed sessions
        for this user.
        """
        latest_session = Session.objects.filter(
            (Q(teacher=obj.user) | Q(learner=obj.user)) &
            Q(status__in=['pending', 'confirmed'])
        ).aggregate(latest_end=Max('end_time'))
        
        # This will return the datetime object or None
        return latest_session.get('latest_end')

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']