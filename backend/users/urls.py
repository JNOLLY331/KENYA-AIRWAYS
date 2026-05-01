from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    login_view,
    logout_view,
    profile_view,
    verify_email,
    request_password_reset,
    confirm_password_reset,
    resend_verification_email,
    newsletter_subscribe,
    create_superuser_view,
)

urlpatterns = [
    # Registration & verification
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-email/<uuid:token>/', verify_email, name='verify_email'),
    path('resend-verification/', resend_verification_email, name='resend_verification'),

    # Login / logout / token
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Profile
    path('profile/', profile_view, name='profile'),

    # Password reset (email-link based)
    path('request-password-reset/', request_password_reset, name='request_password_reset'),
    path('confirm-password-reset/', confirm_password_reset, name='confirm_password_reset'),

    # Newsletter
    path('newsletter/', newsletter_subscribe, name='newsletter_subscribe'),

    # Admin utilities
    path('admin-create/', create_superuser_view, name='create_superuser'),
]
