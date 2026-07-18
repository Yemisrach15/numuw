from django.db.models import Count, Q
from django.http import JsonResponse
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AvailabilitySlot, Booking, Therapist
from .serializers import AvailabilitySlotSerializer, BookingCreateSerializer, BookingSerializer, TherapistListSerializer


def health_check(request):
    return JsonResponse({"status": "ok"})


class TherapistListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TherapistListSerializer

    def get_queryset(self):
        return Therapist.objects.annotate(
            upcoming_slots_count=Count(
                "availability_slots",
                filter=Q(availability_slots__start_time__gt=timezone.now()) & Q(availability_slots__bookings__isnull=True),
                distinct=True,
            )
        )


class TherapistSlotsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AvailabilitySlotSerializer

    def get_queryset(self):
        therapist_id = self.kwargs["therapist_id"]
        booked_slots = Booking.objects.values_list("slot_id", flat=True)
        return (
            AvailabilitySlot.objects.filter(therapist_id=therapist_id, start_time__gt=timezone.now())
            .exclude(id__in=booked_slots)
            .select_related("therapist")
            .order_by("start_time")
        )


class BookingListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(parent=request.user).select_related("slot", "slot__therapist").order_by("-created_at")
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)

