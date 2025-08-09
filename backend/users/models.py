# users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)

    @property
    def full_name(self) -> str:
        """Return first + last name, gracefully handling blanks."""
        return f"{self.first_name} {self.last_name}".strip()

    def __str__(self) -> str:
        return self.username
