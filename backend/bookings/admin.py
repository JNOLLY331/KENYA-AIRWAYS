from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['booking_code', 'passenger', 'flight', 'travel_class',
                    'booking_status', 'payment_status', 'created_at']
    list_filter = ['travel_class', 'booking_status', 'payment_status']
    search_fields = ['booking_code', 'passenger__full_name', 'flight__flight_number']
    readonly_fields = ['booking_code', 'created_at']
