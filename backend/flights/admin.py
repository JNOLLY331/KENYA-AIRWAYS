from django.contrib import admin
from .models import Flight, PopularDestination

@admin.register(Flight)
class FlightAdmin(admin.ModelAdmin):
    list_display = ['flight_number', 'origin', 'destination', 'departure_time', 'arrival_time',
                    'class_a_capacity', 'class_b_capacity', 'class_c_capacity']
    search_fields = ['flight_number', 'origin', 'destination']
    list_filter = ['origin', 'destination']



@admin.register(PopularDestination)
class PopularDestinationAdmin(admin.ModelAdmin):
    list_display = ['city', 'code', 'color', 'image']
    search_fields = ['city', 'code']
