from django.contrib import admin

from .models import AvailabilitySlot, Booking, Parent, Therapist


@admin.register(Therapist)
class TherapistAdmin(admin.ModelAdmin):
    list_display = ("name", "specialty")
    search_fields = ("name", "specialty")


@admin.register(AvailabilitySlot)
class AvailabilitySlotAdmin(admin.ModelAdmin):
    list_display = ("therapist", "start_time", "end_time")
    list_filter = ("therapist",)
    search_fields = ("therapist__name",)


@admin.register(Parent)
class ParentAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "user")
    search_fields = ("name", "email", "user__username", "user__email")


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("parent", "slot", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("parent__username", "parent__email", "slot__therapist__name")
