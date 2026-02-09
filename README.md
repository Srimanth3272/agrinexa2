# AgroBid Exchange System

A production-ready agri-tech platform connecting verified Paddy (Rice) farmers with verified buyers through smart price discovery, controlled bidding, and escrow payments.

## Tech Stack

**Backend:**
- Python 3.11+
- Django 5.0+
- Django REST Framework
- PostgreSQL

**Frontend:**
- React 18+
- Vite
- Tailwind CSS

**Payments:**
- Razorpay/Stripe Integration

## Project Structure

```
fusion-kuiper/
├── backend/          # Django backend
├── frontend/         # React frontend
└── README.md
```

## Getting Started

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Documentation
- [PRD](../brain/65554707-93af-48fd-8f40-ae8ae0b7648d/prd.md)
- [Tech Design](../brain/65554707-93af-48fd-8f40-ae8ae0b7648d/tech_design.md)
