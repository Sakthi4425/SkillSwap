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
        p_form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user.profile)
        
        if p_form.is_valid():
            p_form.save()
            messages.success(request, 'Your profile has been updated!')
            return redirect('profile')
    else:
        p_form = ProfileUpdateForm(instance=request.user.profile)

    context = {
        'p_form': p_form
    }
    return render(request, 'users/profile.html', context)

def public_profile(request, user_id):
    profile_user = get_object_or_404(User, id=user_id)
    
    feedbacks = Feedback.objects.filter(session__teacher=profile_user).order_by('-created_at')

    average_rating = feedbacks.aggregate(Avg('rating'))['rating__avg']

    context = {
        'profile_user': profile_user,  # The user whose profile is being viewed
        'feedbacks': feedbacks,
        'average_rating': average_rating
    }
    return render(request, 'users/public_profile.html', context)
