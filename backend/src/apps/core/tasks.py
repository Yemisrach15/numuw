from celery import shared_task

from django.db import transaction


@shared_task
def add(left: int, right: int) -> int:
    return left + right


@shared_task
def confirm_booking(booking_id: int) -> None:
    from .models import Booking

    with transaction.atomic():
        booking = Booking.objects.select_for_update().select_related("slot").get(id=booking_id)
        if booking.status == Booking.Status.PENDING:
            booking.status = Booking.Status.CONFIRMED
            booking.save(update_fields=["status"])

