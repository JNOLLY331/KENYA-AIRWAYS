from rest_framework import viewsets, permissions
from .models import Employee, Assignment
from .serializers import EmployeeSerializer, AssignmentSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().order_by('name')
    serializer_class = EmployeeSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.select_related('employee', 'flight').all().order_by('-assigned_at')
    serializer_class = AssignmentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]
