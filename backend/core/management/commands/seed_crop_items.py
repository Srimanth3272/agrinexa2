"""
Seed data for Item Management System
Populates CropCategory, CropType, CropVariety, QualityGrade, and sample PriceHistory
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
import random
from core.item_models import (
    CropCategory, CropType, CropVariety, 
    QualityGrade, PriceHistory, SeasonalTrend
)


class Command(BaseCommand):
    help = 'Seeds the database with crop item data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting to seed crop item data...')
        
        # Clear existing data (optional - comment out if you want to keep existing data)
        # self.clear_data()
        
        # Seed in order of dependencies
        self.seed_categories()
        self.seed_crop_types()
        self.seed_varieties()
        self.seed_quality_grades()
        self.seed_price_history()
        self.seed_seasonal_trends()
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded all crop item data!'))
    
    def clear_data(self):
        self.stdout.write('Clearing existing data...')
        PriceHistory.objects.all().delete()
        SeasonalTrend.objects.all().delete()
        QualityGrade.objects.all().delete()
        CropVariety.objects.all().delete()
        CropType.objects.all().delete()
        CropCategory.objects.all().delete()
    
    def seed_categories(self):
        self.stdout.write('Seeding crop categories...')
        
        categories = [
            {'name': 'Cereals', 'code': 'CRL', 'icon': '🌾', 
             'description': 'Grain crops including rice, wheat, and maize'},
            {'name': 'Pulses', 'code': 'PLS', 'icon': '🫘', 
             'description': 'Legume crops including gram, tur, and moong'},
            {'name': 'Oilseeds', 'code': 'OIL', 'icon': '🌻', 
             'description': 'Oil-bearing crops including groundnut, sunflower, and mustard'},
            {'name': 'Vegetables', 'code': 'VEG', 'icon': '🥬', 
             'description': 'Vegetable crops for consumption'},
            {'name': 'Spices', 'code': 'SPC', 'icon': '🌶️', 
             'description': 'Spice crops including chili, turmeric, and coriander'},
        ]
        
        for cat_data in categories:
            category, created = CropCategory.objects.get_or_create(
                code=cat_data['code'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(f'  Created category: {category.name}')
    
    def seed_crop_types(self):
        self.stdout.write('Seeding crop types...')
        
        crop_types_data = [
            # Cereals
            {'category_code': 'CRL', 'name': 'Paddy', 'code': 'PDY', 
             'growing_season': 'Kharif', 'avg_yield_per_acre': 25.50, 'current_msp': 2040.00},
            {'category_code': 'CRL', 'name': 'Wheat', 'code': 'WHT', 
             'growing_season': 'Rabi', 'avg_yield_per_acre': 30.00, 'current_msp': 2125.00},
            {'category_code': 'CRL', 'name': 'Maize', 'code': 'MZE', 
             'growing_season': 'Kharif', 'avg_yield_per_acre': 28.00, 'current_msp': 1962.00},
            
            # Pulses
            {'category_code': 'PLS', 'name': 'Tur/Arhar', 'code': 'TUR', 
             'growing_season': 'Kharif', 'avg_yield_per_acre': 8.50, 'current_msp': 7000.00},
            {'category_code': 'PLS', 'name': 'Gram/Chana', 'code': 'GRM', 
             'growing_season': 'Rabi', 'avg_yield_per_acre': 10.00, 'current_msp': 5440.00},
            {'category_code': 'PLS', 'name': 'Moong', 'code': 'MNG', 
             'growing_season': 'Kharif', 'avg_yield_per_acre': 6.00, 'current_msp': 7755.00},
        ]
        
        for ct_data in crop_types_data:
            category = CropCategory.objects.get(code=ct_data.pop('category_code'))
            crop_type, created = CropType.objects.get_or_create(
                code=ct_data['code'],
                defaults={**ct_data, 'category': category}
            )
            if created:
                self.stdout.write(f'  Created crop type: {crop_type.name}')
    
    def seed_varieties(self):
        self.stdout.write('Seeding crop varieties...')
        
        varieties_data = [
            # Paddy varieties
            {'crop_type_code': 'PDY', 'name': 'Basmati 1121', 'code': 'PDY-BAS1121',
             'grain_type': 'Long grain', 'maturity_days': 145, 'avg_grain_length': 8.30,
             'aroma_level': 5, 'base_price_per_quintal': 4500.00, 'premium_percentage': 120.00,
             'demand_level': 'HIGH', 'is_featured': True,
             'description': 'Premium long grain basmati rice with excellent aroma'},
            
            {'crop_type_code': 'PDY', 'name': 'Pusa Basmati', 'code': 'PDY-PBAS',
             'grain_type': 'Long grain', 'maturity_days': 140, 'avg_grain_length': 7.80,
             'aroma_level': 4, 'base_price_per_quintal': 3800.00, 'premium_percentage': 85.00,
             'demand_level': 'HIGH', 'is_featured': True,
             'description': 'Popular basmati variety with good aroma and yield'},
            
            {'crop_type_code': 'PDY', 'name': 'Swarna', 'code': 'PDY-SWR',
             'grain_type': 'Medium grain', 'maturity_days': 130, 'avg_grain_length': 5.50,
             'aroma_level': 2, 'base_price_per_quintal': 2500.00, 'premium_percentage': 22.00,
             'demand_level': 'MEDIUM', 'is_featured': False,
             'description': 'Common non-basmati variety with good yield'},
            
            {'crop_type_code': 'PDY', 'name': 'IR-64', 'code': 'PDY-IR64',
             'grain_type': 'Medium grain', 'maturity_days': 120, 'avg_grain_length': 5.20,
             'aroma_level': 1, 'base_price_per_quintal': 2300.00, 'premium_percentage': 13.00,
             'demand_level': 'MEDIUM', 'is_featured': False,
             'description': 'Popular non-basmati variety for domestic consumption'},
            
            {'crop_type_code': 'PDY', 'name': 'Sona Masuri', 'code': 'PDY-SM',
             'grain_type': 'Medium grain', 'maturity_days': 125, 'avg_grain_length': 5.00,
             'aroma_level': 2, 'base_price_per_quintal': 2600.00, 'premium_percentage': 27.00,
             'demand_level': 'HIGH', 'is_featured': False,
             'description': 'Premium non-basmati variety popular in South India'},
            
            # Wheat varieties
            {'crop_type_code': 'WHT', 'name': 'PBW 343', 'code': 'WHT-PBW343',
             'grain_type': 'Amber', 'maturity_days': 150, 'avg_grain_length': None,
             'aroma_level': None, 'base_price_per_quintal': 2200.00, 'premium_percentage': 3.50,
             'demand_level': 'HIGH', 'is_featured': True,
             'description': 'Popular wheat variety in Punjab'},
            
            {'crop_type_code': 'WHT', 'name': 'HD 2967', 'code': 'WHT-HD2967',
             'grain_type': 'Amber', 'maturity_days': 155, 'avg_grain_length': None,
             'aroma_level': None, 'base_price_per_quintal': 2150.00, 'premium_percentage': 1.20,
             'demand_level': 'MEDIUM', 'is_featured': False,
             'description': 'Heat-tolerant wheat variety'},
        ]
        
        for var_data in varieties_data:
            crop_type = CropType.objects.get(code=var_data.pop('crop_type_code'))
            variety, created = CropVariety.objects.get_or_create(
                code=var_data['code'],
                defaults={**var_data, 'crop_type': crop_type}
            )
            if created:
                self.stdout.write(f'  Created variety: {variety.name}')
    
    def seed_quality_grades(self):
        self.stdout.write('Seeding quality grades...')
        
        varieties = CropVariety.objects.all()
        
        grade_templates = [
            {'grade_name': 'Premium', 'grade_code': 'PREM', 'price_multiplier': 1.20,
             'max_moisture_content': 14.00, 'max_foreign_matter': 1.00, 'min_grain_purity': 98.00,
             'description': 'Premium quality with minimal impurities'},
            
            {'grade_name': 'Grade A', 'grade_code': 'GRD_A', 'price_multiplier': 1.10,
             'max_moisture_content': 15.00, 'max_foreign_matter': 2.00, 'min_grain_purity': 95.00,
             'description': 'High quality suitable for premium markets'},
            
            {'grade_name': 'Grade B', 'grade_code': 'GRD_B', 'price_multiplier': 1.00,
             'max_moisture_content': 16.00, 'max_foreign_matter': 3.00, 'min_grain_purity': 90.00,
             'description': 'Standard quality for general consumption'},
            
            {'grade_name': 'Grade C', 'grade_code': 'GRD_C', 'price_multiplier': 0.90,
             'max_moisture_content': 18.00, 'max_foreign_matter': 5.00, 'min_grain_purity': 85.00,
             'description': 'Below standard quality'},
        ]
        
        for variety in varieties:
            for grade_data in grade_templates:
                grade, created = QualityGrade.objects.get_or_create(
                    crop_variety=variety,
                    grade_code=grade_data['grade_code'],
                    defaults=grade_data
                )
                if created:
                    self.stdout.write(f'  Created grade: {grade.grade_name} for {variety.name}')
    
    def seed_price_history(self):
        self.stdout.write('Seeding price history (last 90 days)...')
        
        varieties = CropVariety.objects.all()
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=90)
        
        states = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Bihar', 'West Bengal']
        
        for variety in varieties:
            base_price = float(variety.base_price_per_quintal)
            current_date = start_date
            
            while current_date <= end_date:
                # Generate realistic price variation
                daily_variation = random.uniform(-0.05, 0.05)  # ±5% variation
                modal = base_price * (1 + daily_variation)
                min_price = modal * 0.95
                max_price = modal * 1.05
                avg_price = (min_price + max_price + modal * 2) / 4
                
                volume = random.uniform(100, 500)
                
                PriceHistory.objects.create(
                    crop_variety=variety,
                    date=current_date,
                    min_price=Decimal(str(round(min_price, 2))),
                    max_price=Decimal(str(round(max_price, 2))),
                    avg_price=Decimal(str(round(avg_price, 2))),
                    modal_price=Decimal(str(round(modal, 2))),
                    volume_traded=Decimal(str(round(volume, 2))),
                    state=random.choice(states),
                    source='System Generated'
                )
                
                current_date += timedelta(days=1)
            
            self.stdout.write(f'  Created 90 days price history for {variety.name}')
    
    def seed_seasonal_trends(self):
        self.stdout.write('Seeding seasonal trends...')
        
        varieties = CropVariety.objects.all()
        
        for variety in varieties:
            for month in range(1, 13):
                # Simple seasonal pattern
                if month in [10, 11, 12]:  # Harvest months
                    supply_level = 'SURPLUS'
                    price_index = Decimal('95.00')
                    demand_level = 'MEDIUM'
                elif month in [4, 5, 6]:  # Lean months
                    supply_level = 'SHORTAGE'
                    price_index = Decimal('110.00')
                    demand_level = 'HIGH'
                else:
                    supply_level = 'BALANCED'
                    price_index = Decimal('100.00')
                    demand_level = 'MEDIUM'
                
                SeasonalTrend.objects.create(
                    crop_variety=variety,
                    month=month,
                    avg_price_index=price_index,
                    price_volatility='MEDIUM',
                    supply_level=supply_level,
                    demand_level=demand_level
                )
            
            self.stdout.write(f'  Created seasonal trends for {variety.name}')
