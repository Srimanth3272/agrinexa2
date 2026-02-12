import React, { useState } from 'react';
import PriceAdvisor from './components/AIComponents/PriceAdvisor';
import NegotiationAssistant from './components/AIComponents/NegotiationAssistant';
import MarketInsights from './components/AIComponents/MarketInsights';
import AIProviderSelector from './components/AIComponents/AIProviderSelector';

function AIDemo() {
    const [selectedCrop, setSelectedCrop] = useState('Basmati Rice');
    const [selectedState, setSelectedState] = useState('Punjab');
    const [testListingId, setTestListingId] = useState('');
    const [aiProvider, setAiProvider] = useState('gemini');

    // Sample listing data for PriceAdvisor demo
    const sampleListingData = {
        crop_variety: selectedCrop,
        quantity_quintals: 50,
        district: 'Amritsar',
        state: selectedState,
        moisture_content: 13.5,
        foreign_matter: 1.8,
        base_price: 2100
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px 20px'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    color: 'white',
                    marginBottom: '40px'
                }}>
                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        marginBottom: '10px',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                    }}>
                        🤖 AI Features Demo
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        opacity: 0.9,
                        marginBottom: '20px'
                    }}>
                        Experience intelligent farming assistance powered by AI
                    </p>
                    {/* AI Provider Selector */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                        <AIProviderSelector
                            onProviderChange={setAiProvider}
                            defaultProvider={aiProvider}
                        />
                    </div>
                </div>

                {/* Controls */}
                <div style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '20px',
                    marginBottom: '30px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Test Settings</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                                Crop Variety
                            </label>
                            <select
                                value={selectedCrop}
                                onChange={(e) => setSelectedCrop(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '2px solid #e0e0e0',
                                    fontSize: '1rem'
                                }}
                            >
                                <option>Basmati Rice</option>
                                <option>Paddy</option>
                                <option>Wheat</option>
                                <option>Corn</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                                State
                            </label>
                            <select
                                value={selectedState}
                                onChange={(e) => setSelectedState(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '2px solid #e0e0e0',
                                    fontSize: '1rem'
                                }}
                            >
                                <option>Punjab</option>
                                <option>Haryana</option>
                                <option>Uttar Pradesh</option>
                                <option>Bihar</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                                Listing ID (for Bid Analysis)
                            </label>
                            <input
                                type="text"
                                value={testListingId}
                                onChange={(e) => setTestListingId(e.target.value)}
                                placeholder="Enter listing ID"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '2px solid #e0e0e0',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* AI Components Grid */}
                <div style={{ display: 'grid', gap: '30px' }}>

                    {/* Market Insights */}
                    <div style={{
                        background: 'white',
                        borderRadius: '15px',
                        padding: '25px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }}>
                        <h2 style={{
                            marginTop: 0,
                            marginBottom: '20px',
                            color: '#667eea',
                            borderBottom: '3px solid #667eea',
                            paddingBottom: '10px'
                        }}>
                            📊 Market Intelligence
                        </h2>
                        <MarketInsights cropVariety={selectedCrop} state={selectedState} provider={aiProvider} />
                    </div>

                    {/* Price Advisor */}
                    <div style={{
                        background: 'white',
                        borderRadius: '15px',
                        padding: '25px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }}>
                        <h2 style={{
                            marginTop: 0,
                            marginBottom: '20px',
                            color: '#764ba2',
                            borderBottom: '3px solid #764ba2',
                            paddingBottom: '10px'
                        }}>
                            🤖 AI Price Advisor
                        </h2>
                        <PriceAdvisor
                            listingData={sampleListingData}
                            onPriceUpdate={(price) => console.log('Recommended price:', price)}
                            provider={aiProvider}
                        />
                    </div>

                    {/* Negotiation Assistant */}
                    {testListingId && (
                        <div style={{
                            background: 'white',
                            borderRadius: '15px',
                            padding: '25px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                        }}>
                            <h2 style={{
                                marginTop: 0,
                                marginBottom: '20px',
                                color: '#f093fb',
                                borderBottom: '3px solid #f093fb',
                                paddingBottom: '10px'
                            }}>
                                💬 Negotiation Assistant
                            </h2>
                            <NegotiationAssistant listingId={testListingId} provider={aiProvider} />
                        </div>
                    )}

                    {!testListingId && (
                        <div style={{
                            background: 'white',
                            borderRadius: '15px',
                            padding: '40px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                            textAlign: 'center',
                            color: '#666'
                        }}>
                            <p style={{ fontSize: '1.1rem' }}>
                                💡 Enter a Listing ID above to see Bid Analysis
                            </p>
                        </div>
                    )}
                </div>

                {/* Info Box */}
                <div style={{
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: '15px',
                    padding: '25px',
                    marginTop: '30px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                    <h3 style={{ marginTop: 0, color: '#667eea' }}>ℹ️ About These AI Features</h3>
                    <ul style={{ lineHeight: '1.8' }}>
                        <li><strong>Market Intelligence:</strong> Real-time market trends and price analysis based on historical data</li>
                        <li><strong>Price Advisor:</strong> AI-powered price recommendations considering quality, location, and market conditions</li>
                        <li><strong>Negotiation Assistant:</strong> Smart bid analysis with negotiation tips and counter-offer suggestions</li>
                        <li><strong>Multi-Provider Support:</strong> Choose between Google Gemini, Anthropic Claude, or compare both simultaneously</li>
                    </ul>
                    <p style={{
                        marginTop: '15px',
                        padding: '15px',
                        background: '#f0f4ff',
                        borderRadius: '8px',
                        borderLeft: '4px solid #667eea'
                    }}>
                        <strong>Current Provider:</strong> <span style={{ color: '#667eea', fontWeight: '600' }}>{aiProvider === 'both' ? 'Comparing Both Providers' : aiProvider === 'gemini' ? 'Google Gemini ✨' : 'Anthropic Claude 🤖'}</span>
                        <br /><br />
                        <strong>Note:</strong> The system supports multiple AI providers. If API keys are not configured, intelligent rule-based fallback analysis will be used.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AIDemo;
