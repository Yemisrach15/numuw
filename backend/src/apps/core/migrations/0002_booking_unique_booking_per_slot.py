from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0001_initial"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="booking",
            constraint=models.UniqueConstraint(fields=["slot"], name="unique_booking_per_slot"),
        ),
    ]
