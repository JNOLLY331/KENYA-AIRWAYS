from rest_framework import serializers
from .models import Booking
from passengers.serializers import PassengerSerializer
from flights.serializers import FlightSerializer


class BookingSerializer(serializers.ModelSerializer):
    passenger_detail = PassengerSerializer(source='passenger', read_only=True)
    flight_detail = FlightSerializer(source='flight', read_only=True)
    travel_class_display = serializers.CharField(source='get_travel_class_display', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_code', 'user', 'passenger', 'passenger_detail',
            'flight', 'flight_detail', 'travel_class', 'travel_class_display',
            'seat_number', 'booking_status', 'payment_status', 'created_at',
        ]
        read_only_fields = ['booking_code', 'user', 'created_at']

    def validate(self, data):
        flight = data.get('flight')
        travel_class = data.get('travel_class')

        if flight and travel_class:
            cap_map = {
                'A': flight.class_a_capacity,
                'B': flight.class_b_capacity,
                'C': flight.class_c_capacity,
            }
            capacity = cap_map.get(travel_class, 0)
            # Exclude current instance when updating
            qs = flight.booking_set.filter(
                travel_class=travel_class,
                booking_status__in=['Confirmed', 'Pending']
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)

            if qs.count() >= capacity:
                raise serializers.ValidationError(
                    f"This flight's {data.get('get_travel_class_display', travel_class)} class is fully booked. "
                    f"Please check the next available flight."
                )
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BookingCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating bookings."""

    class Meta:
        model = Booking
        fields = [
            'passenger', 'flight', 'travel_class', 'seat_number', 'payment_status'
        ]

    def validate(self, data):
        flight = data.get('flight')
        travel_class = data.get('travel_class')

        if flight and travel_class:
            cap_map = {
                'A': flight.class_a_capacity,
                'B': flight.class_b_capacity,
                'C': flight.class_c_capacity,
            }
            capacity = cap_map.get(travel_class, 0)
            booked = flight.booking_set.filter(
                travel_class=travel_class,
                booking_status__in=['Confirmed', 'Pending']
            ).count()

            if booked >= capacity:
                raise serializers.ValidationError(
                    "This class is fully booked on the selected flight. "
                    "Please choose a different class or flight."
                )
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
