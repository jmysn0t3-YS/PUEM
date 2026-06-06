from django.db import models


class Status(models.Model):
    status = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ['status']
        verbose_name_plural = 'Status'

    def __str__(self):
        return self.status


class Peringkat(models.Model):
    peringkat = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ['peringkat']
        verbose_name_plural = 'Peringkat'

    def __str__(self):
        return self.peringkat


class SektorUsaha(models.Model):
    sektor = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ['sektor']
        verbose_name_plural = 'sektor_usaha'
        

    def __str__(self):
        return self.sektor


class JenisUsaha(models.Model):
    sektor = models.ForeignKey(
        SektorUsaha,
        on_delete=models.CASCADE,
        related_name='jenis_usaha'
    )

    jenis = models.CharField(max_length=100)

    class Meta:
        ordering = ['jenis']
        unique_together = ['sektor', 'jenis']
        verbose_name_plural = 'Jenis Usaha'

    def __str__(self):
        return f"{self.jenis} ({self.sektor.sektor})"
