# atribut/views.py

from rest_framework import viewsets
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAdminUser,IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import (
    Status,
    Peringkat,
    SektorUsaha,
    JenisUsaha
)

from .serializers import (
    StatusSerializer,
    PeringkatSerializer,
    SektorUsahaSerializer,
    JenisUsahaSerializer
)


class StatusViewSet(viewsets.ModelViewSet):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [SearchFilter]
    search_fields = ['status']

    pagination_class = None



class PeringkatViewSet(viewsets.ModelViewSet):
    queryset = Peringkat.objects.all()
    serializer_class = PeringkatSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [SearchFilter]
    search_fields = ['peringkat']

    pagination_class = None



class SektorUsahaViewSet(viewsets.ModelViewSet):
    queryset = SektorUsaha.objects.all()
    serializer_class = SektorUsahaSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [SearchFilter]
    search_fields = ['sektor']

    pagination_class = None



class JenisUsahaViewSet(viewsets.ModelViewSet):
    queryset = JenisUsaha.objects.select_related('sektor')
    serializer_class = JenisUsahaSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend,SearchFilter,OrderingFilter]
    filterset_fields = ['sektor']
    search_fields = [
        'jenis',
        'sektor__sektor'
    ]
    
    ordering_fields = ['jenis','created_at']
    ordering = ['jenis']

    pagination_class = None
