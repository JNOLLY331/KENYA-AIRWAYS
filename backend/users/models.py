from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Email is already in AbstractUser, but we make it unique
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, unique=True)
    is_staff_member = models.BooleanField(default=False)

    # Use email as the primary login identifier instead of username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'phone_number']

    def __str__(self):
        return self.email