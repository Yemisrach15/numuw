from __future__ import annotations

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from .models import AvailabilitySlot, Booking, Therapist


class AvailabilitySlotSerializer(serializers.ModelSerializer):
    therapist_name = serializers.CharField(source="therapist.name", read_only=True)
    therapist_specialty = serializers.CharField(source="therapist.specialty", read_only=True)

    class Meta:
        model = AvailabilitySlot
        fields = ["id", "therapist", "therapist_name", "therapist_specialty", "start_time", "end_time"]


class TherapistListSerializer(serializers.ModelSerializer):
    upcoming_slots_count = serializers.IntegerField(read_only=True)
    next_available_slot = serializers.SerializerMethodField()

    class Meta:
        model = Therapist
        fields = ["id", "name", "specialty", "bio", "upcoming_slots_count", "next_available_slot"]

    def get_next_available_slot(self, obj):
        slot = (
            obj.availability_slots.filter(start_time__gt=timezone.now())
            .exclude(bookings__isnull=False)
            .order_by("start_time")
            .first()
        )
        if slot is None:
            return None
        return AvailabilitySlotSerializer(slot).data


class BookingSerializer(serializers.ModelSerializer):
    slot = AvailabilitySlotSerializer(read_only=True)
    therapist_name = serializers.CharField(source="slot.therapist.name", read_only=True)

    class Meta:
        model = Booking
        fields = ["id", "slot", "therapist_name", "status", "created_at"]


class BookingCreateSerializer(serializers.Serializer):
    slot_id = serializers.IntegerField()

    def validate_slot_id(self, value):
        if not AvailabilitySlot.objects.filter(id=value, start_time__gt=timezone.now()).exists():
            raise serializers.ValidationError("Slot does not exist or is not upcoming.")
        return value

    def create(self, validated_data):
        from .tasks import confirm_booking

        slot_id = validated_data["slot_id"]
        request = self.context["request"]

        with transaction.atomic():
            slot = AvailabilitySlot.objects.select_for_update().get(id=slot_id)
            if slot.start_time <= timezone.now():
                raise serializers.ValidationError({"slot_id": "Slot is no longer upcoming."})

            if Booking.objects.filter(slot=slot).exists():
                raise serializers.ValidationError({"slot_id": "Slot is already booked."})

            booking = Booking.objects.create(parent=request.user, slot=slot)
            transaction.on_commit(lambda: confirm_booking.delay(booking.id))
        return booking
