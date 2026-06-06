# from django.db import models

# # Create your models here.
# class Kecamatan(models.Model):
#     nama_kec = models.CharField(max_length=100)

#     def __str__(self):
#         return self.nama_kec
    
# class Desa(models.Model):
#     kecamatan = models.ForeignKey(Kecamatan, on_delete=models.CASCADE)
#     nama_desa = models.CharField(max_length=100)
    
#     def __str__(self):
#         return self.nama_desa

from django.db import models


class Kecamatan(models.Model):
    nama_kec = models.CharField(max_length=100, unique=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nama_kec']
        verbose_name_plural = 'Kecamatan'

    def __str__(self):
        return self.nama_kec


class Desa(models.Model):
    kecamatan = models.ForeignKey(
        Kecamatan,
        on_delete=models.CASCADE,
        related_name='desa'
    )

    nama_desa = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nama_desa']
        unique_together = ['kecamatan', 'nama_desa']
        verbose_name_plural = 'Desa'

    def __str__(self):
        return f"{self.nama_desa} - {self.kecamatan.nama_kec}"