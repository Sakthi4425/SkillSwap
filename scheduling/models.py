from django.db import models
from django.contrib.auth.models import User
from skills.models import Skill
from datetime import timedelta  # <-- 1. IMPORT timedelta

class Session(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    teacher = models.ForeignKey(User, related_name='teaching_sessions', on_delete=models.CASCADE)
    learner = models.ForeignKey(User, related_name='learning_sessions', on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, null=True, blank=True)
    scheduled_time = models.DateTimeField(null=True, blank=True)
    
    # --- 2. ADD THIS FIELD ---
    end_time = models.DateTimeField(null=True, blank=True)
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    meeting_link = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f'{self.skill.name} session with {self.teacher.username} and {self.learner.username}'

    # --- 3. ADD THIS SAVE METHOD ---
    # This will auto-set the end_time if a teacher only provides a start_time
    # It also handles the new case where both are provided.
    def save(self, *args, **kwargs):
        if self.scheduled_time and not self.end_time:
            self.end_time = self.scheduled_time + timedelta(hours=1)
        super().save(*args, **kwargs)

class Feedback(models.Model):
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]
    
    session = models.OneToOneField(Session, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Feedback for session {self.session.id}'
    
class Notification(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    session = models.ForeignKey(Session, on_delete=models.CASCADE, null=True, blank=True)
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Notification for {self.recipient.username}: {self.message}'

    class Meta:
        ordering = ['-created_at']