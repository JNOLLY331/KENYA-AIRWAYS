from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Flight
from .serializers import FlightSerializer


class FlightViewSet(viewsets.ModelViewSet):
    queryset = Flight.objects.all().order_by('departure_time')
    serializer_class = FlightSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['origin', 'destination', 'flight_number']

    def get_permissions(self):
        # Anyone can list/retrieve flights; only admins can create/update/delete
        if self.action in ['list', 'retrieve', 'next_available']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=['get'], url_path='next-available')
    def next_available(self, request):
        """
        Returns the next available flight for a given route and class.
        Query params: origin, destination, travel_class (A/B/C), after (datetime ISO)
        """
        origin = request.query_params.get('origin')
        destination = request.query_params.get('destination')
        travel_class = request.query_params.get('travel_class', 'A')
        after_str = request.query_params.get('after')

        if not origin or not destination:
            return Response({'error': 'origin and destination required'}, status=400)

        try:
            after = timezone.datetime.fromisoformat(after_str) if after_str else timezone.now()
        except Exception:
            after = timezone.now()

        flights = Flight.objects.filter(
            origin__iexact=origin,
            destination__iexact=destination,
            departure_time__gt=after
        ).order_by('departure_time')

        for flight in flights:
            booked = flight.booking_set.filter(
                travel_class=travel_class,
                booking_status__in=['Confirmed', 'Pending']
            ).count()
            cap_map = {'A': flight.class_a_capacity, 'B': flight.class_b_capacity, 'C': flight.class_c_capacity}
            capacity = cap_map.get(travel_class, 0)
            if booked < capacity:
                serializer = self.get_serializer(flight)
                return Response(serializer.data)

        return Response({'message': 'No available flights found for this route and class.'}, status=404)
