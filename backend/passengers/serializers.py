from rest_framework import serializers
from .models import Passenger


class PassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passenger
        fields = ['id', 'full_name', 'passport_number', 'phone', 'email']

    def validate_passport_number(self, value):
        import re
        if not re.match(r'^[A-Z0-9]{6,10}$', value):
            raise serializers.ValidationError(
                "Passport number must be 6-10 uppercase letters/digits (e.g. A1234567)."
            )
        return value

    def validate_phone(self, value):
        import re
        if not re.match(r'^\+254\d{9}$', value):
            raise serializers.ValidationError(
                "Phone must be a valid Kenyan number: +254XXXXXXXXX"
            )
        return value
