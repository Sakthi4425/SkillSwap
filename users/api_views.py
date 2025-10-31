from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Q
from .models import Profile
from .serializers import UserSerializer, ProfileSerializer
from skills.models import Skill

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @action(detail=False, methods=['get'])
    def current_user(self, request):
        if request.user.is_authenticated:
            serializer = self.get_serializer(request.user, context={'request': request})
            return Response(serializer.data)
        return Response({'detail': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=True, methods=['post'])
    def update_profile(self, request, pk=None):
        user = request.user
        if user.id != int(pk):
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        profile = user.profile
        
        # Update bio
        if 'bio' in request.data:
            profile.bio = request.data['bio']
        
        # Handle image upload
        if 'image' in request.FILES:
            profile.image = request.FILES['image']
        elif 'image' in request.data and request.data['image']:
            profile.image = request.data['image']
        
        # Handle skills to teach
        if 'skills_to_teach' in request.data:
            teach_skills_str = request.data['skills_to_teach']
            profile.skills_to_teach.clear()
            teach_skill_names = [name.strip().title() for name in teach_skills_str.split(',') if name.strip()]
            for name in teach_skill_names:
                skill, created = Skill.objects.get_or_create(name=name)
                profile.skills_to_teach.add(skill)
        
        # Handle skills to learn
        if 'skills_to_learn' in request.data:
            learn_skills_str = request.data['skills_to_learn']
            profile.skills_to_learn.clear()
            learn_skill_names = [name.strip().title() for name in learn_skills_str.split(',') if name.strip()]
            for name in learn_skill_names:
                skill, created = Skill.objects.get_or_create(name=name)
                profile.skills_to_learn.add(skill)
        
        profile.save()
        serializer = ProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)
