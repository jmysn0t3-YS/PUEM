# accounts/permissions.py

from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):

    def has_permission(self, request, view):
        return request.user.role == 'admin'


class IsOperator(BasePermission):

    def has_permission(self, request, view):
        return request.user.role == 'operator'


class IsViewer(BasePermission):

    def has_permission(self, request, view):
        return request.user.role == 'viewer'