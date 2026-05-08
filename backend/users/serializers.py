import re
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

# ── Phone validator (E.164 Kenyan +254XXXXXXXXX) ──────────────────────
_PHONE_RE = re.compile(r'^\+254\d{9}$')


def validate_kenyan_phone(value: str) -> str:
    """Normalize and validate Kenyan E.164 phone numbers."""
    # Auto-convert 07XXXXXXXX → +2547XXXXXXXX
    v = value.strip()
    if re.match(r'^07\d{8}$', v):
        v = '+254' + v[1:]
    elif re.match(r'^7\d{8}$', v):
        v = '+254' + v
    elif re.match(r'^2547\d{8}$', v):
        v = '+' + v
    if not _PHONE_RE.match(v):
        raise serializers.ValidationError(
            "Phone must be a valid Kenyan number: +254XXXXXXXXX "
            "(or 07XXXXXXXX / 7XXXXXXXX — we'll format it automatically)."
        )
    return v


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    phone_number = serializers.CharField()

    class Meta:
        model = User
        fields = ('username', 'email', 'phone_number', 'password')

    def validate_phone_number(self, value):
        return validate_kenyan_phone(value)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value.lower()

    def create(self, validated_data):
        # Create user — no email verification required; account is active immediately.
        user = User.objects.create_user(**validated_data)
        user.is_email_verified = True
        user.save(update_fields=['is_email_verified'])
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = authenticate(
            request=self.context.get('request'),
            username=email,          # EmailBackend uses email as username
            password=password
        )

        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        refresh = RefreshToken.for_user(user)

        return {
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'phone_number': user.phone_number,
                'is_staff': user.is_staff,
                'is_staff_member': user.is_staff_member,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }