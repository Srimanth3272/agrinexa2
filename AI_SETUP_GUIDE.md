# AI Integration Setup Guide

## Prerequisites

Before running the AI features, you need at least one AI provider configured:

### Option 1: Google Gemini (Default)

1. **Get a Gemini API Key** (Free):
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the API key

### Option 2: Anthropic Claude (Alternative)

1. **Get a Claude API Key**:
   - Visit [Anthropic Console](https://console.anthropic.com/)
   - Sign up or log in
   - Navigate to API Keys
   - Create a new API key
   - Copy the API key

### Option 3: Both Providers (Recommended for Comparison)

Configure both API keys to enable side-by-side comparison of AI recommendations.

2. **Configure Environment**:
   ```bash
   cd backend
   
   # Create .env file (if not exists)
   cp .env.example .env
   
   # Edit .env and add your API key(s):
   # GEMINI_API_KEY=your-gemini-api-key-here
   # CLAUDE_API_KEY=your-claude-api-key-here  # Optional
   # AI_PROVIDER=gemini  # Options: gemini, claude, both
   ```

## Backend Setup

1. **Install AI Dependencies**:
   ```bash
   cd backend
   .\venv\Scripts\activate  # Windows
   
   # Install all AI dependencies
   pip install google-generativeai python-dotenv anthropic
   
   # Or install from requirements.txt
   pip install -r requirements.txt
   ```

2. **Run Migrations**:
   ```bash
   python manage.py makemigrations ai_assistant
   python manage.py migrate
   ```

3. **Start Backend Server**:
   ```bash
   python manage.py runserver
   ```

## AI Features

### AI Provider Selection 🔄

You can choose between different AI providers:
- **Google Gemini** (Default): Fast and free tier available
- **Anthropic Claude**: Alternative AI perspective
- **Both**: Compare recommendations from both providers side-by-side

Switch providers using the dropdown in the AI components or set a default in `.env`.

### 1. Price Advisor 🤖
- **What it does**: Provides intelligent price recommendations based on:
  - Crop variety and quality parameters
  - Historical market data
  - Regional pricing trends
  - Quality assessment (moisture, foreign matter)
  
- **How to use**:
  - When creating a listing, the AI automatically analyzes your crop details
  - Shows recommended price range (min, optimal, max)
  - Displays confidence score
  - Explains reasoning behind recommendations

### 2. Negotiation Assistant 💬
- **What it does**: Analyzes incoming bids and provides:
  - Quality rating (Excellent/Good/Fair/Poor)
  - AI score (0-100)
  - Recommendation (Accept/Counter/Negotiate/Reject)
  - Suggested counter-offer prices
  - Negotiation tips and talking points
  
- **How to use**:
  - View your listing with pending bids
  - AI automatically analyzes each bid
  - Follow AI recommendations for optimal negotiations

### 3. Market Intelligence 📊
- **What it does**: Provides market trends and insights:
  - Current average prices
  - Price trends (Rising/Stable/Falling)
  - Historical price data
  - AI-generated market recommendations
  
- **How to use**:
  - Dashboard shows market insights for your crops
  - Check trends before listing
  - Make informed pricing decisions

## API Endpoints

### Price Recommendation
```http
POST /api/ai/price-recommendation/?provider=gemini|claude|both
Content-Type: application/json
Authorization: Bearer {token}

{
  "crop_variety": "Basmati Rice",
  "quantity_quintals": 50,
  "district": "Amritsar",
  "state": "Punjab",
  "moisture_content": 13.5,
  "foreign_matter": 1.8,
  "base_price": 2100
}
```

### Analyze Bid
```http
POST /api/ai/analyze-bid/{bid_id}/?provider=gemini|claude|both
Authorization: Bearer {token}
```

### Market Insights
```http
GET /api/ai/market-insights/?crop_variety=Basmati Rice&state=Punjab
Authorization: Bearer {token}
```

### Negotiation Tips
```http
GET /api/ai/negotiation-tips/{listing_id}/?provider=gemini|claude|both
Authorization: Bearer {token}
```

**Provider Parameter** (optional):
- `gemini`: Use Google Gemini AI
- `claude`: Use Anthropic Claude AI
- `both`: Get recommendations from both providers for comparison
- Omit to use the default provider from settings

## Testing the AI Features

1. **Test Price Recommendations**:
   - Create a new crop listing
   - Fill in crop details including quality parameters
   - AI Price Advisor should display recommendations

2. **Test Bid Analysis**:
   - As a buyer, place a bid on a listing
   - As the farmer, view the listing
   - AI Negotiation Assistant should show bid analysis

3. **Test Market Insights**:
   - View dashboard market intelligence widget
   - Check price trends and recommendations

## Fallback Mode

If no Gemini API key is configured, the system operates in **fallback mode**:
- Uses rule-based analysis instead of AI
- Provides basic price calculations
- Still functional but less intelligent

## Troubleshooting

### "AI Analysis Unavailable"
- Check if at least one API key (GEMINI_API_KEY or CLAUDE_API_KEY) is set in .env
- Verify API key is valid
- Check internet connection
- Try switching to a different provider

### Claude-Specific Issues
- Ensure you have credits in your Anthropic account
- Claude API requires paid credits (no free tier like Gemini)
- Check API rate limits in Anthropic Console

### "Insufficient Data"
- More transactions needed for accurate trends
- AI provides best-effort analysis with limited data

### Import Errors
- Ensure all dependencies are installed:
  ```bash
  pip install -r requirements.txt
  ```

## Components

Frontend AI components are located in:
- `frontend/src/components/AIComponents/PriceAdvisor.jsx`
- `frontend/src/components/AIComponents/NegotiationAssistant.jsx`
- `frontend/src/components/AIComponents/MarketInsights.jsx`
- `frontend/src/components/AIComponents/AIProviderSelector.jsx` - Provider selection dropdown

## Future Enhancements

- Additional AI providers (OpenAI GPT, etc.)
- AI model version selection
- Custom AI prompt templates
- Real-time price updates
- Weather-based price predictions
- Crop disease impact analysis
- Seasonal trend forecasting
- Multi-language support for AI insights
