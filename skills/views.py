# skills/views.py
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from users.models import Profile

@login_required
def skill_match_view(request):
    user_profile = request.user.profile
    
    # Get skills the user wants to learn
    skills_to_learn = user_profile.skills_to_learn.all()
    
    # Find profiles of users who can teach one of those skills
    # Exclude the user themselves
    matches = Profile.objects.filter(
        skills_to_teach__in=skills_to_learn
    ).exclude(
        user=request.user
    ).distinct() # Use distinct() to avoid duplicate profiles
    
    context = {
        'matches': matches
    }
    return render(request, 'skills/matches.html', context)