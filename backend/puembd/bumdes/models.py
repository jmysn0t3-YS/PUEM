# bumdes/models.py

from django.db import models
from wilayah.models import Desa
from atribut.models import (
    Status,
    Peringkat,
    SektorUsaha,
    JenisUsaha
)


class Bumdes(models.Model):
    nama_bumdes = models.CharField(max_length=150)

    desa = models.ForeignKey(
        Desa,
        on_delete=models.CASCADE,
        related_name='bumdes'
    )

    alamat = models.TextField()

    no_hp = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)

    status_bumdes = models.ForeignKey(
        Status,
        on_delete=models.SET_NULL,
        null=True,
        related_name='bumdes_status'
    )

    peringkat = models.ForeignKey(
        Peringkat,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bumdes_peringkat'
    )

    sektor_usaha = models.ManyToManyField(
        SektorUsaha,
        blank=True,
        related_name='bumdes_sektor'
    )

    jenis_usaha = models.ManyToManyField(
        JenisUsaha,
        blank=True,
        related_name='bumdes_jenis'
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nama_bumdes']
        verbose_name_plural = 'BUMDes'

    def __str__(self):
        return self.nama_bumdes

    @property
    def kecamatan(self):
        return self.desa.kecamatan


class Legalitas(models.Model):
    bumdes = models.OneToOneField(
        Bumdes,
        on_delete=models.CASCADE,
        related_name='legalitas'
    )

    nomor_perdes = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    tanggal_perdes = models.DateField(
        blank=True,
        null=True
    )

    nomor_ahu = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    tanggal_ahu = models.DateField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Legalitas'

    def __str__(self):
        return f"Legalitas {self.bumdes.nama_bumdes}"

class Petugas(models.Model):
    bumdes = models.OneToOneField(
        Bumdes,
        on_delete=models.CASCADE,
        related_name='petugas'
    )

    penasihat = models.CharField(max_length=100, blank=True, null=True)
    no_penasihat = models.CharField(max_length=20, blank=True, null=True)

    pengawas = models.CharField(max_length=100, blank=True, null=True)
    no_pengawas = models.CharField(max_length=20, blank=True, null=True)

    direktur = models.CharField(max_length=100, blank=True, null=True)
    no_direktur = models.CharField(max_length=20, blank=True, null=True)

    sekretaris = models.CharField(max_length=100, blank=True, null=True)
    no_sekretaris = models.CharField(max_length=20, blank=True, null=True)

    bendahara = models.CharField(max_length=100, blank=True, null=True)
    no_bendahara = models.CharField(max_length=20, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Petugas'

    def __str__(self):
        return f"Petugas {self.bumdes.nama_bumdes}"