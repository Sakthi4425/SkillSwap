from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from .models import Skill, Category
from .serializers import SkillSerializer, CategorySerializer
from users.models import Profile
from scheduling.models import Session
from django.db.models import Q

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @action(detail=False, methods=['get'])
    def matches(self, request):
        user_profile = request.user.profile
        
        # Get skills the user wants to learn
        skills_to_learn = user_profile.skills_to_learn.all()
        
        # Find teacher IDs with active sessions (pending or confirmed)
        active_teacher_ids = Session.objects.filter(
            learner=request.user,
            status__in=['pending', 'confirmed']
        ).values_list('teacher_id', flat=True)
        
        # Find profiles of users who can teach those skills
        matches = Profile.objects.filter(
            skills_to_teach__in=skills_to_learn
        ).exclude(
            user=request.user
        ).exclude(
            user_id__in=active_teacher_ids
        ).distinct()
        
        # Serialize the matches
        from users.serializers import ProfileSerializer
        serializer = ProfileSerializer(matches, many=True, context={'request': request})
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search for skills by name"""
        query = request.query_params.get('q', '').strip()
        
        if not query:
            return Response({'results': []})
        
        skills = Skill.objects.filter(name__icontains=query)[:10]
        serializer = self.get_serializer(skills, many=True)
        
        return Response({'results': serializer.data})
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get skills by category"""
        category_id = request.query_params.get('category_id')
        
        if category_id:
            skills = Skill.objects.filter(category_id=category_id)
        else:
            skills = Skill.objects.all()
        
        serializer = self.get_serializer(skills, many=True)
        return Response(serializer.data)
