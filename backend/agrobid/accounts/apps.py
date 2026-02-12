from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'agrobid.accounts'
    label = 'accounts'  # Keep simple label for AUTH_USER_MODEL
