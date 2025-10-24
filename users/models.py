# users/models.py
from django.db import models
from django.contrib.auth.models import User

from skills.models import Skill 

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)

    image = models.ImageField(default='default.jpg', upload_to='profile_pics')
    
    skills_to_teach = models.ManyToManyField(Skill, related_name='teachers', blank=True)
    skills_to_learn = models.ManyToManyField(Skill, related_name='learners', blank=True)

    def __str__(self):
        return f'{self.user.username} Profile'