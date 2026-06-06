# wilayah/admin.py

from django.contrib import admin
from .models import Kecamatan, Desa


@admin.register(Kecamatan)
class KecamatanAdmin(admin.ModelAdmin):
    list_display = ['id', 'nama_kec']
    search_fields = ['nama_kec']
    ordering = ['nama_kec']


@admin.register(Desa)
class DesaAdmin(admin.ModelAdmin):
    list_display = ['id', 'nama_desa', 'kecamatan']
    list_filter = ['kecamatan']
    search_fields = ['nama_desa']
    ordering = ['nama_desa']