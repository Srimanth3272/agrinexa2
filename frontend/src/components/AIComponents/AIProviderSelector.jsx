import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function AIProviderSelector({ onProviderChange, defaultProvider = 'gemini' }) {
    const [selectedProvider, setSelectedProvider] = useState(defaultProvider);

    useEffect(() => {
        // Load saved preference from localStorage
        const savedProvider = localStorage.getItem('ai_provider');
        if (savedProvider) {
            setSelectedProvider(savedProvider);
            onProviderChange(savedProvider);
        }
    }, [onProviderChange]);

    const handleChange = (event) => {
        const provider = event.target.value;
        setSelectedProvider(provider);
        localStorage.setItem('ai_provider', provider);
        onProviderChange(provider);
    };

    const getProviderIcon = (provider) => {
        switch (provider) {
            case 'gemini':
                return '✨';
            case 'claude':
                return '🤖';
            case 'both':
                return '🔄';
            default:
                return '🤖';
        }
    };

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#fff',
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #e0e0e0'
        }}>
            <span style={{ fontSize: '14px', color: '#878787', fontWeight: '500' }}>
                AI Provider:
            </span>
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <select
                    value={selectedProvider}
                    onChange={handleChange}
                    style={{
                        padding: '6px 32px 6px 30px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#2874f0',
                        border: '1px solid #2874f0',
                        borderRadius: '4px',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        appearance: 'none',
                        outline: 'none'
                    }}
                >
                    <option value="gemini">Google Gemini</option>
                    <option value="claude">Anthropic Claude</option>
                    <option value="both">Both (Compare)</option>
                </select>
                <span style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '16px',
                    pointerEvents: 'none'
                }}>
                    {getProviderIcon(selectedProvider)}
                </span>
                <span style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '12px',
                    color: '#2874f0',
                    pointerEvents: 'none'
                }}>
                    ▼
                </span>
            </div>
        </div>
    );
}

AIProviderSelector.propTypes = {
    onProviderChange: PropTypes.func.isRequired,
    defaultProvider: PropTypes.oneOf(['gemini', 'claude', 'both'])
};
