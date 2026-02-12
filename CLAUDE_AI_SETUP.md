# Claude AI Integration Guide
## AgroBid Exchange System - Multi-Provider AI Support

This guide will help you set up Anthropic Claude AI alongside Google Gemini for the AgroBid Exchange System.

---

## 🎯 **Overview**

The system now supports **three AI provider modes:**

1. **Google Gemini** (✨) - Google's Gemini Pro model
2. **Anthropic Claude** (🤖) - Claude 3.5 Sonnet model
3. **Both (Compare)** (🔄) - Get responses from both providers simultaneously for comparison

---

## 📋 **Prerequisites**

### Install Required Package

```bash
# Navigate to backend directory
cd backend

# Install Anthropic Python SDK
pip install anthropic

# Update requirements.txt
echo "anthropic" >> requirements.txt
```

---

## 🔑 **Getting API Keys**

### Option 1: Google Gemini (Already Configured)
- ✅ Already set up in your system
- API Key configured in `.env`

### Option 2: Anthropic Claude (New)

1. **Create an Anthropic Account**
   - Visit: https://console.anthropic.com/
   - Sign up for a new account

2. **Generate API Key**
   - Go to Settings → API Keys
   - Click "Create Key"
   - Copy your API key (starts with `sk-ant-`)

3. **Choose a Plan**
   - **Free Tier**: Limited credits for testing
   - **Pay-as-you-go**: $0.003/1K input tokens, $0.015/1K output tokens (Claude 3.5 Sonnet)

---

## ⚙️ **Configuration**

### Backend Setup

#### 1. Update `.env` file

```bash
# Navigate to backend directory
cd c:\Users\akant\OneDrive\Desktop\a to z solutions\backend
```

Open your `.env` file and add:

```plaintext
# AI Provider Configuration
DEFAULT_AI_PROVIDER=gemini  # Options: gemini, claude, both

# Google Gemini API Key (Existing)
GEMINI_API_KEY=your_existing_gemini_key_here

# Anthropic Claude API Key (New)
CLAUDE_API_KEY=sk-ant-your-claude-api-key-here
```

#### 2. Available Provider Options

- `DEFAULT_AI_PROVIDER=gemini` - Use only Google Gemini
- `DEFAULT_AI_PROVIDER=claude` - Use only Anthropic Claude  
- `DEFAULT_AI_PROVIDER=both` - Use both for comparison

---

## 🚀 **Testing the Integration**

### 1. Start the Backend Server

```bash
cd backend
python manage.py runserver
```

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

### 3. Access the AI Demo Page

Navigate to: **http://localhost:5173/ai-demo**

### 4. Test Provider Switching

1. Look for the **AI Provider Selector** at the top
2. Switch between:
   - ✨ **Google Gemini**
   - 🤖 **Anthropic Claude**
   - 🔄 **Both (Compare)**

3. Try getting price recommendations with different providers
4. Compare results side-by-side when using "Both" mode

---

## 📊 **API Endpoints with Provider Support**

All AI endpoints now support the `provider` query parameter:

### Price Recommendation
```http
POST /api/ai/price-recommendation/?provider=claude
Content-Type: application/json

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

### Bid Analysis
```http
POST /api/ai/analyze-bid/<bid_id>/?provider=both
```

### Negotiation Tips
```http
GET /api/ai/negotiation-tips/<listing_id>/?provider=gemini
```

---

## 🔧 **Code Structure**

### Backend Services (`backend/ai_assistant/services.py`)

```python
# Provider Classes
- BaseAIProvider (Abstract)
  └── GeminiProvider
  └── ClaudeProvider

# Main Service
- AIAssistantService
  - Manages multiple providers
  - Handles fallback logic
  - Supports single or dual provider mode
```

### Frontend Components

```
src/
├── AIDemo.jsx                           # Main demo page
└── components/
    └── AIComponents/
        ├── AIProviderSelector.jsx       # Provider switcher component
        ├── PriceAdvisor.jsx             # Price recommendations
        ├── NegotiationAssistant.jsx     # Bid analysis
        └── MarketInsights.jsx           # Market trends
```

---

## 💡 **Usage Examples**

### Example 1: Single Provider (Gemini)

```javascript
// Frontend
const response = await api.post(
  '/api/ai/price-recommendation/?provider=gemini',
  listingData
);
```

### Example 2: Single Provider (Claude)

```javascript
// Frontend
const response = await api.post(
  '/api/ai/price-recommendation/?provider=claude',
  listingData
);
```

### Example 3: Compare Both Providers

```javascript
// Frontend
const response = await api.post(
  '/api/ai/price-recommendation/?provider=both',
  listingData
);

