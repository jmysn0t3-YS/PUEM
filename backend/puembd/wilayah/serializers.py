# wilayah/serializers.py

from rest_framework import serializers
from .models import Kecamatan, Desa


class KecamatanSerializer(serializers.ModelSerializer):
    total_desa = serializers.SerializerMethodField()

    class Meta:
        model = Kecamatan
        fields = [
            'id',
            'nama_kec',
            'total_desa'
        ]

    def get_total_desa(self, obj):
        return obj.desa.count() if hasattr(obj, 'desa') else obj.desa_set.count()
    


class DesaSerializer(serializers.ModelSerializer):

    kecamatan_nama = serializers.CharField(
        source='kecamatan.nama_kec',
        read_only=True
    )

    class Meta:
        model = Desa
        fields = [  
            'id',
            'kecamatan',
            'kecamatan_nama',
            'nama_desa',
            'created_at',
            'updated_at'
        ]