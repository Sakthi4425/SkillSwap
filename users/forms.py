# users/forms.py
from django import forms
from .models import Profile

class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['image', 'bio', 'skills_to_teach', 'skills_to_learn']
        
        widgets = {
            'image': forms.FileInput(),
            'skills_to_teach': forms.CheckboxSelectMultiple(attrs={'class': 'form-check-input'}),
            'skills_to_learn': forms.CheckboxSelectMultiple(attrs={'class': 'form-check-input'}),
        }