from django.db import models

class FAQ(models.Model):
    """Stores frequently asked questions to guide users [cite: 141, 235]"""
    question = models.CharField(max_length=255)
    answer = models.TextField()
    category = models.CharField(max_length=100, default="General") # e.g., Booking, Flights, Refunds

    def __str__(self):
        return self.question

class SupportMessage(models.Model):
    """Handles support messages/inquiries from users [cite: 143]"""
    user_name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"Message from {self.user_name} - {self.subject}"

class HelpGuide(models.Model):
    """Stores step-by-step guides for system use [cite: 141, 232]"""
    title = models.CharField(max_length=100) # e.g., "How to Book", "How to Print Ticket"
    content = models.TextField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']