// Response format:
{
  "gemini": {
    "optimal_price": 4520,
    "provider": "Google Gemini",
    ...
  },
  "claude": {
    "optimal_price": 4560,
    "provider": "Anthropic Claude",
    ...
  }
}
```

---

## 🎨 **Frontend Provider Selector**

The `AIProviderSelector` component:
- Saves user preference in localStorage
- Displays provider-specific icons
- Updates all AI components dynamically
- Shows current provider in the info box

### Props

```javascript
<AIProviderSelector 
  onProviderChange={setProvider}  // Callback when provider changes
  defaultProvider="gemini"         // Initial provider
/>
```

---

## 🔒 **Security Best Practices**

1. **Never commit API keys to Git**
   ```bash
   # .gitignore should include:
   .env
   .env.local
   ```

2. **Use Environment Variables**
   ```python
   # ✅ Good
   CLAUDE_API_KEY = os.getenv('CLAUDE_API_KEY')
   
   # ❌ Bad
   CLAUDE_API_KEY = 'sk-ant-hardcoded-key'
   ```

3. **Rotate Keys Regularly**
   - Regenerate API keys every 90 days
   - Revoke old keys after rotation

4. **Monitor Usage**
   - Track API call costs in provider dashboards
   - Set up billing alerts

---

## 📈 **Cost Comparison**

### Google Gemini Pro
- **Free tier**: 60 requests/minute
- **Paid**: $0.00025/1K chars input, $0.0005/1K chars output

### Claude 3.5 Sonnet
- **Input**: $0.003/1K tokens (~750 words)
- **Output**: $0.015/1K tokens (~750 words)
- **Speed**: Faster than Claude 3 Opus
- **Quality**: Better reasoning than Claude 3 Haiku

### Recommendation
- **Development**: Use free Gemini tier
- **Production**: Use Claude for critical decisions (better reasoning)
- **Hybrid**: Use both and compare results for important transactions

---

## 🐛 **Troubleshooting**

### Issue 1: "Claude provider not available"

**Solution:**
```bash
# Install anthropic package
pip install anthropic

# Verify API key is set
echo $CLAUDE_API_KEY  # Unix/Mac
echo %CLAUDE_API_KEY% # Windows
```

### Issue 2: "Invalid API key"

**Solution:**
- Check that key starts with `sk-ant-`
- Ensure no extra spaces in `.env` file
- Regenerate key in Anthropic console

### Issue 3: API quota exceeded

**Solution:**
- Check usage in Anthropic Console
- Upgrade plan or wait for quota reset
- Switch to Gemini temporarily using provider selector

### Issue 4: Slow responses

**Solution:**
- Claude 3.5 Sonnet is optimized for speed
- Use caching for repeated queries
- Consider using Gemini for non-critical operations

---

## 🎯 **Feature Highlights**

### 1. Intelligent Fallback
- If Claude API fails → Falls back to Gemini
- If both fail → Uses rule-based analysis
- No interruption to user experience

### 2. Provider Preference Memory
- User's last selection saved in localStorage
- Automatic restoration on page reload

### 3. Visual Feedback
- Provider-specific icons (✨ 🤖 🔄)
- Color-coded responses
- Clear provider attribution in results

### 4. Comparison Mode
- Get insights from both providers
- Side-by-side result display
- Make informed decisions based on consensus

---

## 📞 **Support Resources**

### Anthropic Claude
- **Documentation**: https://docs.anthropic.com/
- **API Reference**: https://docs.anthropic.com/claude/reference
- **Discord**: https://discord.gg/anthropic
- **Status Page**: https://status.anthropic.com/

### Google Gemini
- **Documentation**: https://ai.google.dev/docs
- **API Reference**: https://ai.google.dev/api
- **Support**: https://support.google.com

---

## ✅ **Quick Start Checklist**

- [ ] Install `anthropic` package
- [ ] Get Claude API key from console.anthropic.com
- [ ] Add `CLAUDE_API_KEY` to `.env`
- [ ] Set `DEFAULT_AI_PROVIDER` preference
- [ ] Restart Django server
- [ ] Test provider switching in AI Demo page
- [ ] Verify responses from both providers
- [ ] Monitor API usage and costs

---

## 🎉 **You're All Set!**

Your AgroBid Exchange System now supports both Google Gemini and Anthropic Claude AI providers. Users can:
- ✅ Choose their preferred AI provider
- ✅ Compare responses from both providers
- ✅ Get intelligent fallback when needed
- ✅ Experience enhanced price recommendations and bid analysis

Happy farming! 🌾
