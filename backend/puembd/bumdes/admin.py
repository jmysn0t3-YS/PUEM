# bumdes/admin.py

from django.contrib import admin
from .models import Bumdes, Legalitas, Petugas


class LegalitasInline(admin.StackedInline):
    model = Legalitas
    extra = 0


class PetugasInline(admin.StackedInline):
    model = Petugas
    extra = 0


@admin.register(Bumdes)
class BumdesAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'nama_bumdes',
        'desa',
        'get_kecamatan',
        'status_bumdes',
        'peringkat',
        'is_active'
    ]

    list_filter = [
        'status_bumdes',
        'peringkat',
        'desa__kecamatan',
        'is_active'
    ]

    search_fields = [
        'nama_bumdes',
        'desa__nama_desa',
        'desa__kecamatan__nama_kec'
    ]

    filter_horizontal = [
        'sektor_usaha',
        'jenis_usaha'
    ]

    inlines = [
        LegalitasInline,
        PetugasInline
    ]

    ordering = ['nama_bumdes']

    def get_kecamatan(self, obj):
        return obj.desa.kecamatan

    get_kecamatan.short_description = 'Kecamatan'


@admin.register(Legalitas)
class LegalitasAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'bumdes',
        'nomor_perdes',
        'nomor_ahu'
    ]

    search_fields = [
        'bumdes__nama_bumdes',
        'nomor_perdes',
        'nomor_ahu'
    ]


@admin.register(Petugas)
class PetugasAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'bumdes',
        'direktur',
        'no_direktur'
    ]

    search_fields = [
        'bumdes__nama_bumdes',
        'direktur'
    ]