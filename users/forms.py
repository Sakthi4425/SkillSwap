# users/forms.py
from django import forms
from .models import Profile

class ProfileUpdateForm(forms.ModelForm):
    # These are the new text fields the user will see
    teach_skills_input = forms.CharField(
        required=False,
        label="Skills You Can Teach",
        help_text="Enter skills separated by a comma (e.g., Python, Guitar, Cooking)"
    )
    learn_skills_input = forms.CharField(
        required=False,
        label="Skills You Want to Learn",
        help_text="Enter skills separated by a comma (e.g., React, Spanish, Piano)"
    )

    class Meta:
        model = Profile
        # We only include fields that are directly on the model
        fields = ['image', 'bio']
        widgets = {
            'image': forms.FileInput(),
            'bio': forms.Textarea(attrs={'rows': 4}), # Add this for a cleaner bio box
        }