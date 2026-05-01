import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    """
    Custom user model:
      - Unique email as the login identifier
      - Kenyan E.164 phone number (+254XXXXXXXXX)
      - Email verified flag + token for the verification flow
      - Password-reset token (time-limited)
    """
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, unique=True)
    is_staff_member = models.BooleanField(default=False)

    # ── Email verification ────────────────────────────────
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.UUIDField(
        default=uuid.uuid4, editable=False, unique=True
    )

    # ── Password reset ────────────────────────────────────
    password_reset_token = models.UUIDField(null=True, blank=True, unique=True)
    password_reset_token_created_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'phone_number']

    def __str__(self):
        return self.email

    # ── Helpers ───────────────────────────────────────────
    def generate_password_reset_token(self):
        """Create a fresh one-time reset token (valid 1 h)."""
        self.password_reset_token = uuid.uuid4()
        self.password_reset_token_created_at = timezone.now()
        self.save(update_fields=['password_reset_token', 'password_reset_token_created_at'])
        return self.password_reset_token

    def is_password_reset_token_valid(self):
        """Return True if token exists and was created within the last hour."""
        if not self.password_reset_token or not self.password_reset_token_created_at:
            return False
        return timezone.now() < self.password_reset_token_created_at + timedelta(hours=1)