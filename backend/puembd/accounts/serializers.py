from rest_framework import serializers
from .models import User
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.password_validation import validate_password
from rest_framework import status, serializers

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        required=False
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "role",
            "is_active",
            "password"
        ]

    def create(self, validated_data):

        password = validated_data.pop(
            "password"
        )

        user = User(**validated_data)

        user.set_password(password)

        user.save()

        return user

    def update(
        self,
        instance,
        validated_data
    ):

        password = validated_data.pop(
            "password",
            None
        )

        for key, value in validated_data.items():
            setattr(
                instance,
                key,
                value
            )

        if password:
            instance.set_password(
                password
            )

        instance.save()

        return instance
    
class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "role",
            "is_verified",
            "created_at",
        ]

class UpdateUsernameView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        username = request.data.get("username")

        if not username:
            return Response({"error": "Username wajib diisi"}, status=400)

        user.username = username
        user.save()

        return Response({
            "message": "Username berhasil diupdate",
            "username": user.username
        })

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not user.check_password(old_password):
            return Response({"error": "Password lama salah"}, status=400)

        try:
            validate_password(new_password)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

        user.set_password(new_password)
        user.save()

        return Response({"message": "Password berhasil diubah"})