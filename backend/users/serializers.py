import uuid
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


# ─────────────────────────────────────────────────────────────
# Registration
# ─────────────────────────────────────────────────────────────
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, style={"input_type": "password"}, validators=[validate_password]
    )
    confirm_password = serializers.CharField(
        write_only=True, style={"input_type": "password"}
    )

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "password",
            "confirm_password",
        )
        extra_kwargs = {"email": {"required": True}}

    # cross-field validation
    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"password": "Passwords do not match."}
            )
        return attrs

    # create the user
    def create(self, validated_data):
        validated_data.pop("confirm_password")
        username = uuid.uuid4().hex[:30]
        return User.objects.create_user(
            username=username,
            email=validated_data["email"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            password=validated_data["password"],
        )


# ─────────────────────────────────────────────────────────────
# Email-based JWT login
# ─────────────────────────────────────────────────────────────
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Tell Simple-JWT to treat the email field as the login key."""
    username_field = "email"


# ─────────────────────────────────────────────────────────────
# Profile (retrieve / update )
# ─────────────────────────────────────────────────────────────
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name")
        read_only_fields = ("email",)


# ─────────────────────────────────────────────────────────────
# Change password endpoint
# ─────────────────────────────────────────────────────────────
class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(
        write_only=True, style={"input_type": "password"}
    )
    new_password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
        validators=[validate_password],
    )
    confirm_password = serializers.CharField(  # ← Add this field
        write_only=True, style={"input_type": "password"}
    )

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate(self, attrs):  # ← Add this method for cross-field validation
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Password confirmation does not match."
            })
        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user