from rest_framework import viewsets, permissions
from .models import Passenger
from .serializers import PassengerSerializer


class PassengerViewSet(viewsets.ModelViewSet):
    queryset = Passenger.objects.all().order_by('full_name')
    serializer_class = PassengerSerializer
    permission_classes = [permissions.IsAuthenticated]
