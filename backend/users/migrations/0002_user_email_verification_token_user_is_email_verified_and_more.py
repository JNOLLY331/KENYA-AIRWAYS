"""
Migration: Add email verification and password-reset fields.

Handles existing users by assigning unique UUIDs before enforcing uniqueness
and marking superusers as already verified.
"""
import uuid
from django.db import migrations, models


def assign_unique_tokens(apps, schema_editor):
    """Give every existing user a unique verification token."""
    User = apps.get_model('users', 'User')
    for user in User.objects.all():
        user.email_verification_token = uuid.uuid4()
        # Mark existing superusers / staff as already verified
        user.is_email_verified = user.is_superuser or user.is_staff
        user.save(update_fields=['email_verification_token', 'is_email_verified'])


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        # Step 1: Add fields without uniqueness constraints (allow nulls temporarily)
        migrations.AddField(
            model_name='user',
            name='email_verification_token',
            field=models.UUIDField(editable=False, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='user',
            name='is_email_verified',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='password_reset_token',
            field=models.UUIDField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='password_reset_token_created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),

        # Step 2: Populate unique tokens for every existing user
        migrations.RunPython(assign_unique_tokens, migrations.RunPython.noop),

        # Step 3: Now enforce uniqueness and set default for future rows
        migrations.AlterField(
            model_name='user',
            name='email_verification_token',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='password_reset_token',
            field=models.UUIDField(blank=True, null=True, unique=True),
        ),
    ]
