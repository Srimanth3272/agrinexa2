import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrobid.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Admin credentials
username = 'Srimanth3272'
password = 'Srimanth@3272'
email = 'admin@agrobid.com'

# Delete existing superusers
User.objects.filter(is_superuser=True).delete()

# Create new superuser
admin_user = User.objects.create_superuser(
    username=username,
    email=email,
    password=password,
    first_name='Admin',
    last_name='User',
    role='ADMIN'
)

print(f"✅ Superuser created successfully!")
print(f"Username: {username}")
print(f"Password: {password}")
print(f"Admin Panel: http://localhost:8000/admin/")
