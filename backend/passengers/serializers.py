import re
from rest_framework import serializers
from .models import Passenger

_PHONE_RE = re.compile(r'^\+254\d{9}$')


def _normalize_phone(value: str) -> str:
    """
    Normalize common Kenyan phone formats to E.164 (+254XXXXXXXXX).
    Accepts: 07XXXXXXXX, 7XXXXXXXX, 2547XXXXXXXX, +2547XXXXXXXX
    """
    v = value.strip()
    if re.match(r'^07\d{8}$', v):
        v = '+254' + v[1:]        # 07… → +2547…
    elif re.match(r'^7\d{8}$', v):
        v = '+254' + v            # 7… → +2547…
    elif re.match(r'^2547\d{8}$', v):
        v = '+' + v               # 2547… → +2547…
    return v


class PassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passenger
        fields = ['id', 'full_name', 'passport_number', 'phone', 'email']

    def validate_passport_number(self, value):
        v = value.strip().upper()
        if not re.match(r'^[A-Z0-9]{6,10}$', v):
            raise serializers.ValidationError(
                "Passport number must be 6–10 uppercase letters/digits (e.g. A1234567)."
            )
        return v

    def validate_phone(self, value):
        v = _normalize_phone(value)
        if not _PHONE_RE.match(v):
            raise serializers.ValidationError(
                "Phone must be a valid Kenyan number in the format +254XXXXXXXXX "
                "(or 07XXXXXXXX — it will be converted automatically)."
            )
        return v
