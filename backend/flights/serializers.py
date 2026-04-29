from rest_framework import serializers
from .models import Flight, PopularDestination

class FlightSerializer(serializers.ModelSerializer):
    seats_left_a = serializers.SerializerMethodField()
    seats_left_b = serializers.SerializerMethodField()
    seats_left_c = serializers.SerializerMethodField()
    is_full_a = serializers.SerializerMethodField()
    is_full_b = serializers.SerializerMethodField()
    is_full_c = serializers.SerializerMethodField()

    class Meta:
        model = Flight
        fields = [
            'id', 'flight_number', 'origin', 'destination',
            'departure_time', 'arrival_time',
            'class_a_capacity', 'class_b_capacity', 'class_c_capacity',
            'seats_left_a', 'seats_left_b', 'seats_left_c',
            'is_full_a', 'is_full_b', 'is_full_c',
        ]

    def _booked_count(self, obj, travel_class):
        return obj.booking_set.filter(
            travel_class=travel_class,
            booking_status__in=['Confirmed', 'Pending']
        ).count()

    def get_seats_left_a(self, obj):
        return max(0, obj.class_a_capacity - self._booked_count(obj, 'A'))

    def get_seats_left_b(self, obj):
        return max(0, obj.class_b_capacity - self._booked_count(obj, 'B'))

    def get_seats_left_c(self, obj):
        return max(0, obj.class_c_capacity - self._booked_count(obj, 'C'))

    def get_is_full_a(self, obj):
        return self.get_seats_left_a(obj) == 0

    def get_is_full_b(self, obj):
        return self.get_seats_left_b(obj) == 0

    def get_is_full_c(self, obj):
        return self.get_seats_left_c(obj) == 0

class PopularDestinationSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PopularDestination
        fields = ['id', 'city', 'code', 'detail', 'color', 'image', 'image_url']

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None
