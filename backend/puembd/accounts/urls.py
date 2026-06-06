from django.urls import path
from .views import ProfileView, ChangePasswordView, UpdateUsernameView, VerifyPasswordView
from rest_framework.routers import DefaultRouter

from .views import UserViewSet

router = DefaultRouter()

router.register(
    "users",
    UserViewSet,
    basename="users"
)
urlpatterns = [
    path("profile/", ProfileView.as_view(), name="profile"),

    path("profile/password/verify/", VerifyPasswordView.as_view()),

    path("profile/password/", ChangePasswordView.as_view(), name="change-password"),
    
    path("profile/username/", UpdateUsernameView.as_view()),

    
]
urlpatterns += router.urls