# users/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required 
from .forms import ProfileUpdateForm                      
from .models import Profile
from django.contrib.auth.models import User
from scheduling.models import Feedback
from django.db.models import Avg
from skills.models import Skill


def home(request):
    if request.user.is_authenticated:
        return redirect('session_dashboard')
    return render(request, 'home.html')

def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}! You can now log in.')
            return redirect('login')
    else:
        form = UserCreationForm()
    return render(request, 'users/signup.html', {'form': form})

@login_required
def profile(request):
    Profile.objects.get_or_create(user=request.user)
    
    if request.method == 'POST':
        # Pass request.POST and request.FILES to the form
        p_form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user.profile)
        
        if p_form.is_valid():
            profile = p_form.save() # Save bio and image first

            # --- 1. Process "Skills to Teach" ---
            teach_skills_str = p_form.cleaned_data.get('teach_skills_input', '')
            profile.skills_to_teach.clear() # Clear old skills
            teach_skill_names = [name.strip().title() for name in teach_skills_str.split(',') if name.strip()]
            
            for name in teach_skill_names:
                skill, created = Skill.objects.get_or_create(name=name)
                profile.skills_to_teach.add(skill)

            # --- 2. Process "Skills to Learn" ---
            learn_skills_str = p_form.cleaned_data.get('learn_skills_input', '')
            profile.skills_to_learn.clear() # Clear old skills
            learn_skill_names = [name.strip().title() for name in learn_skills_str.split(',') if name.strip()]
            
            for name in learn_skill_names:
                skill, created = Skill.objects.get_or_create(name=name)
                profile.skills_to_learn.add(skill)

            messages.success(request, 'Your profile has been updated!')
            return redirect('profile')

    else: 
        p_form = ProfileUpdateForm(instance=request.user.profile)

        teach_skills = ', '.join([skill.name for skill in request.user.profile.skills_to_teach.all()])
        learn_skills = ', '.join([skill.name for skill in request.user.profile.skills_to_learn.all()])
        
        p_form.fields['teach_skills_input'].initial = teach_skills
        p_form.fields['learn_skills_input'].initial = learn_skills

    context = {
        'p_form': p_form
    }
    return render(request, 'users/profile.html', context)

def public_profile(request, user_id):
    profile_user = get_object_or_404(User, id=user_id)
    
    feedbacks = Feedback.objects.filter(session__teacher=profile_user).order_by('-created_at')

    average_rating = feedbacks.aggregate(Avg('rating'))['rating__avg']

    context = {
        'profile_user': profile_user,  
        'feedbacks': feedbacks,
        'average_rating': average_rating
    }
    return render(request, 'users/public_profile.html', context)
