from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from .models import Skill, Category
from .serializers import SkillSerializer, CategorySerializer
from users.models import Profile
from scheduling.models import Session
from django.db.models import Q
from users.serializers import ProfileSerializer
from .models import Skill, Category

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
        
        # Get query params from the URL
        search_query = request.query_params.get('search', None)
        category_id = request.query_params.get('category', None)

        # Get skills the user wants to learn
        skills_to_learn = user_profile.skills_to_learn.all()
        
        # Find profiles of users who can teach those skills
        # We removed the filter for active sessions here.
        matches = Profile.objects.filter(
            skills_to_teach__in=skills_to_learn
        ).exclude(
            user=request.user
        )
        
        # Apply search filter if it exists
        if search_query:
            matches = matches.filter(
                Q(user__username__icontains=search_query) |
                Q(skills_to_teach__name__icontains=search_query)
            )
            
        # Apply category filter if it exists
        if category_id:
            matches = matches.filter(
                skills_to_teach__category_id=category_id
            )
        
        # Add distinct at the end
        matches = matches.distinct()
        
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
