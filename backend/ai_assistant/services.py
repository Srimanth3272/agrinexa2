"""
AI Assistant Service for AgroBid Exchange System
Provides intelligent price recommendations and negotiation assistance for farmers.
Supports multiple AI providers: Google Gemini and Anthropic Claude.
"""

import os
import json
from abc import ABC, abstractmethod
from decimal import Decimal
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

# Make AI imports optional
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    genai = None

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    anthropic = None
    
from django.conf import settings
from django.db.models import Avg, Count, Q
from django.utils import timezone

from .models import PriceRecommendation, BidAnalysis, HistoricalPrice, MarketIntelligence
from market.models import CropListing, Bid, Order
from core.models import CropVariety, Region


class BaseAIProvider(ABC):
    """Abstract base class for AI providers."""
    
    @abstractmethod
    def generate_price_insights(self, context: str) -> Dict:
        """Generate price recommendation insights."""
        pass
    
    @abstractmethod
    def generate_bid_analysis(self, context: str) -> Dict:
        """Generate bid analysis insights."""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """Check if the provider is available and configured."""
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """Get the name of the provider."""
        pass


class GeminiProvider(BaseAIProvider):
    """Google Gemini AI provider implementation."""
    
    def __init__(self):
        """Initialize Gemini API with API key from settings."""
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)
        self.model = None
        
        if self.api_key and GENAI_AVAILABLE:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-pro')
            except Exception as e:
                print(f"Gemini initialization error: {e}")
    
    def is_available(self) -> bool:
        """Check if Gemini is available."""
        return self.model is not None
    
    def get_provider_name(self) -> str:
        """Get provider name."""
        return "Google Gemini"
    
    def generate_price_insights(self, context: str) -> Dict:
        """Generate price insights using Gemini."""
        if not self.is_available():
            raise Exception("Gemini provider not available")
        
        response = self.model.generate_content(context)
        result_text = response.text.strip()
        
        # Extract JSON from response (handle markdown code blocks)
        if result_text.startswith('```'):
            result_text = result_text.split('```')[1]
            if result_text.startswith('json'):
                result_text = result_text[4:]
        
        return json.loads(result_text)
    
    def generate_bid_analysis(self, context: str) -> Dict:
        """Generate bid analysis using Gemini."""
        if not self.is_available():
            raise Exception("Gemini provider not available")
        
        response = self.model.generate_content(context)
        result_text = response.text.strip()
        
        # Extract JSON from response
        if result_text.startswith('```'):
            result_text = result_text.split('```')[1]
            if result_text.startswith('json'):
                result_text = result_text[4:]
        
        return json.loads(result_text)


class ClaudeProvider(BaseAIProvider):
    """Anthropic Claude AI provider implementation."""
    
    def __init__(self):
        """Initialize Claude API with API key from settings."""
        self.api_key = getattr(settings, 'CLAUDE_API_KEY', None)
        self.client = None
        
        if self.api_key and ANTHROPIC_AVAILABLE:
            try:
                self.client = anthropic.Anthropic(api_key=self.api_key)
            except Exception as e:
                print(f"Claude initialization error: {e}")
    
    def is_available(self) -> bool:
        """Check if Claude is available."""
        return self.client is not None
    
    def get_provider_name(self) -> str:
        """Get provider name."""
        return "Anthropic Claude"
    
    def generate_price_insights(self, context: str) -> Dict:
        """Generate price insights using Claude."""
        if not self.is_available():
            raise Exception("Claude provider not available")
        
        message = self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": context
                }
            ]
        )
        
        result_text = message.content[0].text.strip()
        
        # Extract JSON from response (handle markdown code blocks)
        if result_text.startswith('```'):
            result_text = result_text.split('```')[1]
            if result_text.startswith('json'):
                result_text = result_text[4:]
        
        return json.loads(result_text)
    
    def generate_bid_analysis(self, context: str) -> Dict:
        """Generate bid analysis using Claude."""
        if not self.is_available():
            raise Exception("Claude provider not available")
        
        message = self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": context
                }
            ]
        )
        
        result_text = message.content[0].text.strip()
        
        # Extract JSON from response
        if result_text.startswith('```'):
            result_text = result_text.split('```')[1]
            if result_text.startswith('json'):
                result_text = result_text[4:]
        
        return json.loads(result_text)


