# users/models.py
from django.db import models
from django.contrib.auth.models import User
from PIL import Image # Still keep for resizing uploads
import os
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.ImageField(default='profile_pics/default.jpg', upload_to='profile_pics')
    bio = models.TextField(max_length=500, blank=True)
    skills_to_teach = models.ManyToManyField('skills.Skill', related_name='teachers', blank=True)
    skills_to_learn = models.ManyToManyField('skills.Skill', related_name='learners', blank=True)

    def __str__(self):
        return f'{self.user.username} Profile'

    # Keep the image resizing for uploads
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        # Only resize if a custom image was uploaded and exists
        if self.image and self.image.name != 'profile_pics/default_placeholder.png':
            try:
                img_path = self.image.path
                if os.path.exists(img_path): # Check if file exists before opening
                    img = Image.open(img_path)
                    if img.height > 300 or img.width > 300:
                        output_size = (300, 300)
                        img.thumbnail(output_size)
                        img.save(img_path)
            except FileNotFoundError:
                 print(f"Warning: Image file not found for user {self.user.username} at {self.image.path} during save.")
            except Exception as e:
                print(f"Error processing image for user {self.user.username}: {e}")

class Endorsement(models.Model):
    """Users can endorse others for specific skills"""
    endorser = models.ForeignKey(User, related_name='given_endorsements', on_delete=models.CASCADE)
    endorsee = models.ForeignKey(User, related_name='received_endorsements', on_delete=models.CASCADE)
    skill = models.ForeignKey('skills.Skill', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('endorser', 'endorsee', 'skill')  # Prevent duplicate endorsements
    
    def __str__(self):
        return f'{self.endorser.username} endorses {self.endorsee.username} for {self.skill.name}'

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()