import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AIProviderSelector from './AIProviderSelector';

export default function NegotiationAssistant({ listingId }) {
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [provider, setProvider] = useState(localStorage.getItem('ai_provider') || 'gemini');

    useEffect(() => {
        if (listingId) {
            fetchNegotiationTips();
        }
    }, [listingId, provider]);

    const fetchNegotiationTips = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:8000/api/ai/negotiation-tips/${listingId}/?provider=${provider}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to load bid analyses');

            const data = await response.json();
            setAnalyses(data.bids || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getQualityColor = (rating) => {
        switch (rating) {
            case 'EXCELLENT': return { bg: '#e8f5e9', color: '#2e7d32', border: '#66bb6a' };
            case 'GOOD': return { bg: '#e3f2fd', color: '#1565c0', border: '#42a5f5' };
            case 'FAIR': return { bg: '#fff3e0', color: '#e65100', border: '#ffa726' };
            case 'POOR': return { bg: '#ffebee', color: '#c62828', border: '#ef5350' };
            default: return { bg: '#f5f5f5', color: '#616161', border: '#bdbdbd' };
        }
    };

    const getRecommendationIcon = (recommendation) => {
        switch (recommendation) {
            case 'ACCEPT': return '✅';
            case 'COUNTER': return '💬';
            case 'NEGOTIATE': return '🤝';
            case 'REJECT': return '❌';
            default: return '🤔';
        }
    };

    if (loading) {
        return (
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '4px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#212121', marginBottom: '16px' }}>
                    🤖 AI Negotiation Assistant
                </h3>
                <p style={{ fontSize: '14px', color: '#878787' }}>Analyzing bids...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '4px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#d32f2f', marginBottom: '8px' }}>
                    AI Analysis Error
                </h3>
                <p style={{ fontSize: '14px', color: '#666' }}>{error}</p>
            </div>
        );
    }

    if (analyses.length === 0) {
        return (
            <div style={{ backgroundColor: '#f5f5f5', padding: '24px', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤖</div>
                <p style={{ fontSize: '14px', color: '#878787' }}>
                    No bids to analyze yet. AI will provide negotiation guidance when bids arrive.
                </p>
            </div>
        );
    }

    return (
        <div style={{ marginBottom: '24px' }}>
            <div style={{
                backgroundColor: '#2874f0',
                padding: '16px 20px',
                borderRadius: '4px 4px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>🤖</span>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>
                            AI Negotiation Assistant
                        </h3>
                        <p style={{ fontSize: '12px', color: '#fff', opacity: 0.9, margin: '2px 0 0 0' }}>
                            Intelligent bid analysis and negotiation guidance
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AIProviderSelector
                        onProviderChange={setProvider}
                        defaultProvider={provider}
                    />
                    <div style={{
                        backgroundColor: '#fff',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#2874f0'
                    }}>
                        {analyses.length} bid{analyses.length !== 1 ? 's' : ''} analyzed
                    </div>
                </div>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '0 0 4px 4px', boxShadow: '0 2px 4px rgba(0,0,0,.1)' }}>
                {analyses.map((analysis, index) => {
                    const colors = getQualityColor(analysis.quality_rating);
                    const icon = getRecommendationIcon(analysis.recommendation);

                    return (
                        <div
                            key={analysis.id || index}
                            style={{
                                padding: '20px',
                                borderBottom: index < analyses.length - 1 ? '1px solid #f1f3f6' : 'none'
                            }}
                        >
                            {/* Bid Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#212121', margin: 0 }}>
                                            Bid from {analysis.buyer_name}
                                        </h4>
                                        <span style={{
                                            backgroundColor: colors.bg,
                                            color: colors.color,
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            border: `1px solid ${colors.border}`
                                        }}>
                                            {analysis.quality_rating}
                                        </span>
                                        {analysis.provider && (
                                            <span style={{
                                                backgroundColor: '#e3f2fd',
                                                color: '#1565c0',
                                                padding: '4px 8px',
                                                borderRadius: '8px',
                                                fontSize: '10px',
                                                fontWeight: '600'
                                            }}>
                                                {analysis.provider}
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '24px', fontWeight: '700', color: '#2874f0', margin: '4px 0' }}>
                                        ₹{analysis.bid_amount}/quintal
                                    </p>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        fontSize: '40px',
                                        fontWeight: '700',
                                        color: analysis.analysis_score >= 70 ? '#388e3c' : analysis.analysis_score >= 50 ? '#ff9800' : '#d32f2f',
                                        lineHeight: '1'
                                    }}>
                                        {Math.round(analysis.analysis_score)}
                                    </div>
                                    <p style={{ fontSize: '11px', color: '#878787', margin: '4px 0 0 0' }}>
                                        AI Score
                                    </p>
                                </div>
                            </div>

                            {/* AI Recommendation */}
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                padding: '12px 16px',
                                borderRadius: '4px',
                                marginBottom: '12px',
                                borderLeft: `4px solid ${colors.border}`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '20px' }}>{icon}</span>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: colors.color, textTransform: 'uppercase' }}>
                                        {analysis.recommendation}
                                    </span>
                                </div>
                                <p style={{ fontSize: '13px', color: '#424242', margin: 0, lineHeight: '1.5' }}>
                                    {analysis.reasoning}
                                </p>
                            </div>

                            {/* Counter Offer Suggestion */}
                            {analysis.suggested_counter_offer && (
                                <div style={{
                                    backgroundColor: '#fff3e0',
                                    padding: '12px 16px',
                                    borderRadius: '4px',
                                    marginBottom: '12px',
                                    border: '1px solid #ff9800'
                                }}>
                                    <p style={{ fontSize: '12px', color: '#e65100', fontWeight: '600', marginBottom: '4px' }}>
                                        💡 Suggested Counter-Offer:
                                    </p>
                                    <p style={{ fontSize: '20px', fontWeight: '700', color: '#e65100', margin: 0 }}>
                                        ₹{analysis.suggested_counter_offer}/quintal
                                    </p>
                                </div>
                            )}

                            {/* Strengths and Weaknesses */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                {/* Strengths */}
                                <div >
                                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#388e3c', marginBottom: '8px' }}>
                                        ✅ Strengths:
                                    </p>
                                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                        {analysis.strengths.map((strength, idx) => (
                                            <li key={idx} style={{ fontSize: '12px', color: '#424242', marginBottom: '4px' }}>
                                                {strength}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Weaknesses */}
                                <div>
                                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#d32f2f', marginBottom: '8px' }}>
                                        ⚠️ Concerns:
                                    </p>
                                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                        {analysis.weaknesses.map((weakness, idx) => (
                                            <li key={idx} style={{ fontSize: '12px', color: '#424242', marginBottom: '4px' }}>
                                                {weakness}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Negotiation Tips */}
                            {analysis.negotiation_tips && analysis.negotiation_tips.length > 0 && (
                                <div style={{
                                    backgroundColor: '#e8f5e9',
                                    padding: '12px 16px',
                                    borderRadius: '4px'
                                }}>
                                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#1b5e20', marginBottom: '8px' }}>
                                        🎯 Negotiation Tips:
                                    </p>
                                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                        {analysis.negotiation_tips.map((tip, idx) => (
                                            <li key={idx} style={{ fontSize: '12px', color: '#2e7d32', marginBottom: '4px', lineHeight: '1.4' }}>
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

NegotiationAssistant.propTypes = {
    listingId: PropTypes.number.isRequired
};
