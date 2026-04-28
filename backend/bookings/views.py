from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer
from flights.models import Flight
from flights.serializers import FlightSerializer


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Booking.objects.select_related('passenger', 'flight').all().order_by('-created_at')
        return Booking.objects.select_related('passenger', 'flight').filter(user=user).order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()

        # Return the full booking detail
        response_serializer = BookingSerializer(booking, context={'request': request})

        # Check if class is now full and suggest next flight
        flight = booking.flight
        travel_class = booking.travel_class
        cap_map = {'A': flight.class_a_capacity, 'B': flight.class_b_capacity, 'C': flight.class_c_capacity}
        capacity = cap_map.get(travel_class, 0)
        booked = flight.booking_set.filter(
            travel_class=travel_class, booking_status__in=['Confirmed', 'Pending']
        ).count()

        response_data = response_serializer.data
        if booked >= capacity:
            next_flight = Flight.objects.filter(
                origin=flight.origin,
                destination=flight.destination,
                departure_time__gt=flight.departure_time
            ).order_by('departure_time').first()
            if next_flight:
                response_data['next_available_flight'] = FlightSerializer(next_flight, context={'request': request}).data

        return Response(response_data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = BookingSerializer(instance, data=request.data, partial=partial, context={'request': request})
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        return Response(BookingSerializer(booking, context={'request': request}).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        booking_code = instance.booking_code
        instance.delete()
        return Response({'message': f'Booking {booking_code} has been cancelled.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='by-code/(?P<code>[^/.]+)')
    def by_code(self, request, code=None):
        try:
            booking = Booking.objects.get(booking_code=code.upper())
            # Only allow owner or staff
            if booking.user != request.user and not request.user.is_staff:
                return Response({'error': 'Not authorised.'}, status=403)
            return Response(BookingSerializer(booking, context={'request': request}).data)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=404)
