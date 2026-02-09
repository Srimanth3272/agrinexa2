from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from accounts.models import User, FarmerProfile, BuyerProfile
from core.models import Region, CropVariety, QualityParameter
from market.models import CropListing, Bid


class Command(BaseCommand):
    help = 'Seed database with initial data'
    
    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')
        
        # Create Regions
        self.stdout.write('Creating regions...')
        regions_data = [
            ('Punjab', 'Amritsar'),
            ('Punjab', 'Ludhiana'),
            ('Punjab', 'Patiala'),
            ('Haryana', 'Karnal'),
            ('Haryana', 'Panipat'),
            ('Uttar Pradesh', 'Meerut'),
            ('Uttar Pradesh', 'Bareilly'),
            ('West Bengal', 'Bardhaman'),
            ('West Bengal', 'Murshidabad'),
            ('Andhra Pradesh', 'Krishna'),
            ('Andhra Pradesh', 'Guntur'),
        ]
        
        for state, district in regions_data:
            Region.objects.get_or_create(state=state, district=district)
        
        # Create Crop Varieties
        self.stdout.write('Creating crop varieties...')
        varieties_data = [
            ('Basmati 370', 'Premium aromatic long-grain rice', 2800),
            ('Pusa Basmati 1121', 'Extra long grain aromatic rice', 3200),
            ('IR 64', 'Medium grain non-aromatic rice', 2200),
            ('Swarna', 'Medium slender grain rice', 2400),
            ('Sona Masuri', 'Medium grain lightweight rice', 2600),
        ]
        
        for name, desc, price in varieties_data:
            CropVariety.objects.get_or_create(
                name=name,
                defaults={'description': desc, 'base_price_per_quintal': price}
            )
        
        # Create Quality Parameters
        self.stdout.write('Creating quality parameters...')
        params_data = [
            ('Moisture Content', 'Moisture percentage in paddy', 'Below 14%'),
            ('Foreign Matter', 'Non-rice foreign materials', 'Below 1%'),
            ('Damaged Grains', 'Percentage of damaged grains', 'Below 3%'),
            ('Grain Length', 'Average grain length', 'Varies by variety'),
        ]
        
        for name, desc, range_val in params_data:
            QualityParameter.objects.get_or_create(
                parameter_name=name,
                defaults={'description': desc, 'acceptable_range': range_val}
            )
        
        # Create Admin User
        self.stdout.write('Creating admin user...')
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@agrobid.com',
                password='admin123',
                phone='9999999999',
                role='ADMIN'
            )
            admin.is_verified = True
            admin.save()
            self.stdout.write(self.style.SUCCESS('Admin user created: admin/admin123'))
        
        # Create Farmer Users
        self.stdout.write('Creating farmer users...')
        farmers_data = [
            ('farmer1', 'farmer1@test.com', '9876543211', 'Farmer One'),
            ('farmer2', 'farmer2@test.com', '9876543212', 'Farmer Two'),
            ('farmer3', 'farmer3@test.com', '9876543213', 'Farmer Three'),
        ]
        
        farmers = []
        for username, email, phone, name in farmers_data:
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password='farmer123',
                    phone=phone,
                    role='FARMER',
                    first_name=name.split()[0],
                    last_name=name.split()[1] if len(name.split()) > 1 else ''
                )
                user.is_verified = True
                user.save()
                
                # Create farmer profile
                FarmerProfile.objects.create(
                    user=user,
                    address='Farm Address, Village',
                    state='Punjab',
                    district='Amritsar',
                    pincode='143001',
                    land_size_acres=10.5,
                    aadhar_number='123456789012'
                )
                farmers.append(user)
                self.stdout.write(self.style.SUCCESS(f'Created farmer: {username}/farmer123'))
        
        # Create Buyer Users
        self.stdout.write('Creating buyer users...')
        buyers_data = [
            ('buyer1', 'buyer1@test.com', '9876543221', 'Rice Mill One', 'GST1234567890'),
            ('buyer2', 'buyer2@test.com', '9876543222', 'Rice Mill Two', 'GST2234567890'),
        ]
        
        buyers = []
        for username, email, phone, company, gst in buyers_data:
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password='buyer123',
                    phone=phone,
                    role='BUYER'
                )
                user.is_verified = True
                user.save()
                
                # Create buyer profile
                BuyerProfile.objects.create(
                    user=user,
                    company_name=company,
                    address='Mill Address, City',
                    state='Punjab',
                    district='Ludhiana',
                    pincode='141001',
                    mill_capacity_tons_per_day=50.0,
                    gst_number=gst
                )
                buyers.append(user)
                self.stdout.write(self.style.SUCCESS(f'Created buyer: {username}/buyer123'))
        
        # Create Sample Listings
        if farmers:
            self.stdout.write('Creating sample crop listings...')
            crops = CropVariety.objects.all()
            
            for i, farmer in enumerate(farmers[:2]):  # First 2 farmers create listings
                for j, crop in enumerate(crops[:3]):  # 3 listings each
                    if not CropListing.objects.filter(farmer=farmer, crop_variety=crop).exists():
                        listing = CropListing.objects.create(
                            farmer=farmer,
                            crop_variety=crop,
                            quantity_quintals=100 + (i * 50) + (j * 20),
                            expected_price_per_quintal=crop.base_price_per_quintal + (i * 100),
                            location_description='Farm near village',
                            district='Amritsar',
                            state='Punjab',
                            moisture_content=12.5,
                            foreign_matter=0.5,
                            expires_at=timezone.now() + timedelta(days=30)
                        )
                        self.stdout.write(f'Created listing: {listing.id}')
                        
                        # Create sample bids
                        if buyers and j == 0:  # First listing gets bids
                            for buyer in buyers:
                                Bid.objects.create(
                                    listing=listing,
                                    buyer=buyer,
                                    amount_per_quintal=listing.expected_price_per_quintal + 50
                                )
                                self.stdout.write(f'Created bid from {buyer.username}')
        
        self.stdout.write(self.style.SUCCESS('Database seeding completed!'))
        self.stdout.write('')
        self.stdout.write('Test Credentials:')
        self.stdout.write('Admin: admin/admin123')
        self.stdout.write('Farmers: farmer1, farmer2, farmer3 (password: farmer123)')
        self.stdout.write('Buyers: buyer1, buyer2 (password: buyer123)')
