import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function MarketInsights({ cropVariety, state }) {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (cropVariety) {
            fetchMarketInsights();
        }
    }, [cropVariety, state]);

    const fetchMarketInsights = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({ crop_variety: cropVariety });
            if (state) params.append('state', state);

            const response = await fetch(`http://localhost:8000/api/ai/market-insights/?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to load market insights');

            const data = await response.json();
            setInsights(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'RISING': return '📈';
            case 'FALLING': return '📉';
            case 'STABLE': return '➡️';
            default: return '📊';
        }
    };

    const getTrendColor = (trend) => {
        switch (trend) {
            case 'RISING': return { bg: '#e8f5e9', color: '#2e7d32' };
            case 'FALLING': return { bg: '#ffebee', color: '#c62828' };
            case 'STABLE': return { bg: '#e3f2fd', color: '#1565c0' };
            default: return { bg: '#f5f5f5', color: '#616161' };
        }
    };

    if (loading) {
        return (
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '4px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#212121' }}>
                    📊 Market Intelligence
                </h3>
                <p style={{ fontSize: '13px', color: '#878787', marginTop: '8px' }}>
                    Loading market data...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '4px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#d32f2f' }}>
                    Market Data Unavailable
                </h3>
                <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
                    {error}
                </p>
            </div>
        );
    }

    if (!insights || !insights.data_available) {
        return (
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '4px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#212121' }}>
                    📊 Market Intelligence
                </h3>
                <p style={{ fontSize: '13px', color: '#878787', marginTop: '8px' }}>
                    {insights?.message || 'Insufficient data for market analysis'}
                </p>
            </div>
        );
    }

    const trendColors = getTrendColor(insights.trend);
    const trendIcon = getTrendIcon(insights.trend);

    return (
        <div style={{
            backgroundColor: '#fff',
            borderRadius: '4px',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,.1)'
        }}>
            {/* Header */}
            <div style={{
                backgroundColor: '#f8f9fa',
                padding: '16px 20px',
                borderBottom: '1px solid #e0e0e0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#212121', margin: 0 }}>
                            📊 Market Intelligence
                        </h3>
                        <p style={{ fontSize: '12px', color: '#878787', margin: '2px 0 0 0' }}>
                            Based on {insights.data_points} recent transactions
                        </p>
                    </div>
                    <div style={{
                        backgroundColor: trendColors.bg,
                        padding: '8px 16px',
                        borderRadius: '4px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '20px' }}>{trendIcon}</span>
                            <div>
                                <div style={{ fontSize: '11px', color: trendColors.color, fontWeight: '600' }}>
                                    {insights.trend}
                                </div>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: trendColors.color }}>
                                    {insights.trend_percentage > 0 ? '+' : ''}{insights.trend_percentage}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
                {/* Current Average Price */}
                <div style={{
                    backgroundColor: '#2874f0',
                    padding: '20px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    marginBottom: '16px'
                }}>
                    <p style={{ fontSize: '12px', color: '#fff', opacity: 0.9, marginBottom: '4px' }}>
                        CURRENT AVERAGE PRICE
                    </p>
                    <p style={{ fontSize: '36px', fontWeight: '700', color: '#fff', margin: 0 }}>
                        ₹{insights.current_avg_price}
                    </p>
                    <p style={{ fontSize: '12px', color: '#fff', opacity: 0.9, marginTop: '4px' }}>
                        per quintal
                    </p>
                </div>

                {/* Price Range */}
                {insights.price_range && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        marginBottom: '16px'
                    }}>
                        <div style={{
                            backgroundColor: '#f5f5f5',
                            padding: '16px',
                            borderRadius: '4px',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                                MINIMUM
                            </p>
                            <p style={{ fontSize: '20px', fontWeight: '700', color: '#212121', margin: 0 }}>
                                ₹{insights.price_range.min}
                            </p>
                        </div>
                        <div style={{
                            backgroundColor: '#f5f5f5',
                            padding: '16px',
                            borderRadius: '4px',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                                MAXIMUM
                            </p>
                            <p style={{ fontSize: '20px', fontWeight: '700', color: '#212121', margin: 0 }}>
                                ₹{insights.price_range.max}
                            </p>
                        </div>
                    </div>
                )}

                {/* AI Insights */}
                <div style={{
                    backgroundColor: '#e8f5e9',
                    padding: '16px',
                    borderRadius: '4px',
                    marginBottom: '16px',
                    border: '1px solid #c8e6c9'
                }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#1b5e20', marginBottom: '8px' }}>
                        💡 Market Analysis:
                    </p>
                    <p style={{ fontSize: '13px', color: '#2e7d32', margin: 0, lineHeight: '1.5' }}>
                        {insights.insights}
                    </p>
                </div>

                {/* Recommendations */}
                {insights.recommendations && insights.recommendations.length > 0 && (
                    <div>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#212121', marginBottom: '12px' }}>
                            📋 AI Recommendations:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {insights.recommendations.map((rec, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        backgroundColor: '#fff3e0',
                                        padding: '12px 16px',
                                        borderRadius: '4px',
                                        borderLeft: '3px solid #ff9800',
                                        fontSize: '13px',
                                        color: '#424242'
                                    }}
                                >
                                    {rec}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Period Info */}
                <p style={{
                    fontSize: '11px',
                    color: '#999',
                    textAlign: 'center',
                    marginTop: '16px',
                    margin: '16px 0 0 0'
                }}>
                    Analysis Period: {insights.period}
                </p>
            </div>
        </div>
    );
}

MarketInsights.propTypes = {
    cropVariety: PropTypes.string.isRequired,
    state: PropTypes.string
};
