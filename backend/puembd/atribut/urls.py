# atribut/urls.py

from rest_framework.routers import DefaultRouter

from .views import (
    StatusViewSet,
    PeringkatViewSet,
    SektorUsahaViewSet,
    JenisUsahaViewSet
)

router = DefaultRouter()

router.register(
    'status',
    StatusViewSet,
    basename='status'
)

router.register(
    'peringkat',
    PeringkatViewSet,
    basename='peringkat'
)

router.register(
    'sektor-usaha',
    SektorUsahaViewSet,
    basename='sektor-usaha'
)

router.register(
    'jenis-usaha',
    JenisUsahaViewSet,
    basename='jenis-usaha'
)

urlpatterns = router.urls