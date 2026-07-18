from django.urls import path

from .views import BookingListCreateView, TherapistListView, TherapistSlotsView, health_check


urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("therapists/", TherapistListView.as_view(), name="therapist-list"),
    path("therapists/<int:therapist_id>/slots/", TherapistSlotsView.as_view(), name="therapist-slots"),
    path("bookings/", BookingListCreateView.as_view(), name="booking-list-create"),
]

