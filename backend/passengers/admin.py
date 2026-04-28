from django.contrib import admin
from .models import Passenger

@admin.register(Passenger)
class PassengerAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'passport_number', 'phone', 'email']
    search_fields = ['full_name', 'passport_number', 'email']
