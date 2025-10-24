# scheduling/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Session, User, Skill, Feedback
from django.db.models import Q
from .forms import SessionRequestForm, SessionUpdateForm, FeedbackForm
from django.contrib import messages


@login_required
def session_dashboard(request):
    # Find sessions where the user is either the learner OR the teacher
    user_sessions = Session.objects.filter(
        Q(learner=request.user) | Q(teacher=request.user)
    ).order_by('-scheduled_time') # Show newest first

    context = {
        'sessions': user_sessions
    }
    return render(request, 'scheduling/dashboard.html', context)


@login_required
def request_session(request, teacher_id, skill_id):
    # Get the teacher and skill objects from the URL
    teacher = get_object_or_404(User, id=teacher_id)
    skill = get_object_or_404(Skill, id=skill_id)
    
    if request.method == 'POST':
        form = SessionRequestForm(request.POST)
        if form.is_valid():
            # Create a new session object but don't save to database yet
            session = form.save(commit=False)
            session.teacher = teacher
            session.skill = skill
            session.learner = request.user
            session.status = 'pending' # Start as pending
            session.save()
            # Redirect to the dashboard to see the new pending session
            return redirect('session_dashboard')
    else:
        form = SessionRequestForm()

    context = {
        'form': form,
        'teacher': teacher,
        'skill': skill
    }
    return render(request, 'scheduling/request_session.html', context)


@login_required
def update_session_status(request, session_id, new_status):
    session = get_object_or_404(Session, id=session_id)

    # Security check: Only the teacher can update the status
    if request.user != session.teacher:
        messages.error(request, 'You are not authorized to update this session.')
        return redirect('session_dashboard')

    # Update the status based on the URL
    if new_status == 'confirm':
        session.status = 'confirmed'
        messages.success(request, 'Session confirmed!')
    elif new_status == 'cancel':
        session.status = 'cancelled'
        messages.warning(request, 'Session cancelled.')
        
    # --- THIS IS THE MISSING PART ---
    elif new_status == 'completed':
        session.status = 'completed'
        messages.success(request, 'Session marked as completed!')
    # --- END OF MISSING PART ---
    
    session.save() # This line saves the change
    return redirect('session_dashboard')


@login_required
def update_session_link(request, session_id):
    session = get_object_or_404(Session, id=session_id)

    # Security check: Only the teacher can add a link
    if request.user != session.teacher:
        messages.error(request, 'You are not authorized to update this session.')
        return redirect('session_dashboard')

    if request.method == 'POST':
        form = SessionUpdateForm(request.POST, instance=session)
        if form.is_valid():
            form.save()
            messages.success(request, 'Meeting link added!')
            return redirect('session_dashboard')
    else:
        form = SessionUpdateForm(instance=session)

    context = {
        'form': form,
        'session': session
    }
    return render(request, 'scheduling/update_link.html', context)


@login_required
def add_feedback(request, session_id):
    session = get_object_or_404(Session, id=session_id)

    # Security check 1: Only the learner can add feedback.
    if request.user != session.learner:
        messages.error(request, 'You are not authorized to give feedback for this session.')
        return redirect('session_dashboard')

    # Security check 2: Session must be completed.
    if session.status != 'completed':
        messages.error(request, 'You can only give feedback on completed sessions.')
        return redirect('session_dashboard')

    # Security check 3: Prevent duplicate feedback.
    if hasattr(session, 'feedback'):
        messages.error(request, 'You have already submitted feedback for this session.')
        return redirect('session_dashboard')

    if request.method == 'POST':
        form = FeedbackForm(request.POST)
        if form.is_valid():
            feedback = form.save(commit=False)
            feedback.session = session
            feedback.save()
            messages.success(request, 'Thank you for your feedback!')
            return redirect('session_dashboard')
    else:
        form = FeedbackForm()

    context = {
        'form': form,
        'session': session
    }
    return render(request, 'scheduling/add_feedback.html', context)