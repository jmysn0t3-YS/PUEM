from django.shortcuts import render
from .models import Kecamatan, Desa
from .serializers import KecamatanSerializer, DesaSerializer
from rest_framework.decorators import api_view
from rest_framework.permissions import (
    IsAdminUser
)

from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter

# Create your views here.
# wilayah/views.py


class KecamatanViewSet(viewsets.ModelViewSet):
    queryset = Kecamatan.objects.all()
    serializer_class = KecamatanSerializer
    permission_classes = [
            IsAdminUser
        ]

    filter_backends = [
        SearchFilter,
        OrderingFilter
    ]

    search_fields = ['nama_kec']
    ordering_fields = ['nama_kec']
    ordering = ['nama_kec']

    pagination_class = None

    
class DesaViewSet(viewsets.ModelViewSet):
    queryset = Desa.objects.select_related('kecamatan')
    serializer_class = DesaSerializer
    permission_classes = [
            IsAdminUser
        ]

    filter_backends = [
        SearchFilter,
        OrderingFilter
    ]

    search_fields = [
        'nama_desa',
        'kecamatan__nama_kec'
    ]

    ordering_fields = [
        'nama_desa'
    ]

    ordering = ['nama_desa']

    pagination_class = None