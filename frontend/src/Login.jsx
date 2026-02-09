import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from './api';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login/', { username, password });
            const { user, tokens } = response.data;

            // Store user data and tokens
            localStorage.setItem('access_token', tokens.access);
            localStorage.setItem('refresh_token', tokens.refresh);
            localStorage.setItem('user', JSON.stringify(user));

            // Navigate based on role
            if (user.role === 'FARMER') {
                navigate('/farmer/dashboard');
            } else if (user.role === 'BUYER') {
                navigate('/buyer/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f3f6' }}>
            {/* Header */}
            <header style={{ backgroundColor: '#2874f0', padding: '16px 0', boxShadow: '0 2px 4px rgba(0,0,0,.08)' }}>
                <div style={{ maxWidth: '1248px', margin: '0 auto', padding: '0 16px' }}>
                    <Link to="/" style={{ color: '#fff', fontSize: '24px', fontWeight: '700', textDecoration: 'none', fontStyle: 'italic' }}>
                        AgroBid
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div style={{
                maxWidth: '400px',
                margin: '80px auto',
                padding: '0 16px'
            }}>
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,.1)',
                    padding: '48px 40px'
                }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '600',
                        color: '#212121',
                        marginBottom: '32px'
                    }}>
                        Login
                    </h1>

                    {error && (
                        <div style={{
                            backgroundColor: '#ff6161',
                            color: '#fff',
                            padding: '12px 16px',
                            borderRadius: '2px',
                            marginBottom: '16px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter Username"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '2px',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#2874f0'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter Password"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '2px',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#2874f0'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                backgroundColor: '#fb641b',
                                color: '#fff',
                                padding: '14px',
                                fontSize: '16px',
                                fontWeight: '600',
                                border: 'none',
                                borderRadius: '2px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 2px 4px rgba(0,0,0,.2)',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <Link
                            to="/register"
                            style={{
                                color: '#2874f0',
                                fontSize: '14px',
                                fontWeight: '600',
                                textDecoration: 'none'
                            }}
                        >
                            New to AgroBid? Create an account
                        </Link>
                    </div>

                    {/* Test Credentials */}
                    <div style={{
                        marginTop: '32px',
                        padding: '16px',
                        backgroundColor: '#e8f5e9',
                        borderRadius: '2px',
                        border: '1px solid #a5d6a7'
                    }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#2e7d32', marginBottom: '8px' }}>
                            🔑 Test Credentials:
                        </p>
                        <p style={{ fontSize: '11px', color: '#558b2f', marginBottom: '4px' }}>
                            Farmer: <strong>farmer1</strong> / farmer123
                        </p>
                        <p style={{ fontSize: '11px', color: '#558b2f' }}>
                            Buyer: <strong>buyer1</strong> / buyer123
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
