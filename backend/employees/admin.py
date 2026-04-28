from django.contrib import admin
from .models import Employee, Assignment

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'name', 'role']
    search_fields = ['name', 'employee_id', 'role']

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['employee', 'flight', 'assigned_at']
    list_filter = ['flight']
    search_fields = ['employee__name', 'flight__flight_number']
