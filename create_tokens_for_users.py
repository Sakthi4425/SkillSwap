"""
Script to create tokens for existing users who don't have them
Run this once after migration
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillswap_project.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

# Create tokens for all existing users
users = User.objects.all()
tokens_created = 0

for user in users:
    token, created = Token.objects.get_or_create(user=user)
    if created:
        tokens_created += 1
        print(f"Created token for user: {user.username}")
    else:
        print(f"Token already exists for user: {user.username}")

print(f"\nTotal tokens created: {tokens_created}")

