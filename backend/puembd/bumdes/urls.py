# bumdes/urls.py
from django.urls import path    
from rest_framework.routers import DefaultRouter

from .views import (
    BumdesViewSet,
    LegalitasViewSet,
    PetugasViewSet
)
from .dashboard_views import DashboardAPIView

router = DefaultRouter()

router.register(
    'bumdes',
    BumdesViewSet,
    basename='bumdes'
)

router.register(
    'legalitas',
    LegalitasViewSet,
    basename='legalitas'
)

router.register(
    'petugas',
    PetugasViewSet,
    basename='petugas'
)

urlpatterns = [

    path(
        'dashboard/',
        DashboardAPIView.as_view(),
        name='dashboard'
    ),

] + router.urls