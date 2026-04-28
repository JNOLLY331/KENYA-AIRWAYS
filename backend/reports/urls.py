from django.urls import path
from .views import ticket_pdf, daily_report_pdf, employee_report_pdf, dashboard_stats

urlpatterns = [
    path('ticket/<int:booking_id>/', ticket_pdf, name='ticket-pdf'),
    path('daily/', daily_report_pdf, name='daily-report-pdf'),
    path('employees/', employee_report_pdf, name='employee-report-pdf'),
    path('stats/', dashboard_stats, name='dashboard-stats'),
]
