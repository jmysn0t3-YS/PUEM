# bumdes/serializers.py

from rest_framework import serializers
from .models import Bumdes, Legalitas, Petugas


class LegalitasSerializer(serializers.ModelSerializer):

    class Meta:
        model = Legalitas
        fields = '__all__'


class PetugasSerializer(serializers.ModelSerializer):

    class Meta:
        model = Petugas
        fields = '__all__'


class BumdesSerializer(serializers.ModelSerializer):

    desa_nama = serializers.CharField(
        source='desa.nama_desa',
        read_only=True
    )

    kecamatan_nama = serializers.CharField(
        source='desa.kecamatan.nama_kec',
        read_only=True
    )

    status_nama = serializers.CharField(
        source='status_bumdes.status',
        read_only=True
    )

    peringkat_nama = serializers.CharField(
        source='peringkat.peringkat',
        read_only=True
    )

    sektor_usaha_nama = serializers.SerializerMethodField()

    jenis_usaha_nama = serializers.SerializerMethodField()

    legalitas = LegalitasSerializer(
        read_only=True
    )

    petugas = PetugasSerializer(read_only=True)

    class Meta:

        model = Bumdes

        fields = [
            'id',
            'nama_bumdes',

            'desa',
            'desa_nama',

            'kecamatan_nama',

            'alamat',
            'no_hp',
            'email',

            'status_bumdes',
            'status_nama',

            'peringkat',
            'peringkat_nama',

            'sektor_usaha',
            'sektor_usaha_nama',

            'jenis_usaha',
            'jenis_usaha_nama',

            'legalitas',
            'petugas',

            'is_active',

            'created_at',
            'updated_at'
        ]

    def get_sektor_usaha_nama(
        self,
        obj
    ):

        return [
            item.sektor
            for item
            in obj.sektor_usaha.all()
        ]


    def get_jenis_usaha_nama(
        self,
        obj
    ):

        return [
            item.jenis
            for item
            in obj.jenis_usaha.all()
        ]   
    def update(self, instance, validated_data):

        legalitas_data = self.initial_data.get("legalitas")
        petugas_data = self.initial_data.get("petugas")

        # update bumdes utama
        instance.nama_bumdes = validated_data.get("nama_bumdes", instance.nama_bumdes)
        instance.alamat = validated_data.get("alamat", instance.alamat)
        instance.no_hp = validated_data.get("no_hp", instance.no_hp)
        instance.email = validated_data.get("email", instance.email)

        instance.save()
    # bumdes/serializers.py

from rest_framework import serializers
from .models import Bumdes, Legalitas, Petugas


class LegalitasSerializer(serializers.ModelSerializer):

    class Meta:
        model = Legalitas
        fields = '__all__'


class PetugasSerializer(serializers.ModelSerializer):

    class Meta:
        model = Petugas
        fields = '__all__'


