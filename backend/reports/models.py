from django.db import models

class SystemReport(models.Model):
    REPORT_TYPES = [
        ('TICKET', 'Individual Ticket'),
        ('DAILY', 'Daily Booking Report'),
        ('PASSENGER', 'Passenger List'),
        ('EMPLOYEE', 'Employee Match Report'),
    ]
    
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    generated_at = models.DateTimeField(auto_now_add=True)
    # Changed 'auth.User' to 'users.User' to match your custom user model
    generated_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    file_path = models.FileField(upload_to='reports/pdf/') # Stores the generated PDF

    def __str__(self):
        return f"{self.report_type} generated on {self.generated_at.strftime('%Y-%m-%d')}"