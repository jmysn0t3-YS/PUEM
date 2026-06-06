from django.contrib import admin
from .models import Status, Peringkat, SektorUsaha, JenisUsaha

# Register your models here.

@admin.register(Status)
class StatusAdmin(admin.ModelAdmin):
    list_display = ['id', 'status']
    search_fields = ['status']


@admin.register(Peringkat)
class PeringkatAdmin(admin.ModelAdmin):
    list_display = ['id', 'peringkat']
    search_fields = ['peringkat']


@admin.register(SektorUsaha)
class SektorUsahaAdmin(admin.ModelAdmin):
    list_display = ['id', 'sektor']
    search_fields = ['sektor']


@admin.register(JenisUsaha)
class JenisUsahaAdmin(admin.ModelAdmin):
    list_display = ['id', 'jenis', 'sektor']
    list_filter = ['sektor']
    search_fields = ['jenis']