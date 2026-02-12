# AgroBid Exchange System - Database Management System (DBMS) Documentation

## Overview
This document provides a comprehensive database schema design for managing different crop items in the AgroBid Exchange System. The DBMS supports multiple crop categories, varieties, quality grades, price tracking, and market analytics.

---

## Database Architecture

### 1. Hierarchical Structure
```
CropCategory
    └── CropType
            └── CropVariety
                    ├── QualityGrade
                    ├── PriceHistory
                    ├── SeasonalTrend
                    └── ItemSpecification
```

---

## Entity-Relationship Model

### Core Entities

#### 1. **CropCategory**
Main classification of crops

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | Integer (PK) | Unique identifier | 1 |
| name | Varchar(100) | Category name | "Cereals" |
| code | Varchar(20) | Short code | "CRL" |
| description | Text | Detailed description | "Grain crops..." |
| icon | Varchar(50) | Emoji/icon | "🌾" |
| is_active | Boolean | Active status | True |
| created_at | DateTime | Creation timestamp | 2026-01-15 |
| updated_at | DateTime | Last update | 2026-01-20 |

**Sample Data:**
- Cereals (CRL) 🌾
- Pulses (PLS) 🫘
- Oilseeds (OIL) 🌻
- Vegetables (VEG) 🥬
- Fruits (FRT) 🍎

---

#### 2. **CropType**
Specific crop within a category

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | Integer (PK) | Unique identifier | 1 |
| category_id | Foreign Key | Link to CropCategory | 1 (Cereals) |
| name | Varchar(100) | Crop name | "Paddy" |
| code | Varchar(20) | Unique code | "PDY" |
| description | Text | Details | "Rice crop..." |
| growing_season | Varchar(100) | Season | "Kharif" |
| avg_yield_per_acre | Decimal(8,2) | Average yield | 25.50 quintals |
| current_msp | Decimal(10,2) | MSP price | 2040.00 |
| is_active | Boolean | Active status | True |

**Sample Data:**
- Paddy (PDY) under Cereals
- Wheat (WHT) under Cereals
- Maize (MZE) under Cereals
- Tur/Arhar (TUR) under Pulses
- Gram (GRM) under Pulses

---

#### 3. **CropVariety**
Specific variety of a crop type

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | Integer (PK) | Unique identifier | 1 |
| crop_type_id | Foreign Key | Link to CropType | 1 (Paddy) |
| name | Varchar(100) | Variety name | "Basmati 1121" |
| code | Varchar(30) | Unique code | "PDY-BAS1121" |
| description | Text | Details | "Premium long grain..." |
| grain_type | Varchar(50) | Grain classification | "Long grain" |
| maturity_days | Integer | Days to maturity | 145 |
| avg_grain_length | Decimal(5,2) | Grain length (mm) | 8.30 |
| aroma_level | Integer (1-5) | Aroma rating | 5 |
| base_price_per_quintal | Decimal(10,2) | Base price | 4500.00 |
| premium_percentage | Decimal(5,2) | Premium % | 120.00 |
| demand_level | Varchar(20) | Market demand | HIGH |
| is_active | Boolean | Active status | True |
| is_featured | Boolean | Featured variety | True |

**Sample Data for Paddy Varieties:**
- Basmati 1121 (Premium)
- Swarna (Common variety)
- Pusa Basmati
- IR-64 (Non-basmati)
- Jaya
- Sona Masuri

---

#### 4. **QualityGrade**
Quality grading for each variety

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | Integer (PK) | Unique identifier | 1 |
| crop_variety_id | Foreign Key | Link to CropVariety | 1 |
| grade_name | Varchar(50) | Grade name | "Premium" |
| grade_code | Varchar(20) | Grade code | "PREM" |
| min_moisture_content | Decimal(5,2) | Min moisture % | 10.00 |
| max_moisture_content | Decimal(5,2) | Max moisture % | 14.00 |
| max_foreign_matter | Decimal(5,2) | Max foreign matter % | 1.00 |
| min_grain_purity | Decimal(5,2) | Min purity % | 98.00 |
| price_multiplier | Decimal(4,2) | Price factor | 1.20 (120%) |
| description | Text | Grade details | "Top quality..." |

**Quality Grade Hierarchy:**
- Premium (1.20x) - Best quality
- Grade A (1.10x) - High quality
- Grade B (1.00x) - Standard quality
- Grade C (0.90x) - Below standard

---

