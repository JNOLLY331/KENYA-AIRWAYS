from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, profile_view, logout_view, login_view,
    create_superuser_view, reset_password_view
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', login_view, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', logout_view, name='logout'),
    path('profile/', profile_view, name='profile'),
    path('admin-create/', create_superuser_view, name='create_superuser'),
    path('reset-password/', reset_password_view, name='reset_password'),
]
