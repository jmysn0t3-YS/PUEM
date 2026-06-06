# atribut/serializers.py

from rest_framework import serializers
from .models import (
    Status,
    Peringkat,
    SektorUsaha,
    JenisUsaha
)


class StatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = Status
        fields = '__all__'


class PeringkatSerializer(serializers.ModelSerializer):

    class Meta:
        model = Peringkat
        fields = '__all__'


class SektorUsahaSerializer(serializers.ModelSerializer):

    class Meta:
        model = SektorUsaha
        fields = '__all__'

    def validate_sektor(self, value):

        if SektorUsaha.objects.filter(
            sektor__iexact=value
        ).exclude(
            id=self.instance.id if self.instance else None
        ).exists():

            raise serializers.ValidationError(
                "Sektor sudah ada"
            )

        return value


class JenisUsahaSerializer(serializers.ModelSerializer):

    sektor_nama = serializers.CharField(
        source='sektor.sektor',
        read_only=True
    )

    class Meta:
        model = JenisUsaha
        fields = [
            'id',
            'sektor',
            'sektor_nama',
            'jenis'
        ]
    def validate(self, attrs):

            sektor = attrs.get('sektor')
            jenis = attrs.get('jenis')

            exists = JenisUsaha.objects.filter(
                sektor=sektor,
                jenis__iexact=jenis
            )

            if self.instance:
                exists = exists.exclude(
                    id=self.instance.id
                )

            if exists.exists():

                raise serializers.ValidationError({
                    'jenis':
                    'Jenis usaha sudah ada pada sektor ini'
                })

            return attrs