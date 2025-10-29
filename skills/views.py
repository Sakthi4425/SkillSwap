# skills/views.py
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from users.models import Profile
from scheduling.models import Session
from django.db.models import Q

# skills/views.py

@login_required
def skill_match_view(request):
    user_profile = request.user.profile
    
    # Get skills the user wants to learn
    skills_to_learn = user_profile.skills_to_learn.all()
    
    # --- START OF NEW LOGIC ---
    # 1. Find all teacher IDs (user IDs) with whom the learner
    #    already has an active session ('pending' OR 'confirmed').
    active_teacher_ids = Session.objects.filter(
        learner=request.user,
        status__in=['pending', 'confirmed']
    ).values_list('teacher_id', flat=True)
    # --- END OF NEW LOGIC ---

    # Find profiles of users who can teach one of those skills
    matches = Profile.objects.filter(
        skills_to_teach__in=skills_to_learn
    ).exclude(
        user=request.user  # Exclude the user themselves
    ).exclude(
        user_id__in=active_teacher_ids  # <-- 2. ADD THIS EXCLUSION
    ).distinct()
    
    context = {
        'matches': matches
    }
    return render(request, 'skills/matches.html', context)