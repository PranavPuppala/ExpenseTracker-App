import uuid
from django.contrib.auth import get_user_model

User = get_user_model()


def register_user(validated_data):
    validated_data.pop("confirm_password")
    username = uuid.uuid4().hex[:30]
    return User.objects.create_user(
        username=username,
        email=validated_data["email"],
        first_name=validated_data.get("first_name", ""),
        last_name=validated_data.get("last_name", ""),
        password=validated_data["password"],
    )


def change_password(user, new_password):
    user.set_password(new_password)
    user.save(update_fields=["password"])