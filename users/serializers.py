from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Endorsement
from skills.models import Skill

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']

class EndorsementSerializer(serializers.ModelSerializer):
    endorser_username = serializers.CharField(source='endorser.username', read_only=True)
    endorsee_username = serializers.CharField(source='endorsee.username', read_only=True)
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    
    class Meta:
        model = Endorsement
        fields = ['id', 'endorser', 'endorser_username', 'endorsee', 'endorsee_username', 
                  'skill', 'skill_name', 'created_at']
        read_only_fields = ['id', 'created_at']

class ProfileSerializer(serializers.ModelSerializer):
    skills_to_teach = SkillSerializer(many=True, read_only=True)
    skills_to_learn = SkillSerializer(many=True, read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = ['user_id', 'username', 'image', 'bio', 'skills_to_teach', 'skills_to_learn']
    
    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            try:
                return request.build_absolute_uri(obj.image.url)
            except:
                return None
        return None

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']

