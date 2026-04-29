from django.db import models

class Flight(models.Model):
    # Core Flight Details [cite: 67, 286]
    flight_number = models.CharField(max_length=20, unique=True)
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()

    # Seat Capacity for HCI Requirements [cite: 68, 287, 289]
    class_a_capacity = models.PositiveIntegerField(default=20) # Executive
    class_b_capacity = models.PositiveIntegerField(default=50) # Middle Class
    class_c_capacity = models.PositiveIntegerField(default=100) # Low Class

    def __str__(self):
        return f"{self.flight_number}: {self.origin} to {self.destination}"
from cloudinary.models import CloudinaryField

class PopularDestination(models.Model):
    city = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    detail = models.CharField(max_length=200)
    color = models.CharField(max_length=20, default='#1D4ED8')
    image = CloudinaryField('image', blank=True, null=True)

    def __str__(self):
        return self.city