class AIAssistantService:
    """
    Core AI service supporting multiple AI providers.
    Supports: Google Gemini, Anthropic Claude, or both simultaneously.
    """
    
    def __init__(self, provider: str = None):
        """
        Initialize AI Assistant with specified provider.
        
        Args:
            provider: 'gemini', 'claude', 'both', or None (uses default from settings)
        """
        if provider is None:
            provider = getattr(settings, 'DEFAULT_AI_PROVIDER', 'gemini')
        
        self.provider_name = provider.lower()
        self.providers = {}
        
        # Initialize available providers
        if self.provider_name in ['gemini', 'both']:
            self.providers['gemini'] = GeminiProvider()
        
        if self.provider_name in ['claude', 'both']:
            self.providers['claude'] = ClaudeProvider()
        
        # Validate at least one provider is available
        if not any(p.is_available() for p in self.providers.values()):
            print(f"Warning: No AI providers available. Using fallback mode.")
    
    def get_price_recommendation(self, listing_data: Dict, provider: str = None) -> Dict:
        """
        Generate intelligent price recommendations for a crop listing.
        
        Args:
            listing_data: Dict containing crop details (variety, quantity, quality, location)
            provider: Optional override for provider ('gemini', 'claude', 'both')
        
        Returns:
            Dict with price range, reasoning, and market factors
            If provider='both', returns dict with 'gemini' and 'claude' keys
        """
        # Extract listing details
        crop_variety = listing_data.get('crop_variety')
        quantity = listing_data.get('quantity_quintals')
        district = listing_data.get('district', '')
        state = listing_data.get('state', '')
        moisture = listing_data.get('moisture_content')
        foreign_matter = listing_data.get('foreign_matter')
        
        # Get historical price data
        historical_data = self._get_historical_prices(crop_variety, state, district)
        
        # Get base price from crop variety
        base_price = listing_data.get('base_price', 2000)  # Default MSP-like price
        
        # Calculate quality adjustment
        quality_multiplier = self._calculate_quality_multiplier(moisture, foreign_matter)
        
        # Determine which provider to use
        use_provider = provider if provider else self.provider_name
        
        if use_provider == 'both':
            results = {}
            for provider_key, provider_obj in self.providers.items():
                if provider_obj.is_available():
                    try:
                        context = self._build_price_context(
                            crop_variety, quantity, state, district,
                            moisture, foreign_matter, historical_data, base_price
                        )
                        results[provider_key] = provider_obj.generate_price_insights(context)
                        results[provider_key]['provider'] = provider_obj.get_provider_name()
                    except Exception as e:
                        print(f"{provider_key} error: {e}")
                        results[provider_key] = self._get_fallback_insights(
                            historical_data, base_price, quality_multiplier
                        )
                        results[provider_key]['provider'] = f"{provider_obj.get_provider_name()} (Fallback)"
            
            if not results:
                return {
                    'fallback': self._get_fallback_insights(historical_data, base_price, quality_multiplier)
                }
            return results
        else:
            # Single provider mode
            provider_obj = self.providers.get(use_provider)
            if provider_obj and provider_obj.is_available():
                try:
                    context = self._build_price_context(
                        crop_variety, quantity, state, district,
                        moisture, foreign_matter, historical_data, base_price
                    )
                    result = provider_obj.generate_price_insights(context)
                    result['provider'] = provider_obj.get_provider_name()
                    return result
                except Exception as e:
                    print(f"{use_provider} error: {e}")
            
            # Fallback to rule-based
            result = self._get_fallback_insights(historical_data, base_price, quality_multiplier)
            result['provider'] = 'Rule-based (Fallback)'
            return result
    
    def analyze_bid(self, bid_id: int, provider: str = None) -> Dict:
        """
        Analyze an incoming bid and provide negotiation guidance.
        
        Args:
            bid_id: ID of the bid to analyze
            provider: Optional override for provider ('gemini', 'claude', 'both')
        
        Returns:
            Dict with analysis score, recommendation, and negotiation tips
            If provider='both', returns dict with 'gemini' and 'claude' keys
        """
        try:
            bid = Bid.objects.select_related('listing', 'listing__crop_variety', 'buyer').get(id=bid_id)
        except Bid.DoesNotExist:
            return {'error': 'Bid not found'}
        
        listing = bid.listing
        
        # Get price recommendation for comparison
        listing_data = {
            'crop_variety': listing.crop_variety.name,
            'quantity_quintals': float(listing.quantity_quintals),
            'district': listing.district,
            'state': listing.state,
            'moisture_content': float(listing.moisture_content) if listing.moisture_content else None,
            'foreign_matter': float(listing.foreign_matter) if listing.foreign_matter else None,
            'base_price': float(listing.crop_variety.base_price_per_quintal)
        }
        
        price_rec = self.get_price_recommendation(listing_data, provider='gemini')  # Use single provider for base calc
        
        # Calculate bid quality score
        bid_amount = float(bid.amount_per_quintal)
        optimal_price = price_rec.get('optimal_price', listing.expected_price_per_quintal)
        expected_price = float(listing.expected_price_per_quintal)
        
        score = self._calculate_bid_score(bid_amount, optimal_price, expected_price)
        
        # Determine which provider to use
        use_provider = provider if provider else self.provider_name
        
        if use_provider == 'both':
            results = {}
            for provider_key, provider_obj in self.providers.items():
                if provider_obj.is_available():
                    try:
                        context = self._build_bid_context(bid, listing, price_rec, score)
                        results[provider_key] = provider_obj.generate_bid_analysis(context)
                        results[provider_key]['analysis_score'] = round(score, 2)
                        results[provider_key]['provider'] = provider_obj.get_provider_name()
                    except Exception as e:
                        print(f"{provider_key} error: {e}")
                        results[provider_key] = self._get_fallback_bid_analysis(
                            bid_amount, optimal_price, expected_price, score
                        )
                        results[provider_key]['provider'] = f"{provider_obj.get_provider_name()} (Fallback)"
            
            if not results:
                return {
                    'fallback': self._get_fallback_bid_analysis(
                        bid_amount, optimal_price, expected_price, score
                    )
                }
            return results
        else:
            # Single provider mode
            provider_obj = self.providers.get(use_provider)
            if provider_obj and provider_obj.is_available():
                try:
                    context = self._build_bid_context(bid, listing, price_rec, score)
                    result = provider_obj.generate_bid_analysis(context)
                    result['analysis_score'] = round(score, 2)
                    result['provider'] = provider_obj.get_provider_name()
                    return result
                except Exception as e:
                    print(f"{use_provider} error: {e}")
            
            # Fallback to rule-based
            result = self._get_fallback_bid_analysis(bid_amount, optimal_price, expected_price, score)
            result['provider'] = 'Rule-based (Fallback)'
            return result
    
    def get_market_insights(self, crop_variety_name: str, state: str = '') -> Dict:
        """
        Provide market intelligence and trends for a crop variety in a region.
        
        Args:
            crop_variety_name: Name of the crop variety
            state: State name (optional)
        
        Returns:
            Dict with market trends, insights, and recommendations
        """
        # Get recent historical data (last 90 days)
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=90)
        
        query = Q(crop_variety__name=crop_variety_name, transaction_date__gte=start_date)
        if state:
            query &= Q(state=state)
        
        prices = HistoricalPrice.objects.filter(query)
        
        if not prices.exists():
            return {
                'message': 'Insufficient historical data for this crop',
                'data_available': False
            }
        
        # Calculate statistics
        avg_price = prices.aggregate(Avg('price_per_quintal'))['price_per_quintal__avg']
        price_trend = self._calculate_price_trend(prices)
        
        # Get price range
        recent_prices = list(prices.values_list('price_per_quintal', flat=True)[:20])
        min_price = min(recent_prices) if recent_prices else 0
        max_price = max(recent_prices) if recent_prices else 0
        
        insights = {
            'crop_variety': crop_variety_name,
            'state': state or 'All regions',
            'current_avg_price': round(avg_price, 2) if avg_price else 0,
            'price_range': {'min': float(min_price), 'max': float(max_price)},
            'trend': price_trend['direction'],
            'trend_percentage': price_trend['percentage'],
            'data_points': prices.count(),
            'period': f"{start_date} to {end_date}",
            'insights': self._generate_market_insights_text(price_trend, avg_price),
            'recommendations': self._generate_recommendations(price_trend)
        }
        
        return insights
    
    # Private helper methods
    
    def _calculate_bid_score(self, bid_amount: float, optimal_price: float, expected_price: float) -> float:
        """Calculate bid quality score (0-100)."""
        if bid_amount >= optimal_price:
            score = min(100, 85 + ((bid_amount - optimal_price) / optimal_price) * 100)
        elif bid_amount >= expected_price:
            score = 70 + ((bid_amount - expected_price) / expected_price) * 50
        elif bid_amount >= optimal_price * 0.9:
            score = 50 + ((bid_amount - (optimal_price * 0.9)) / (optimal_price * 0.1)) * 20
        else:
            score = max(0, (bid_amount / optimal_price) * 50)
        
        return score
    
    def _build_price_context(self, crop: str, quantity: float, state: str, district: str,
                            moisture: Optional[float], foreign_matter: Optional[float],
                            historical_data: List[Dict], base_price: float) -> str:
        """Build context string for price recommendation."""
        return f"""
You are an expert agricultural market analyst helping farmers price their crops fairly.

Crop Details:
- Variety: {crop}
- Quantity: {quantity} quintals
- Location: {district}, {state}
- Moisture Content: {moisture}% (ideal: <14%)
- Foreign Matter: {foreign_matter}% (ideal: <2%)
- Base/MSP Price: ₹{base_price}/quintal

Historical Price Data (last 60 days):
{json.dumps(historical_data[:10], indent=2) if historical_data else "Limited data available"}

Based on this information, provide:
1. Recommended price range (min, optimal, max) in INR per quintal
2. Confidence level (0-1) in this recommendation
3. Brief reasoning (2-3 sentences)
4. Key market factors influencing the price

Return ONLY a valid JSON object in this exact format:
{{
  "recommended_min_price": <number>,
  "optimal_price": <number>,
  "recommended_max_price": <number>,
  "confidence_score": <0-1>,
  "reasoning": "<text>",
  "market_factors": ["factor1", "factor2", "factor3"]
}}
"""
    
    def _build_bid_context(self, bid: Bid, listing: CropListing, price_rec: Dict, score: float) -> str:
        """Build context string for bid analysis."""
        return f"""
You are helping a farmer evaluate a bid on their crop listing.

Listing Details:
- Crop: {listing.crop_variety.name}
- Quantity: {listing.quantity_quintals} quintals
- Farmer's Expected Price: ₹{listing.expected_price_per_quintal}/quintal
- AI Recommended Price: ₹{price_rec.get('optimal_price', 'N/A')}/quintal

Bid Details:
- Offered Price: ₹{bid.amount_per_quintal}/quintal
- Total Amount: ₹{bid.total_amount}
- Buyer: {bid.buyer.username}

Analysis Score (0-100): {score}

Provide a helpful analysis including:
1. Should the farmer accept, counter, negotiate, or reject?
2. If countering, suggest a counter-offer price
3. 2-3 strengths of this bid
4. 1-2 potential concerns
5. 2-3 actionable negotiation tips
6. Brief reasoning

Return ONLY a valid JSON object:
{{
  "recommendation": "<ACCEPT|COUNTER|NEGOTIATE|REJECT>",
  "quality_rating": "<EXCELLENT|GOOD|FAIR|POOR>",
  "suggested_counter_offer": <number or null>,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["concern1"],
  "negotiation_tips": ["tip1", "tip2", "tip3"],
  "reasoning": "<concise analysis>"
}}
"""
    
    def _get_historical_prices(self, crop_variety: str, state: str, district: str, days: int = 60) -> List[Dict]:
        """Fetch historical price data for market analysis."""
        cutoff_date = timezone.now().date() - timedelta(days=days)
        
        query = Q(crop_variety__name=crop_variety, transaction_date__gte=cutoff_date)
        if state:
            query &= Q(state=state)
        
        prices = HistoricalPrice.objects.filter(query).order_by('-transaction_date')[:30]
        
        return [
            {
                'price': float(p.price_per_quintal),
                'date': p.transaction_date.isoformat(),
                'quality': p.quality_grade,
                'district': p.district
            }
            for p in prices
        ]
    
    def _calculate_quality_multiplier(self, moisture: Optional[float], foreign_matter: Optional[float]) -> float:
        """Calculate price multiplier based on quality parameters."""
        multiplier = 1.0
        
        # Moisture content adjustment (ideal: <14%)
        if moisture is not None:
            if moisture < 14:
                multiplier += 0.05  # Premium for low moisture
            elif moisture > 17:
                multiplier -= 0.10  # Penalty for high moisture
            elif moisture > 15:
                multiplier -= 0.05  # Minor penalty
        
        # Foreign matter adjustment (ideal: <2%)
        if foreign_matter is not None:
            if foreign_matter < 2:
                multiplier += 0.03  # Premium for purity
            elif foreign_matter > 5:
                multiplier -= 0.08  # Penalty for impurity
            elif foreign_matter > 3:
                multiplier -= 0.04  # Minor penalty
        
        return max(0.7, min(1.2, multiplier))  # Cap between 70% and 120%
    
    def _get_fallback_insights(self, historical_data: List[Dict], base_price: float, quality_multiplier: float) -> Dict:
        """Generate price insights without AI (rule-based fallback)."""
        
        # Calculate average historical price
        if historical_data:
            avg_historical = sum(p['price'] for p in historical_data) / len(historical_data)
            optimal_price = round(avg_historical * quality_multiplier, 2)
        else:
            optimal_price = round(base_price * quality_multiplier, 2)
        
        return {
            'recommended_min_price': round(optimal_price * 0.90, 2),
            'optimal_price': optimal_price,
            'recommended_max_price': round(optimal_price * 1.10, 2),
            'confidence_score': 0.75 if historical_data else 0.6,
            'reasoning': f"Based on {'recent market data' if historical_data else 'base price'} and quality assessment. "
                        f"Quality multiplier: {quality_multiplier:.2f}x. "
                        f"{'Market has been stable' if historical_data else 'Limited historical data available'}.",
            'market_factors': [
                'Quality parameters',
                'Historical price trends' if historical_data else 'Base MSP price',
                'Regional market conditions'
            ]
        }
    
    def _get_fallback_bid_analysis(self, bid_amount: float, optimal_price: float,
                                    expected_price: float, score: float) -> Dict:
        """Generate bid analysis without AI."""
        
        price_diff = bid_amount - optimal_price
        price_diff_pct = (price_diff / optimal_price) * 100
        
        strengths = []
        weaknesses = []
        negotiation_tips = []
        
        # Determine quality rating and recommendation
        if score >= 85:
            quality_rating = 'EXCELLENT'
            recommendation = 'ACCEPT'
        elif score >= 70:
            quality_rating = 'GOOD'
            recommendation = 'ACCEPT'
        elif score >= 50:
            quality_rating = 'FAIR'
            recommendation = 'COUNTER'
        else:
            quality_rating = 'POOR'
            recommendation = 'REJECT'
        
        if bid_amount >= optimal_price:
            strengths.append(f"Bid is {abs(price_diff_pct):.1f}% above market optimal price")
            strengths.append("Strong buyer commitment")
            negotiation_tips.append("Accept quickly to secure this excellent offer")
        elif bid_amount >= expected_price:
            strengths.append("Bid meets your expected price")
            strengths.append("Reasonable market rate")
            negotiation_tips.append("Consider accepting or ask for small premium for quality")
        else:
            weaknesses.append(f"Bid is {abs(price_diff_pct):.1f}% below market optimal")
            negotiation_tips.append(f"Counter with ₹{round(optimal_price, 2)} per quintal")
            negotiation_tips.append("Highlight your crop's quality parameters")
        
        if not strengths:
            strengths.append("Buyer shows interest in your crop")
        
        suggested_counter = None
        if recommendation == 'COUNTER':
            suggested_counter = round((bid_amount + optimal_price) / 2, 2)
            negotiation_tips.append(f"Start negotiation at ₹{suggested_counter}/quintal")
        
        return {
            'analysis_score': round(score, 2),
            'quality_rating': quality_rating,
            'recommendation': recommendation,
            'suggested_counter_offer': suggested_counter,
            'strengths': strengths,
            'weaknesses': weaknesses if weaknesses else ["No major concerns"],
            'negotiation_tips': negotiation_tips,
            'reasoning': f"Bid of ₹{bid_amount} compared to optimal ₹{optimal_price}. "
                        f"Quality assessment: {quality_rating}. {recommendation} recommended."
        }
    
    def _calculate_price_trend(self, prices_queryset) -> Dict:
        """Calculate price trend direction and percentage."""
        prices = list(prices_queryset.order_by('transaction_date').values_list('price_per_quintal', flat=True))
        
        if len(prices) < 2:
            return {'direction': 'STABLE', 'percentage': 0}
        
        # Compare recent vs older prices
        recent_avg = sum(prices[-10:]) / min(10, len(prices[-10:]))
        older_avg = sum(prices[:10]) / min(10, len(prices[:10]))
        
        diff_pct = ((recent_avg - older_avg) / older_avg) * 100
        
        if diff_pct > 5:
            direction = 'RISING'
        elif diff_pct < -5:
            direction = 'FALLING'
        else:
            direction = 'STABLE'
        
        return {'direction': direction, 'percentage': round(diff_pct, 2)}
    
    def _generate_market_insights_text(self, trend: Dict, avg_price: float) -> str:
        """Generate human-readable market insights."""
        direction = trend['direction']
        pct = abs(trend['percentage'])
        
        if direction == 'RISING':
            return f"Market prices are trending upward ({pct:.1f}% increase). Good time to list crops for favorable prices."
        elif direction == 'FALLING':
            return f"Prices have declined {pct:.1f}% recently. Consider waiting for market recovery or accept current rates."
        else:
            return f"Market is stable with consistent pricing around ₹{avg_price:.2f}/quintal. Reliable time to trade."
    
    def _generate_recommendations(self, trend: Dict) -> List[str]:
        """Generate actionable recommendations based on trends."""
        recommendations = []
        
        if trend['direction'] == 'RISING':
            recommendations.extend([
                "List your crops soon to capitalize on rising prices",
                "Set prices at the higher end of the recommended range",
                "Be confident in negotiations"
            ])
        elif trend['direction'] == 'FALLING':
            recommendations.extend([
                "Consider accepting reasonable offers quickly",
                "Be flexible in negotiations",
                "Monitor market daily for recovery signs"
            ])
        else:
            recommendations.extend([
                "Set prices based on quality parameters",
                "Stable market allows for steady negotiations",
                "Focus on highlighting crop quality"
            ])
        
        return recommendations


# Singleton instance
_ai_service = None

def get_ai_service(provider: str = None) -> AIAssistantService:
    """
    Get or create AI service instance.
    
    Args:
        provider: 'gemini', 'claude', 'both', or None (uses default)
    
    Returns:
        AIAssistantService instance
    """
    global _ai_service
    # Create new instance if provider is specified or none exists
    if provider or _ai_service is None:
        _ai_service = AIAssistantService(provider)
    return _ai_service
