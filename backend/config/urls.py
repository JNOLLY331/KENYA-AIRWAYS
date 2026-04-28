"""
URL configuration for Kenya Airways Online Booking System.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/users/', include('users.urls')),

    # Core resources
    path('api/flights/', include('flights.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/passengers/', include('passengers.urls')),

    # Employees & Assignments
    path('api/', include('employees.urls')),

    # Reports / PDF generation
    path('api/reports/', include('reports.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
