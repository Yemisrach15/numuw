from __future__ import annotations

from django.conf import settings
from django.db import models


class Therapist(models.Model):
    name = models.CharField(max_length=255)
    specialty = models.CharField(max_length=255)
    bio = models.TextField(blank=True)

    def __str__(self) -> str:
        return self.name


class AvailabilitySlot(models.Model):
    therapist = models.ForeignKey(Therapist, on_delete=models.CASCADE, related_name="availability_slots")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    class Meta:
        ordering = ["start_time"]

    def __str__(self) -> str:
        return f"{self.therapist} - {self.start_time:%Y-%m-%d %H:%M}"


class Parent(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="parent_profile")
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)

    def __str__(self) -> str:
        return self.name


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"

    parent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings")
    slot = models.ForeignKey(AvailabilitySlot, on_delete=models.CASCADE, related_name="bookings")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.parent} -> {self.slot} ({self.status})"
