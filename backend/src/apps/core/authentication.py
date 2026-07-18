from __future__ import annotations

from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

from .firebase import get_or_create_local_user, verify_firebase_token


class FirebaseAuthentication(BaseAuthentication):
    keyword = "bearer"

    def authenticate(self, request):
        header = get_authorization_header(request).split()
        if not header:
            return None

        if header[0].lower() != self.keyword.encode():
            return None

        if len(header) != 2:
            raise AuthenticationFailed("Invalid Authorization header format.")

        token = header[1].decode()
        if not token:
            raise AuthenticationFailed("Missing Firebase ID token.")

        try:
            identity = verify_firebase_token(token)
        except Exception as exc:  # pragma: no cover - surfaces as auth failure
            raise AuthenticationFailed("Invalid Firebase ID token.") from exc

        user = get_or_create_local_user(identity)
        return user, identity
