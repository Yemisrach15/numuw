from celery import shared_task


@shared_task
def add(left: int, right: int) -> int:
    return left + right
