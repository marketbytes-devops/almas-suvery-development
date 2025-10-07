# authapp/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

class CustomUser(AbstractUser):
    name = models.CharField(max_length=255, blank=True)
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    email = models.EmailField(unique=True)
    address = models.TextField(blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    image = models.ImageField(upload_to="profile_images/", null=True, blank=True)
    role = models.ForeignKey('Role', on_delete=models.SET_NULL, null=True, blank=True, related_name='users')

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name

class Permission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='permissions')
    page = models.CharField(max_length=100)
    can_view = models.BooleanField(default=False)
    can_add = models.BooleanField(default=False)
    can_edit = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)

    class Meta:
        unique_together = ('role', 'page')

    def __str__(self):
        return f"{self.role.name} - {self.page}"

@receiver(post_save, sender=Role)
def set_default_permissions(sender, instance, created, **kwargs):
    if created:
        default_permissions = [
            # User Dashboard and Profile
            {'page': 'Dashboard', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
            {'page': 'Profile', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
            
            # Enquiry Related Pages
            {'page': 'enquiries', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
            {'page': 'processing_enquiries', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
            {'page': 'follow_ups', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
            {'page': 'scheduled_surveys', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
            {'page': 'new_enquiries', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
            
            # Start Survey Related Pages
            {'page': 'survey_customer', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
            {'page': 'survey_article', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
            {'page': 'survey_pet', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
            {'page': 'survey_service', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
            
            # Additional Settings Pages
            {'page': 'types', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
            {'page': 'units', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
            {'page': 'currency', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
            {'page': 'tax', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
            {'page': 'handyman', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
            {'page': 'manpower', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
            {'page': 'room', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
            
            # User Role Pages
            {'page': 'users', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
            {'page': 'roles', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
            {'page': 'permissions', 'can_view': True, 'can_add': False, 'can_edit': False, 'can_delete': False},
        ]
        for perm in default_permissions:
            Permission.objects.create(
                role=instance,
                page=perm['page'],
                can_view=perm.get('can_view', False),
                can_add=perm.get('can_add', False),
                can_edit=perm.get('can_edit', False),
                can_delete=perm.get('can_delete', False),
            )