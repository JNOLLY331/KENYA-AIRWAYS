import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.views import _send_verification_email
from users.models import User

# test creating user
user, created = User.objects.get_or_create(email="test29@example.com", defaults={"password": "password", "username":"test29", "phone_number":"+254000000029", "is_email_verified": False})

print("User created:", user.email, user.email_verification_token)

try:
    _send_verificationit _email(user)
    print("Verification email sent.")
except Exception as e:
    print("Error sending email:", e)
