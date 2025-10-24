# scheduling/forms.py
from django import forms
from .models import Session, Feedback

class DateTimeInput(forms.DateTimeInput):
    # This tells the browser to use a nice date/time picker
    input_type = 'datetime-local'

class SessionRequestForm(forms.ModelForm):
    class Meta:
        model = Session
        # We only want the user to pick the time.
        # The view will handle who the teacher and learner are.
        fields = ['scheduled_time']
        widgets = {
            'scheduled_time': DateTimeInput(),
        }

class SessionUpdateForm(forms.ModelForm):
    class Meta:
        model = Session
        # We only want the teacher to update the meeting link
        fields = ['meeting_link']

class FeedbackForm(forms.ModelForm):
    class Meta:
        model = Feedback
        # The view will handle linking it to the session
        fields = ['rating', 'comment']
        widgets = {
            'rating': forms.Select(attrs={'class': 'form-select'}),
            'comment': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
        }