class BumdesSerializer(serializers.ModelSerializer):

    desa_nama = serializers.CharField(
        source='desa.nama_desa',
        read_only=True
    )

    kecamatan_nama = serializers.CharField(
        source='desa.kecamatan.nama_kec',
        read_only=True
    )

    status_nama = serializers.CharField(
        source='status_bumdes.status',
        read_only=True
    )

    peringkat_nama = serializers.CharField(
        source='peringkat.peringkat',
        read_only=True
    )

    sektor_usaha_nama = serializers.SerializerMethodField()

    jenis_usaha_nama = serializers.SerializerMethodField()

    legalitas = LegalitasSerializer(
        read_only=True
    )

    petugas = PetugasSerializer(read_only=True)

    class Meta:

        model = Bumdes

        fields = [
            'id',
            'nama_bumdes',

            'desa',
            'desa_nama',

            'kecamatan_nama',

            'alamat',
            'no_hp',
            'email',

            'status_bumdes',
            'status_nama',

            'peringkat',
            'peringkat_nama',

            'sektor_usaha',
            'sektor_usaha_nama',

            'jenis_usaha',
            'jenis_usaha_nama',

            'legalitas',
            'petugas',

            'is_active',

            'created_at',
            'updated_at'
        ]

    def get_sektor_usaha_nama(
        self,
        obj
    ):

        return [
            item.sektor
            for item
            in obj.sektor_usaha.all()
        ]


    def get_jenis_usaha_nama(
        self,
        obj
    ):

        return [
            item.jenis
            for item
            in obj.jenis_usaha.all()
        ]   
    def update(self, instance, validated_data):

        legalitas_data = self.initial_data.get("legalitas", {})
        petugas_data = self.initial_data.get("petugas", {})

        # ======================
        # BUMDES CORE
        # ======================
        instance.nama_bumdes = validated_data.get("nama_bumdes", instance.nama_bumdes)
        instance.alamat = validated_data.get("alamat", instance.alamat)
        instance.no_hp = validated_data.get("no_hp", instance.no_hp)
        instance.email = validated_data.get("email", instance.email)
        instance.status_bumdes = validated_data.get("status_bumdes", instance.status_bumdes)
        instance.peringkat = validated_data.get("peringkat", instance.peringkat)

        instance.save()

        # ======================
        # LEGALITAS (FIXED)
        # ======================
        if legalitas_data:
            Legalitas.objects.update_or_create(
                bumdes=instance,
                defaults={
                    "nomor_perdes": legalitas_data.get("nomor_perdes"),
                    "tanggal_perdes": legalitas_data.get("tanggal_perdes"),
                    "nomor_ahu": legalitas_data.get("nomor_ahu"),
                    "tanggal_ahu": legalitas_data.get("tanggal_ahu"),
                }
            )

        # ======================
        # PETUGAS (FIXED)
        # ======================
        if petugas_data:
            Petugas.objects.update_or_create(
                bumdes=instance,
                defaults={
                    "penasihat": petugas_data.get("penasihat"),
                    "no_penasihat": petugas_data.get("no_penasihat"),
                    "pengawas": petugas_data.get("pengawas"),
                    "no_pengawas": petugas_data.get("no_pengawas"),
                    "direktur": petugas_data.get("direktur"),
                    "no_direktur": petugas_data.get("no_direktur"),
                    "sekretaris": petugas_data.get("sekretaris"),
                    "no_sekretaris": petugas_data.get("no_sekretaris"),
                    "bendahara": petugas_data.get("bendahara"),
                    "no_bendahara": petugas_data.get("no_bendahara"),
                }
            )

        # ======================
        # M2M
        # ======================
        if "sektor_usaha" in self.initial_data:
            instance.sektor_usaha.set(self.initial_data["sektor_usaha"])

        if "jenis_usaha" in self.initial_data:
            instance.jenis_usaha.set(self.initial_data["jenis_usaha"])

        return instance
    
    def create(self, validated_data):

        legalitas_data = self.initial_data.get("legalitas")
        petugas_data = self.initial_data.get("petugas")

        sektor = validated_data.pop("sektor_usaha", [])
        jenis = validated_data.pop("jenis_usaha", [])

        bumdes = Bumdes.objects.create(**validated_data)

        if sektor:
            bumdes.sektor_usaha.set(sektor)

        if jenis:
            bumdes.jenis_usaha.set(jenis)

        if legalitas_data:
            Legalitas.objects.create(bumdes=bumdes, **legalitas_data)

        if petugas_data:
            Petugas.objects.create(bumdes=bumdes, **petugas_data)

        return bumdes

        # ======================
        # LEGALITAS
        # ======================
        if legalitas_data:
            Legalitas.objects.update_or_create(
                bumdes=instance,
                defaults=legalitas_data
            )

        # ======================
        # PETUGAS
        # ======================
        if petugas_data:
            Petugas.objects.update_or_create(
                bumdes=instance,
                defaults=petugas_data
            )

        # MANYTOMANY SEKTOR
        if "sektor_usaha" in self.initial_data:
            instance.sektor_usaha.set(self.initial_data["sektor_usaha"])

        # MANYTOMANY JENIS
        if "jenis_usaha" in self.initial_data:
            instance.jenis_usaha.set(self.initial_data["jenis_usaha"])

        return instance
    
