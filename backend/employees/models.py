from django.db import models

class Employee(models.Model):
    """Stores airline staff details"""
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=50) # e.g., Pilot, Cabin Crew, Ground Staff
    employee_id = models.CharField(max_length=20, unique=True)
    
    def __str__(self):
        return f"{self.name} ({self.role})"

class Assignment(models.Model):
    """Matches an employee to a specific flight opening"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    flight = models.ForeignKey('flights.Flight', on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.name} assigned to {self.flight.flight_number}"