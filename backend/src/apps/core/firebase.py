from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache

from django.contrib.auth import get_user_model
from django.conf import settings
from django.db import transaction

from firebase_admin import auth as firebase_auth
from firebase_admin import credentials, get_app, initialize_app

from .models import Parent


@dataclass(frozen=True)
class FirebaseIdentity:
    uid: str
    email: str | None
    name: str | None


def _load_credentials():
    credentials_file = getattr(settings, "FIREBASE_CREDENTIALS_FILE", None)
    project_id = getattr(settings, "FIREBASE_PROJECT_ID", None)

    if credentials_file:
        cred = credentials.Certificate(credentials_file)
    else:
        cred = credentials.ApplicationDefault()

    options = {"projectId": project_id} if project_id else None

    return cred, options


@lru_cache(maxsize=1)
def initialize_firebase() -> None:
    try:
        get_app()
    except ValueError:
        cred, options = _load_credentials()
        if options:
            initialize_app(cred, options)
        else:
            initialize_app(cred)


def verify_firebase_token(id_token: str) -> FirebaseIdentity:
    initialize_firebase()
    decoded_token = firebase_auth.verify_id_token(id_token)
    return FirebaseIdentity(
        uid=decoded_token["uid"],
        email=decoded_token.get("email"),
        name=decoded_token.get("name"),
    )


def get_or_create_local_user(identity: FirebaseIdentity):
    initialize_firebase()
    user_model = get_user_model()

    with transaction.atomic():
        user, _ = user_model.objects.get_or_create(
            username=identity.uid,
            defaults={"email": identity.email or "", "test": identity.name or ""},
        )

        updated_fields = []
        if identity.email and user.email != identity.email:
            user.email = identity.email
            updated_fields.append("email")

        if updated_fields:
            user.save(update_fields=updated_fields)

        parent_defaults = {
            "email": identity.email or user.email or "",
            "name": identity.name or identity.email or identity.uid,
        }
        Parent.objects.update_or_create(user=user, defaults=parent_defaults)

        return user
