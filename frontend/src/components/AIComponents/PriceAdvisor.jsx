import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { aiAPI } from '../../api';

export default function PriceAdvisor({ listingData, onPriceUpdate, provider }) {
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPriceRecommendation = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await aiAPI.getPriceRecommendation(listingData, provider);
            const data = response.data;
            setRecommendation(data);

            // Notify parent component
            if (onPriceUpdate) {
                onPriceUpdate(data.optimal_price);
            }
        } catch (err) {
            console.error('AI Price Recommendation Error:', err);
            setError(err.response?.data?.detail || err.message || 'Failed to get recommendation');
        } finally {
            setLoading(false);
        }
    }, [listingData, onPriceUpdate, provider]);

    useEffect(() => {
        if (listingData && Object.keys(listingData).length > 0) {
            fetchPriceRecommendation();
        }
    }, [listingData, fetchPriceRecommendation]);

    if (loading) {
        return (
            <div style={{ backgroundColor: '#fff3e0', padding: '20px', borderRadius: '4px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '24px' }}>🤖</div>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#212121', margin: 0 }}>
                            AI Price Advisor
                        </h3>
                        <p style={{ fontSize: '13px', color: '#878787', margin: '4px 0 0 0' }}>
                            Analyzing market data...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ backgroundColor: '#ffebee', padding: '20px', borderRadius: '4px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '24px' }}>⚠️</div>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#d32f2f', margin: 0 }}>
                            AI Analysis Unavailable
                        </h3>
                        <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>
                            {error}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!recommendation) return null;

    const confidencePercentage = (recommendation.confidence_score * 100).toFixed(0);

    return (
        <div style={{
            backgroundColor: '#e8f5e9',
            border: '2px solid #66bb6a',
            padding: '24px',
            borderRadius: '4px',
            marginBottom: '20px'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '32px' }}>🤖</div>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1b5e20', margin: 0 }}>
                            AI Price Recommendation
                        </h3>
                        <p style={{ fontSize: '12px', color: '#388e3c', margin: '2px 0 0 0' }}>
                            Powered by Google Gemini • {confidencePercentage}% Confidence
                        </p>
                    </div>
                </div>
            </div>

            {/* Price Recommendations */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px',
                marginBottom: '16px'
            }}>
                <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '4px', border: '1px solid #c8e6c9' }}>
                    <p style={{ fontSize: '11px', color: '#388e3c', marginBottom: '4px', fontWeight: '600' }}>
                        MINIMUM PRICE
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: '700', color: '#1b5e20' }}>
                        ₹{recommendation.recommended_min_price}
                    </p>
                    <p style={{ fontSize: '11px', color: '#666' }}>per quintal</p>
                </div>

                <div style={{
                    backgroundColor: '#fff',
                    padding: '16px',
                    borderRadius: '4px',
                    border: '2px solid #2e7d32',
                    position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '8px',
                        backgroundColor: '#ff9800',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: '700'
                    }}>
                        OPTIMAL
                    </div>
                    <p style={{ fontSize: '11px', color: '#2e7d32', marginBottom: '4px', fontWeight: '600' }}>
                        RECOMMENDED PRICE
                    </p>
                    <p style={{ fontSize: '28px', fontWeight: '700', color: '#1b5e20' }}>
                        ₹{recommendation.optimal_price}
                    </p>
                    <p style={{ fontSize: '11px', color: '#666' }}>per quintal</p>
                </div>

                <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '4px', border: '1px solid #c8e6c9' }}>
                    <p style={{ fontSize: '11px', color: '#388e3c', marginBottom: '4px', fontWeight: '600' }}>
                        MAXIMUM PRICE
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: '700', color: '#1b5e20' }}>
                        ₹{recommendation.recommended_max_price}
                    </p>
                    <p style={{ fontSize: '11px', color: '#666' }}>per quintal</p>
                </div>
            </div>

            {/* Confidence Bar */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#1b5e20' }}>
                        Analysis Confidence
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#2e7d32' }}>
                        {confidencePercentage}%
                    </span>
                </div>
                <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#c8e6c9',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${confidencePercentage}%`,
                        height: '100%',
                        backgroundColor: '#2e7d32',
                        transition: 'width 0.5s ease'
                    }} />
                </div>
            </div>

            {/* AI Reasoning */}
            <div style={{
                backgroundColor: '#fff',
                padding: '16px',
                borderRadius: '4px',
                border: '1px solid #c8e6c9'
            }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#1b5e20', marginBottom: '8px' }}>
                    💡 AI Analysis:
                </p>
                <p style={{ fontSize: '13px', color: '#424242', lineHeight: '1.5', margin: 0 }}>
                    {recommendation.reasoning}
                </p>
            </div>

            {/* Market Factors */}
            {recommendation.market_factors && recommendation.market_factors.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#1b5e20', marginBottom: '8px' }}>
                        Market Factors Considered:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {recommendation.market_factors.map((factor, idx) => (
                            <span
                                key={idx}
                                style={{
                                    backgroundColor: '#fff',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    color: '#2e7d32',
                                    border: '1px solid #c8e6c9'
                                }}
                            >
                                ✓ {factor}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

PriceAdvisor.propTypes = {
    listingData: PropTypes.object.isRequired,
    onPriceUpdate: PropTypes.func,
    provider: PropTypes.string
};
