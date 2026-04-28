from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .pdf_utils import (
    generate_ticket_pdf,
    generate_daily_report_pdf,
    generate_employee_report_pdf,
)
from bookings.models import Booking
from employees.models import Assignment
from flights.models import Flight
from passengers.models import Passenger


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ticket_pdf(request, booking_id):
    """Download a PDF ticket for a specific booking."""
    try:
        booking = Booking.objects.get(pk=booking_id)
        # Only allow owner or staff
        if booking.user != request.user and not request.user.is_staff:
            return Response({'error': 'Not authorised.'}, status=403)
        pdf_bytes = generate_ticket_pdf(booking_id)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="KQ_Ticket_{booking.booking_code}.pdf"'
        return response
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found.'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def daily_report_pdf(request):
    """Download a daily booking report PDF. Optional ?date=YYYY-MM-DD query param."""
    date_str = request.query_params.get('date')
    date = None
    if date_str:
        try:
            from datetime import date as date_cls
            date = date_cls.fromisoformat(date_str)
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

    pdf_bytes = generate_daily_report_pdf(date=date)
    label = (date or timezone.now().date()).strftime('%Y-%m-%d')
    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="KQ_Daily_Report_{label}.pdf"'
    return response


@api_view(['GET'])
@permission_classes([IsAdminUser])
def employee_report_pdf(request):
    """Download an employee assignment report PDF."""
    pdf_bytes = generate_employee_report_pdf()
    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="KQ_Employee_Assignments.pdf"'
    return response


@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_stats(request):
    """Quick stats for the admin dashboard."""
    total_bookings = Booking.objects.count()
    confirmed = Booking.objects.filter(booking_status='Confirmed').count()
    total_passengers = Passenger.objects.count()
    total_flights = Flight.objects.count()
    total_employees = Assignment.objects.values('employee').distinct().count()

    today = timezone.now().date()
    today_bookings = Booking.objects.filter(created_at__date=today).count()

    return Response({
        'total_bookings': total_bookings,
        'confirmed_bookings': confirmed,
        'total_passengers': total_passengers,
        'total_flights': total_flights,
        'assigned_employees': total_employees,
        'bookings_today': today_bookings,
    })
