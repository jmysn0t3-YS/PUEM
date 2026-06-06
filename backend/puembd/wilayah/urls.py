# wilayah/urls.py

from rest_framework.routers import DefaultRouter
from .views import (
    KecamatanViewSet,
    DesaViewSet
)

router = DefaultRouter()

router.register(
    'kecamatan',
    KecamatanViewSet,
    basename='kecamatan'
)

router.register(
    'desa',
    DesaViewSet,
    basename='desa'
)

urlpatterns = router.urls