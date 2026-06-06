# bumdes/dashboard_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.db.models import Count

from .models import Bumdes
from wilayah.models import Kecamatan, Desa
from atribut.models import Status


class DashboardAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        total_bumdes = Bumdes.objects.count()

        total_kecamatan = Kecamatan.objects.count()

        total_desa = Desa.objects.count()

        total_status = Status.objects.count()

        bumdes_aktif = Bumdes.objects.filter(
            is_active=True
        ).count()

        statistik_status = (
            Bumdes.objects
            .values('status_bumdes__status')
            .annotate(total=Count('id'))
            .order_by('status_bumdes__status')
        )

        statistik_kecamatan = (
            Bumdes.objects
            .values('desa__kecamatan__nama_kec')
            .annotate(total=Count('id'))
            .order_by('desa__kecamatan__nama_kec')
        )

        data = {

            'summary': {
                'total_bumdes': total_bumdes,
                'total_kecamatan': total_kecamatan,
                'total_desa': total_desa,
                'total_status': total_status,
                'bumdes_aktif': bumdes_aktif,
            },

            'statistik_status': statistik_status,

            'statistik_kecamatan': statistik_kecamatan,
        }

        return Response(data)