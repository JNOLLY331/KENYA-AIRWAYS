from rest_framework import serializers
from .models import Employee, Assignment
from flights.serializers import FlightSerializer


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'name', 'role', 'employee_id']


class AssignmentSerializer(serializers.ModelSerializer):
    employee_detail = EmployeeSerializer(source='employee', read_only=True)
    flight_detail   = FlightSerializer(source='flight', read_only=True)

    # Flat convenience fields for the frontend table
    employee_name        = serializers.CharField(source='employee.name', read_only=True)
    employee_role        = serializers.CharField(source='employee.role', read_only=True)
    flight_number        = serializers.CharField(source='flight.flight_number', read_only=True)
    flight_origin        = serializers.CharField(source='flight.origin', read_only=True)
    flight_destination   = serializers.CharField(source='flight.destination', read_only=True)

    class Meta:
        model = Assignment
        fields = [
            'id', 'employee', 'employee_detail', 'employee_name', 'employee_role',
            'flight', 'flight_detail', 'flight_number', 'flight_origin', 'flight_destination',
            'assigned_at',
        ]
        read_only_fields = ['assigned_at']
