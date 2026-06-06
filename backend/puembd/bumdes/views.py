# bumdes/views.py

from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated

from django.http import HttpResponse
from openpyxl import Workbook
from rest_framework.decorators import action

from .models import (
    Bumdes,
    Legalitas,
    Petugas
)

from .serializers import (
    BumdesSerializer,
    LegalitasSerializer,
    PetugasSerializer
)


class BumdesViewSet(viewsets.ModelViewSet):
    queryset = Bumdes.objects.select_related(
        'desa',
        'desa__kecamatan',
        'status_bumdes',
        'peringkat'
    ).prefetch_related(
        'sektor_usaha',
        'jenis_usaha'
    )

    serializer_class = BumdesSerializer
    
    permission_classes = [IsAuthenticated]
    
    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter
    ]

    # FILTER
    filterset_fields = [

        'desa',

        'desa__kecamatan',

        'status_bumdes',

        'peringkat',

        'is_active',

        'sektor_usaha',

        'jenis_usaha'
    ]

# SEARCH
    search_fields = [
        'nama_bumdes',
        'desa__nama_desa',
        'desa__kecamatan__nama_kec',
        'sektor_usaha__sektor',
        'jenis_usaha__jenis'
    ]

    # ORDER
    ordering_fields = [
        'nama_bumdes',
        'created_at'
    ]

    @action(detail=False, methods=['get'], url_path='export')
    def export_excel(self, request):
        wb = Workbook()
        ws = wb.active
        ws.title = "BUMDES"

        # Header lengkap
        ws.append([
            "No",
            "Nama BUMDES",
            "Desa",
            "Kecamatan",
            "Alamat",
            "No HP",
            "Email",
            "Status",
            "Peringkat",
            "Sektor Usaha",
            "Jenis Usaha",
            

            # Legalitas
            "Nomor Perdes",
            "Tanggal Perdes",
            "Nomor AHU",
            "Tanggal AHU",

            # Petugas
            "Penasihat",
            "No Penasihat",
            "Pengawas",
            "No Pengawas",
            "Direktur",
            "No Direktur",
            "Sekretaris",
            "No Sekretaris",
            "Bendahara",
            "No Bendahara"

            "Aktifitas",
        ])

        data = self.get_queryset().order_by('desa__kecamatan__nama_kec', 'nama_bumdes')

        for i, item in enumerate(data, start=1):
            sektor = ", ".join([s.sektor for s in item.sektor_usaha.all()])
            jenis = ", ".join([j.jenis for j in item.jenis_usaha.all()])

            # LEGALITAS
            legal = getattr(item, 'legalitas', None)

            if legal:
                nomor_perdes = legal.nomor_perdes or "-"
                tanggal_perdes = legal.tanggal_perdes or "-"
                nomor_ahu = legal.nomor_ahu or "-"
                tanggal_ahu = legal.tanggal_ahu or "-"
            else:
                nomor_perdes = tanggal_perdes = nomor_ahu = tanggal_ahu = "-"


            # PETUGAS
            pet = getattr(item, 'petugas', None)

            if pet:
                penasihat = pet.penasihat or "-"
                no_penasihat = pet.no_penasihat or "-"
                pengawas = pet.pengawas or "-"
                no_pengawas = pet.no_pengawas or "-"
                direktur = pet.direktur or "-"
                no_direktur = pet.no_direktur or "-"
                sekretaris = pet.sekretaris or "-"
                no_sekretaris = pet.no_sekretaris or "-"
                bendahara = pet.bendahara or "-"
                no_bendahara = pet.no_bendahara or "-"
            else:
                penasihat = no_penasihat = pengawas = no_pengawas = "-"
                direktur = no_direktur = sekretaris = no_sekretaris = "-"
                bendahara = no_bendahara = "-"

            ws.append([
                i,
                item.nama_bumdes,
                item.desa.nama_desa if item.desa else "-",
                item.desa.kecamatan.nama_kec if item.desa and item.desa.kecamatan else "-",
                item.alamat,
                item.no_hp,
                item.email or "-",
                item.status_bumdes.status if item.status_bumdes else "-",
                item.peringkat.peringkat if item.peringkat else "-",
                sektor,
                jenis,
                

                nomor_perdes,
                tanggal_perdes,
                nomor_ahu,
                tanggal_ahu,

                penasihat,
                no_penasihat,
                pengawas,
                no_pengawas,
                direktur,
                no_direktur,
                sekretaris,
                no_sekretaris,
                bendahara,
                no_bendahara,

                "Aktif" if item.is_active else "Nonaktif"
            ])

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="bumdes.xlsx"'
        wb.save(response)
        return response
    
    ordering_fields = ['nama_bumdes', 'created_at', 'desa__kecamatan__nama_kec']
    ordering = ['nama_bumdes']

    pagination_class = None
    


class LegalitasViewSet(viewsets.ModelViewSet):
    queryset = Legalitas.objects.select_related('bumdes')
    serializer_class = LegalitasSerializer

    filter_backends = [DjangoFilterBackend, SearchFilter]

    permission_classes = [IsAuthenticated]
    
    filterset_fields = [
        'tanggal_perdes',
        'tanggal_ahu'
    ]

    search_fields = [
        'bumdes__nama_bumdes',
        'nomor_perdes',
        'nomor_ahu'
    ]


class PetugasViewSet(viewsets.ModelViewSet):
    queryset = Petugas.objects.select_related('bumdes')
    serializer_class = PetugasSerializer

    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, SearchFilter]

    search_fields = [
        'bumdes__nama_bumdes',
        'direktur',
        'sekretaris'
    ]


