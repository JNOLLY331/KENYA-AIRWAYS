from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, AssignmentViewSet

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'assignments', AssignmentViewSet, basename='assignment')

urlpatterns = [
    path('', include(router.urls)),
]
