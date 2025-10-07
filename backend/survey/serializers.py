from rest_framework import serializers
from .models import Survey, DestinationAddress, Article, Vehicle, Pet
from additional_settings.models import Room, VolumeUnit, WeightUnit, PackingType, Handyman, Currency, VehicleType
from contact.models import Enquiry
from django.db import transaction
from additional_settings.models import Item

class DestinationAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = DestinationAddress
        fields = ['id', 'survey', 'address', 'city', 'country', 'state', 'zip', 'poe']
        read_only_fields = ['id']

class ArticleSerializer(serializers.ModelSerializer):
    room_name = serializers.CharField(source='room.name', read_only=True, allow_null=True)
    volume_unit_name = serializers.CharField(source='volume_unit.name', read_only=True, allow_null=True)
    weight_unit_name = serializers.CharField(source='weight_unit.name', read_only=True, allow_null=True)
    handyman_name = serializers.CharField(source='handyman.type_name', read_only=True, allow_null=True)
    packing_option_name = serializers.CharField(source='packing_option.name', read_only=True, allow_null=True)
    currency_code = serializers.CharField(source='currency.name', read_only=True, allow_null=True)

    class Meta:
        model = Article
        fields = [
            'id', 'survey', 'room', 'room_name', 'item_name', 'quantity',
            'volume', 'volume_unit', 'volume_unit_name', 'weight', 'weight_unit', 'weight_unit_name',
            'handyman', 'handyman_name', 'packing_option', 'packing_option_name',
            'move_status', 'amount', 'currency', 'currency_code', 'remarks', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        # Ensure item_name exists in the selected room
        room = data.get('room')
        item_name = data.get('item_name')
        if room and item_name:
            if not Item.objects.filter(room=room, name=item_name).exists():
                raise serializers.ValidationError({
                    'item_name': f"Invalid item '{item_name}' for room '{room.name}'. Please select a valid item."
                })
        return data

class VehicleSerializer(serializers.ModelSerializer):
    vehicle_type_name = serializers.CharField(source='vehicle_type.name', read_only=True, allow_null=True)

    class Meta:
        model = Vehicle
        fields = ['id', 'survey', 'vehicle_type', 'vehicle_type_name', 'make', 'model', 'insurance', 'remark', 'transport_mode', 'created_at']
        read_only_fields = ['id', 'created_at']

class PetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pet
        fields = [
            'id', 'survey', 'pet_name', 'pet_type', 'breed', 'age', 'weight',
            'special_care', 'transport_requirements', 'feeding_instructions',
            'medication', 'vaccination_status', 'behavior_notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class SurveySerializer(serializers.ModelSerializer):
    destination_addresses = DestinationAddressSerializer(many=True, required=False)
    articles = ArticleSerializer(many=True, required=False)
    vehicles = VehicleSerializer(many=True, required=False)
    pets = PetSerializer(many=True, required=False)
    
    full_name = serializers.CharField(source="enquiry.fullName", read_only=True)
    phone_number = serializers.CharField(source="enquiry.phoneNumber", read_only=True)
    email = serializers.EmailField(source="enquiry.email", read_only=True)
    service_type = serializers.CharField(source="enquiry.serviceType", read_only=True)
    message = serializers.CharField(source="enquiry.message", read_only=True)
    note = serializers.CharField(source="enquiry.note", read_only=True)
    survey_date = serializers.DateTimeField(source="enquiry.survey_date", read_only=True)
    assigned_user_email = serializers.CharField(
        source="enquiry.assigned_user.email", read_only=True
    )

    class Meta:
        model = Survey
        fields = [
            'id', 'enquiry', 'customer_type', 'is_military', 'salutation', 'first_name',
            'middle_name', 'last_name', 'mobile_country_code', 'mobile_number', 'email',
            'address', 'company', 'survey_id', 'service_type', 'goods_type', 'status',
            'survey_date', 'survey_start_time', 'survey_end_time', 'work_description',
            'include_vehicle', 'include_pet', 'cost_together_vehicle', 'cost_together_pet',
            'same_as_customer_address', 'origin_address', 'origin_city', 'origin_country',
            'origin_state', 'origin_zip', 'pod_pol', 'multiple_addresses',
            'destination_addresses', 'packing_date_from', 'packing_date_to', 'loading_date',
            'eta', 'etd', 'est_delivery_date', 'storage_start_date', 'storage_frequency',
            'storage_duration', 'storage_mode', 'transport_mode',
            'general_owner_packed', 'general_owner_packed_notes', 'general_restriction',
            'general_restriction_notes', 'general_handyman', 'general_handyman_notes',
            'general_insurance', 'general_insurance_notes', 'origin_floor',
            'origin_floor_notes', 'origin_lift', 'origin_lift_notes', 'origin_parking',
            'origin_parking_notes', 'origin_storage', 'origin_storage_notes',
            'destination_floor', 'destination_floor_notes', 'destination_lift',
            'destination_lift_notes', 'destination_parking', 'destination_parking_notes',
            'articles', 'vehicles', 'pets', 'full_name', 'phone_number', 'email',
            'service_type', 'message', 'note', 'survey_date', 'assigned_user_email',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'enquiry', 'created_at', 'updated_at', 'full_name', 'phone_number',
            'email', 'service_type', 'message', 'note', 'assigned_user_email', 'survey_date'
        ]

    def validate(self, data):
        if data.get("same_as_customer_address") and not data.get("address"):
            raise serializers.ValidationError(
                {"address": "Customer address is required when same_as_customer_address is true"}
            )
        return data

    def create(self, validated_data):
        destination_addresses_data = validated_data.pop("destination_addresses", [])
        articles_data = validated_data.pop("articles", [])
        vehicles_data = validated_data.pop("vehicles", [])
        pets_data = validated_data.pop("pets", [])
        
        with transaction.atomic():
            survey = Survey.objects.create(**validated_data)
            
            for address_data in destination_addresses_data:
                DestinationAddress.objects.create(survey=survey, **address_data)
            for article_data in articles_data:
                Article.objects.create(survey=survey, **article_data)
            for vehicle_data in vehicles_data:
                Vehicle.objects.create(survey=survey, **vehicle_data)
            for pet_data in pets_data:
                Pet.objects.create(survey=survey, **pet_data)
                
        return survey

    def update(self, instance, validated_data):
        destination_addresses_data = validated_data.pop("destination_addresses", None)
        articles_data = validated_data.pop("articles", None)
        vehicles_data = validated_data.pop("vehicles", None)
        pets_data = validated_data.pop("pets", None)
        
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            
            if destination_addresses_data is not None:
                instance.destination_addresses.all().delete()
                for address_data in destination_addresses_data:
                    DestinationAddress.objects.create(survey=instance, **address_data)
            
            if articles_data is not None:
                instance.articles.all().delete()
                for article_data in articles_data:
                    Article.objects.create(survey=instance, **article_data)
            
            if vehicles_data is not None:
                instance.vehicles.all().delete()
                for vehicle_data in vehicles_data:
                    Vehicle.objects.create(survey=instance, **vehicle_data)
            
            if pets_data is not None:
                instance.pets.all().delete()
                for pet_data in pets_data:
                    Pet.objects.create(survey=instance, **pet_data)
                    
        return instance