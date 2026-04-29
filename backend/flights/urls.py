from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FlightViewSet, PopularDestinationViewSet

router = DefaultRouter()
router.register(r'destinations', PopularDestinationViewSet, basename='destination')
router.register(r'', FlightViewSet, basename='flight')

urlpatterns = [
    path('', include(router.urls)),
]
