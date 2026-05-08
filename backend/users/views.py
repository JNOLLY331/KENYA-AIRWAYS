"""
users/views.py — Authentication and password-reset views.

Flow:
  1. POST /api/users/register/       → creates user (immediately active, no email verification needed)
  2. POST /api/users/login/          → returns JWT tokens
  3. POST /api/users/request-password-reset/  → sends reset-link email
  4. Email link → /reset-password?token=<uuid> (frontend) → user submits:
     POST /api/users/confirm-password-reset/  → validates token, sets new password
"""
import logging

from django.conf import settings
from django.core.mail import send_mail
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User
from .serializers import RegisterSerializer, LoginSerializer

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────
# Registration
# ─────────────────────────────────────────────────────────────────────
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()  # is_email_verified=True set in serializer

        return Response({
            'message': 'Account created successfully. You can now log in.',
        }, status=status.HTTP_201_CREATED)


def _send_verification_email(user: User):
    """
    Build and send the email-verification link.
    The link points directly to the FRONTEND at /verify-email?token=<uuid>.
    The VerifyEmail.jsx page calls POST /api/users/verify-email/<token>/ and
    shows success / error feedback to the user — no cross-origin redirect needed.
    """
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    # Link → Frontend /verify-email?token=<uuid> → JS calls backend API → verified
    link = f"{frontend_url}/verify-email?token={user.email_verification_token}"
    try:
        send_mail(
            subject='Kenya Airways – Verify Your Email Address',
            message=(
                f"Hi {user.username},\n\n"
                f"Thank you for registering with Kenya Airways. "
                f"Click the link below to verify your email address:\n\n"
                f"{link}\n\n"
                f"This link is valid indefinitely. If you did not create this account, "
                f"please ignore this email.\n\n"
                f"— The Kenya Airways Team"
            ),
            html_message=(
                f"""
                <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;
                            border:1px solid #e0e0e0;border-radius:12px;">
                  <div style="background:#c01e2e;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
                    <h1 style="color:#fff;margin:0;font-size:22px;">✈ Kenya Airways</h1>
                    <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;">Verify Your Email Address</p>
                  </div>
                  <div style="padding:28px 24px;">
                    <p style="font-size:16px;color:#333;">Hi <strong>{user.username}</strong>,</p>
                    <p style="color:#555;line-height:1.7;">
                      Thank you for creating an account with Kenya Airways.
                      Please verify your email address by clicking the button below.
                    </p>
                    <div style="text-align:center;margin:32px 0;">
                      <a href="{link}"
                         style="background:#c01e2e;color:#fff;padding:14px 32px;border-radius:8px;
                                text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
                        Verify Email Address
                      </a>
                    </div>
                    <p style="font-size:12px;color:#999;">
                      Or copy this link into your browser:<br/>
                      <a href="{link}" style="color:#c01e2e;">{link}</a>
                    </p>
                  </div>
                  <div style="background:#f5f5f5;padding:12px;text-align:center;
                              border-radius:0 0 8px 8px;font-size:11px;color:#aaa;">
                    © {__import__('datetime').date.today().year} Kenya Airways Ltd.
                  </div>
                </div>
                """
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info("Verification email sent to %s", user.email)
    except Exception as exc:
        # Log the error so it's visible in the server console / Render logs
        logger.error("Failed to send verification email to %s: %s", user.email, exc)


# ─────────────────────────────────────────────────────────────────────
# Email verification
# ─────────────────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def verify_email(request, token):
    """
    GET /api/users/verify-email/<uuid:token>/

    Called by VerifyEmail.jsx via Axios (XHR) after the user clicks the
    email link (which now points to /verify-email?token=<uuid> on the frontend).

    Returns JSON so Axios can handle it without cross-origin redirect issues.
    On success: {"verified": true, "message": "..."}
    On failure: HTTP 400 {"error": "Invalid or already-used verification link."}
    """
    try:
        user = User.objects.get(email_verification_token=token)
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid or already-used verification link.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not user.is_email_verified:
        user.is_email_verified = True
        user.save(update_fields=['is_email_verified'])
        logger.info("Email verified for user %s", user.email)

    return Response({'verified': True, 'message': 'Email verified successfully.'})


# ─────────────────────────────────────────────────────────────────────
# Login
# ─────────────────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

    errors = serializer.errors

    # DRF converts dictionary values to lists of ErrorDetails.
    # We unpack them so the frontend receives a flat string for detail and code.
    if 'detail' in errors and 'code' in errors:
        detail = errors['detail'][0] if isinstance(errors['detail'], list) else errors['detail']
        code = errors['code'][0] if isinstance(errors['code'], list) else errors['code']
        return Response({'detail': detail, 'code': code}, status=status.HTTP_400_BAD_REQUEST)

    # Alternatively, if a simple ValidationError("string") was raised:
    non_field = errors.get('non_field_errors', [])
    if non_field and isinstance(non_field[0], dict):
        return Response(non_field[0], status=status.HTTP_400_BAD_REQUEST)

    return Response(errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────────
# Profile
# ─────────────────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def profile_view(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'phone_number': user.phone_number,
        'is_staff': user.is_staff,
        'is_staff_member': user.is_staff_member,
        'is_email_verified': user.is_email_verified,
    })


# ─────────────────────────────────────────────────────────────────────
# Logout
# ─────────────────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logged out successfully.'})
    except TokenError:
        return Response(
            {'error': 'Invalid or expired token.'},
            status=status.HTTP_400_BAD_REQUEST
        )


# ─────────────────────────────────────────────────────────────────────
# Admin create superuser
# ─────────────────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def create_superuser_view(request):
    try:
        user = User.objects.create_superuser(
            username=request.data['username'],
            email=request.data['email'],
            password=request.data['password'],
            phone_number=request.data.get('phone_number', '+254000000000')
        )
        # Superusers are always considered verified
        user.is_email_verified = True
        user.save(update_fields=['is_email_verified'])
        return Response({'message': 'Superuser created successfully.'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────────
# Password Reset — Step 1: request a link
# ─────────────────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def request_password_reset(request):
    """
    POST /api/users/request-password-reset/
    Body: { "email": "..." }
    Always returns 200 to avoid user-enumeration attacks.
    """
    email = request.data.get('email', '').strip().lower()
    try:
        user = User.objects.get(email__iexact=email)
        token = user.generate_password_reset_token()
        try:
            _send_password_reset_email(user, token)
        except Exception as exc:
            logger.error("Password reset email failed for %s: %s", user.email, exc)
    except User.DoesNotExist:
        pass   # Intentional — don't reveal whether the account exists

    return Response({
        'message': 'If an account with that email exists, a password-reset link has been sent.'
    })


def _send_password_reset_email(user: User, token):
    """Build and send the one-time password-reset link."""
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    link = f"{frontend_url}/reset-password?token={token}"
    try:
        send_mail(
            subject='Kenya Airways – Password Reset Request',
            message=(
                f"Hi {user.username},\n\n"
                f"We received a request to reset your Kenya Airways password.\n"
                f"Click the link below (valid for 1 hour):\n\n"
                f"{link}\n\n"
                f"If you did not request this, please ignore this email.\n\n"
                f"— The Kenya Airways Team"
            ),
            html_message=(
                f"""
                <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;
                            border:1px solid #e0e0e0;border-radius:12px;">
                  <div style="background:#c01e2e;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
                    <h1 style="color:#fff;margin:0;font-size:22px;">✈ Kenya Airways</h1>
                    <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;">Password Reset</p>
                  </div>
                  <div style="padding:28px 24px;">
                    <p style="font-size:16px;color:#333;">Hi <strong>{user.username}</strong>,</p>
                    <p style="color:#555;line-height:1.7;">
                      We received a request to reset your password.
                      Click the button below to choose a new password.
                      This link is valid for <strong>1 hour</strong>.
                    </p>
                    <div style="text-align:center;margin:32px 0;">
                      <a href="{link}"
                         style="background:#c01e2e;color:#fff;padding:14px 32px;border-radius:8px;
                                text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
                        Reset My Password
                      </a>
                    </div>
                    <p style="font-size:12px;color:#999;">
                      Or copy this link into your browser:<br/>
                      <a href="{link}" style="color:#c01e2e;">{link}</a>
                    </p>
                    <p style="font-size:12px;color:#bbb;">
                      If you did not request a password reset, you can safely ignore this email.
                    </p>
                  </div>
                  <div style="background:#f5f5f5;padding:12px;text-align:center;
                              border-radius:0 0 8px 8px;font-size:11px;color:#aaa;">
                    © {__import__('datetime').date.today().year} Kenya Airways Ltd.
                  </div>
                </div>
                """
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info("Password reset email sent to %s", user.email)
    except Exception as exc:
        logger.error("Failed to send password reset email to %s: %s", user.email, exc)


# ─────────────────────────────────────────────────────────────────────
# Password Reset — Step 2: submit new password with token
# ─────────────────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def confirm_password_reset(request):
    """
    POST /api/users/confirm-password-reset/
    Body: { "token": "<uuid>", "new_password": "..." }
    """
    token = request.data.get('token', '').strip()
    new_password = request.data.get('new_password', '')

    if not token or not new_password:
        return Response(
            {'error': 'Token and new_password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(new_password) < 8:
        return Response(
            {'error': 'Password must be at least 8 characters long.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(password_reset_token=token)
    except (User.DoesNotExist, Exception):
        return Response(
            {'error': 'Invalid or expired reset token.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not user.is_password_reset_token_valid():
        return Response(
            {'error': 'This reset link has expired. Please request a new one.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.set_password(new_password)
    user.password_reset_token = None
    user.password_reset_token_created_at = None
    user.save(update_fields=['password', 'password_reset_token', 'password_reset_token_created_at'])

    return Response({'message': 'Password reset successfully. You can now log in.'})


# ─────────────────────────────────────────────────────────────────────
# Resend verification email
# ─────────────────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def resend_verification_email(request):
    """
    POST /api/users/resend-verification/
    Body: { "email": "..." }
    """
    email = request.data.get('email', '').strip().lower()
    try:
        user = User.objects.get(email__iexact=email)
        if user.is_email_verified:
            return Response({'message': 'Email is already verified. Please log in.'})
        _send_verification_email(user)
    except User.DoesNotExist:
        pass   # Don't reveal user existence

    return Response({'message': 'If that email is registered, a verification link has been sent.'})


# ─────────────────────────────────────────────────────────────────────
# Newsletter subscription
# ─────────────────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def newsletter_subscribe(request):
    """
    POST /api/users/newsletter/
    Body: { "email": "..." }
    Sends a confirmation email to the subscriber.
    """
    email = request.data.get('email', '').strip().lower()
    if not email or '@' not in email:
        return Response({'error': 'A valid email address is required.'}, status=400)

    try:
        send_mail(
            subject='Welcome to Kenya Airways Newsletter!',
            message=(
                f"Thank you for subscribing to the Kenya Airways newsletter!\n\n"
                f"You'll receive the latest flight deals, new routes, and travel news.\n\n"
                f"— The Kenya Airways Team"
            ),
            html_message=(
                f"""
                <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;
                            border:1px solid #e0e0e0;border-radius:12px;">
                  <div style="background:#c01e2e;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
                    <h1 style="color:#fff;margin:0;font-size:22px;">✈ Kenya Airways</h1>
                    <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;">Newsletter</p>
                  </div>
                  <div style="padding:28px 24px;text-align:center;">
                    <h2 style="color:#c01e2e;">You're subscribed! 🎉</h2>
                    <p style="color:#555;line-height:1.7;max-width:380px;margin:0 auto;">
                      Thank you for subscribing to the Kenya Airways newsletter.
                      You'll be the first to know about exclusive flight deals,
                      new routes, and travel inspiration.
                    </p>
                    <div style="margin:28px 0;">
                      <a href="https://kenya-airways-six.vercel.app"
                         style="background:#c01e2e;color:#fff;padding:12px 28px;border-radius:8px;
                                text-decoration:none;font-weight:bold;display:inline-block;">
                        Explore Flights
                      </a>
                    </div>
                  </div>
                  <div style="background:#f5f5f5;padding:12px;text-align:center;
                              border-radius:0 0 8px 8px;font-size:11px;color:#aaa;">
                    © {__import__('datetime').date.today().year} Kenya Airways Ltd. All rights reserved.
                  </div>
                </div>
                """
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=True,
        )
    except Exception:
        pass

    return Response({'message': 'Thank you for subscribing! Check your inbox for a confirmation.'})
