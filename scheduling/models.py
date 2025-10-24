# scheduling/models.py
from django.db import models
from django.contrib.auth.models import User
from skills.models import Skill

class Session(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    teacher = models.ForeignKey(User, related_name='teaching_sessions', on_delete=models.CASCADE)
    learner = models.ForeignKey(User, related_name='learning_sessions', on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, on_delete=models.SET_NULL, null=True)
    scheduled_time = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    meeting_link = models.URLField(blank=True, null=True) # For teaching tools

    def __str__(self):
        return f'Session for {self.skill} between {self.teacher} and {self.learner}'

class Feedback(models.Model):
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]
    
    session = models.OneToOneField(Session, on_delete=models.CASCADE)
    # Assuming feedback is given *by* the learner *to* the teacher
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Feedback for session {self.session.id}'