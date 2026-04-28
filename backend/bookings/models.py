from django.db import models
import uuid

def generate_booking_code():
    return uuid.uuid4().hex[:12].upper()

class Booking(models.Model):
    # Unique code for ticket generation and inquiry
    booking_code = models.CharField(
        max_length=12, 
        unique=True, 
        default=generate_booking_code
    )
    
    # Relationships
    user = models.ForeignKey('users.User', on_delete=models.CASCADE) 
    passenger = models.ForeignKey('passengers.Passenger', on_delete=models.CASCADE)
    flight = models.ForeignKey('flights.Flight', on_delete=models.CASCADE)
    
    # Class Selection (Executive, Middle, Low)
    CLASS_CHOICES = [
        ('A', 'Executive'),
        ('B', 'Middle Class'),
        ('C', 'Low Class'),
    ]
    travel_class = models.CharField(max_length=1, choices=CLASS_CHOICES)
    
    # Seat and Status
    seat_number = models.CharField(max_length=10) 
    booking_status = models.CharField(max_length=20, default='Confirmed')
    payment_status = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.booking_code} - {self.passenger.full_name}"