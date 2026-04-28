from django.db import models

class Passenger(models.Model):
    # Core Identification [cite: 84, 85]
    full_name = models.CharField(max_length=100)
    passport_number = models.CharField(max_length=50, unique=True)
    
    # Contact Details [cite: 86, 87]
    phone = models.CharField(max_length=20)
    email = models.EmailField()

    def __str__(self):
        return f"{self.full_name} ({self.passport_number})"