from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response


from rest_framework import viewsets
from .serializers import ProfileSerializer, UserSerializer

User = get_user_model()


class UserViewSet(
    viewsets.ModelViewSet
):

    queryset = User.objects.all()

    serializer_class = UserSerializer

    permission_classes = [
        IsAdminUser
    ]

    
class ProfileView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        serializer = ProfileSerializer(
            request.user
        )

        return Response(
            serializer.data
        )
    
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not user.check_password(old_password):
            return Response({"error": "Password lama salah"}, status=400)

        user.set_password(new_password)
        user.save()

        return Response({"message": "Password berhasil diubah"})
    
class VerifyPasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")

        if not user.check_password(old_password):
            return Response({"error": "Password salah"}, status=400)

        return Response({"message": "OK"})

class UpdateUsernameView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        username = request.data.get("username")

        if not username:
            return Response({"error": "Username wajib diisi"}, status=400)

        user.username = username
        user.save()

        return Response({"username": user.username})