#### 5. **PriceHistory**
Historical pricing data for analytics

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | Integer (PK) | Unique identifier | 1 |
| crop_variety_id | Foreign Key | Link to CropVariety | 1 |
| date | Date | Price date | 2026-02-10 |
| min_price | Decimal(10,2) | Minimum price | 2400.00 |
| max_price | Decimal(10,2) | Maximum price | 2650.00 |
| avg_price | Decimal(10,2) | Average price | 2520.00 |
| modal_price | Decimal(10,2) | Most common price | 2500.00 |
| volume_traded | Decimal(12,2) | Volume in quintals | 1250.00 |
| state | Varchar(50) | State | "Punjab" |
| district | Varchar(50) | District | "Ludhiana" |
| market | Varchar(100) | Market name | "Khanna Mandi" |
| source | Varchar(100) | Data source | "APMC" |

**Use Cases:**
- Price trend analysis
- Chart generation for analytics page
- Market insights
- Predictive pricing

---

#### 6. **SeasonalTrend**
Monthly seasonal patterns for each crop

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | Integer (PK) | Unique identifier | 1 |
| crop_variety_id | Foreign Key | Link to CropVariety | 1 |
| month | Integer (1-12) | Month number | 10 (October) |
| avg_price_index | Decimal(5,2) | Price index | 105.50 |
| price_volatility | Varchar(20) | Volatility level | HIGH |
| supply_level | Varchar(20) | Supply status | SURPLUS |
| demand_level | Varchar(20) | Demand status | MEDIUM |
| notes | Text | Seasonal insights | "Harvest season..." |

**Monthly Patterns:**
- Jan-Mar: Post-harvest (lower prices)
- Apr-Jun: Lean season (higher prices)
- Jul-Sep: Monsoon season (varied prices)
- Oct-Dec: Harvest season (lower prices)

---

#### 7. **ItemSpecification**
Certifications and technical specifications

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | Integer (PK) | Unique identifier | 1 |
| crop_variety_id | Foreign Key | Link to CropVariety | 1 |
| specification_type | Varchar(50) | Type of spec | ORGANIC |
| certification_body | Varchar(200) | Certifying authority | "APEDA" |
| certification_number | Varchar(100) | Certificate number | "ORG/2026/001" |
| valid_from | Date | Validity start | 2026-01-01 |
| valid_until | Date | Validity end | 2027-01-01 |
| specification_details | JSON | Additional details | {...} |
| document | File | Certificate file | cert.pdf |
| is_verified | Boolean | Verification status | True |

**Specification Types:**
- ORGANIC - Organic certification
- FPO - Farmer Producer Organization certified
- EXPORT - Export quality standards
- AGMARK - AGMARK certified
- OTHER - Other certifications

---

## Database Relationships

### One-to-Many Relationships
```
CropCategory (1) ──────► (N) CropType
CropType (1) ───────────► (N) CropVariety
CropVariety (1) ────────► (N) QualityGrade
CropVariety (1) ────────► (N) PriceHistory
CropVariety (1) ────────► (N) SeasonalTrend
CropVariety (1) ────────► (N) ItemSpecification
```

### Composite Unique Keys
- CropType: (category_id, name)
- CropVariety: (crop_type_id, name)
- QualityGrade: (crop_variety_id, grade_code)
- PriceHistory: (crop_variety_id, date, market)
- SeasonalTrend: (crop_variety_id, month)

---

## Sample Data Population

### Example 1: Complete Basmati 1121 Entry

```python
# Category
category = CropCategory.objects.create(
    name="Cereals",
    code="CRL",
    icon="🌾",
    description="Grain crops including rice, wheat, and maize"
)

# Crop Type
crop_type = CropType.objects.create(
    category=category,
    name="Paddy",
    code="PDY",
    growing_season="Kharif",
    avg_yield_per_acre=25.50,
    current_msp=2040.00
)

# Variety
variety = CropVariety.objects.create(
    crop_type=crop_type,
    name="Basmati 1121",
    code="PDY-BAS1121",
    grain_type="Long grain",
    maturity_days=145,
    avg_grain_length=8.30,
    aroma_level=5,
    base_price_per_quintal=4500.00,
    premium_percentage=120.00,
    demand_level="HIGH",
    is_featured=True
)

# Quality Grades
QualityGrade.objects.create(
    crop_variety=variety,
    grade_name="Premium",
    grade_code="PREM",
    max_moisture_content=14.00,
    max_foreign_matter=1.00,
    price_multiplier=1.20
)

# Price History
PriceHistory.objects.create(
    crop_variety=variety,
    date="2026-02-10",
    min_price=4400.00,
    max_price=4650.00,
    avg_price=4520.00,
    modal_price=4500.00,
    volume_traded=1250.00
)
```

