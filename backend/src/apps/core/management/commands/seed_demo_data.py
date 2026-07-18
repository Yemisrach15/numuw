from __future__ import annotations

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.core.models import AvailabilitySlot, Therapist


class Command(BaseCommand):
    help = "Seed therapists and upcoming availability slots for local development."

    def handle(self, *args, **options):
        now = timezone.now().replace(minute=0, second=0, microsecond=0)

        therapists = [
            {
                "name": "Ava Reed",
                "specialty": "Speech therapy",
                "bio": "Supports expressive language and articulation goals.",
            },
            {
                "name": "Noah Patel",
                "specialty": "Occupational therapy",
                "bio": "Focuses on sensory processing and daily living skills.",
            },
            {
                "name": "Mia Johnson",
                "specialty": "Behavioral therapy",
                "bio": "Works on routines, regulation, and parent coaching.",
            },
        ]

        created_therapists = []
        for therapist_data in therapists:
            therapist, _ = Therapist.objects.get_or_create(
                name=therapist_data["name"],
                defaults=therapist_data,
            )
            created_therapists.append(therapist)

        for therapist in created_therapists:
            for offset in range(1, 6):
                start_time = now + timedelta(days=offset, hours=9)
                AvailabilitySlot.objects.get_or_create(
                    therapist=therapist,
                    start_time=start_time,
                    defaults={"end_time": start_time + timedelta(minutes=45)},
                )

        self.stdout.write(self.style.SUCCESS("Seed data created."))
