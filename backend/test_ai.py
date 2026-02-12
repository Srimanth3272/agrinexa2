import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrobid.settings')
django.setup()

from ai_assistant.services import AIAssistantService

# Test AI service
print("Initializing AI service...")
try:
    ai_service = AIAssistantService(provider='gemini')
    print("AI service initialized successfully!")
    
    # Test with sample data
    test_data = {
        'crop_variety': 'Basmati Rice',
        'quantity_quintals': 50,
        'district': 'Amritsar',
        'state': 'Punjab',
        'moisture_content': 13.5,
        'foreign_matter': 1.8,
        'base_price': 2040
    }
    
    print("\nTesting price recommendation...")
    result = ai_service.get_price_recommendation(test_data)
    print("Success! Result:", result)
    
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