---

## Integration with Existing Models

### Connection to Market Module
```python
# In market/models.py CropListing
from core.item_models import CropVariety, QualityGrade

class CropListing(models.Model):
    farmer = models.ForeignKey(User, ...)
    crop_variety = models.ForeignKey(CropVariety, ...)  # Now uses detailed variety
    quality_grade = models.ForeignKey(QualityGrade, null=True, ...)  # Add quality grade
    ...
```

---

## Database Indexes

### Recommended Indexes for Performance
```sql
CREATE INDEX idx_crop_variety_featured ON cropvariety(is_featured, is_active);
CREATE INDEX idx_crop_variety_demand ON cropvariety(demand_level);
CREATE INDEX idx_price_history_date ON pricehistory(date DESC);
CREATE INDEX idx_price_history_variety_date ON pricehistory(crop_variety_id, date DESC);
CREATE INDEX idx_seasonal_trend_month ON seasonaltrend(month);
```

---

## Data Analytics Queries

### 1. Get Price Trends for Charts
```python
from django.db.models import Avg, Min, Max
from core.item_models import PriceHistory

# Last 30 days price data
price_trends = PriceHistory.objects.filter(
    crop_variety_id=variety_id,
    date__gte=thirty_days_ago
).values('date').annotate(
    avg_price=Avg('avg_price'),
    min_price=Min('min_price'),
    max_price=Max('max_price'),
    total_volume=Sum('volume_traded')
).order_by('date')
```

### 2. Get Seasonal Insights
```python
from datetime import datetime
from core.item_models import SeasonalTrend

current_month = datetime.now().month
seasonal_data = SeasonalTrend.objects.get(
    crop_variety_id=variety_id,
    month=current_month
)
```

### 3. Find Best Quality Varieties
```python
from core.item_models import CropVariety, QualityGrade

premium_varieties = CropVariety.objects.filter(
    is_active=True,
    demand_level='HIGH',
    quality_grades__grade_code='PREM'
).distinct()
```

---

## Migration Commands

### Create Migrations
```bash
python manage.py makemigrations core
python manage.py migrate core
```

### Populate Initial Data
```bash
python manage.py shell
from core.management.commands import seed_crops
seed_crops.Command().handle()
```

---

## API Endpoints (Suggested)

### RESTful API Structure
```
GET    /api/crops/categories/              # List all categories
GET    /api/crops/types/                   # List all crop types
GET    /api/crops/varieties/               # List all varieties
GET    /api/crops/varieties/<id>/          # Get variety details
GET    /api/crops/varieties/<id>/prices/   # Get price history
GET    /api/crops/varieties/<id>/seasonal/ # Get seasonal trends
POST   /api/crops/varieties/<id>/grades/   # Add quality grade
```

---

## Security Considerations

1. **Data Validation**: All price inputs validated for reasonable ranges
2. **Access Control**: Only verified users can add price data
3. **Audit Trail**: created_at and updated_at timestamps on all tables
4. **Data Integrity**: Foreign key constraints maintain referential integrity
5. **Backup Strategy**: Daily backups of price history data

---

## Performance Optimization

1. **Caching**: Cache frequently accessed variety data
2. **Indexing**: Indexes on date fields for price queries
3. **Archiving**: Archive old price history data (> 2 years)
4. **Denormalization**: Store calculated fields for quick access
5. **Read Replicas**: Use read replicas for analytics queries

---

## Future Enhancements

1. **Weather Integration**: Link seasonal trends to weather data
2. **ML Price Prediction**: Use price history for ML-based forecasting
3. **Multi-language Support**: Add variety names in regional languages
4. **Image Gallery**: Add images for each variety
5. **Farmer Reviews**: Allow farmers to rate varieties
6. **Export Data**: API to export price data to CSV/Excel
7. **Real-time Updates**: WebSocket support for live price updates

---

## Conclusion

This DBMS design provides a robust foundation for managing diverse crop items in the AgroBid Exchange System. The hierarchical structure allows for easy categorization, while the detailed variety and quality information enables precise pricing and market analytics.

The price history and seasonal trend models support the analytics dashboard, providing valuable market insights to both farmers and buyers.
