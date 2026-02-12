import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import api from './api';

export default function PriceAnalytics() {
    const [timeRange, setTimeRange] = useState('30days');
    const [loading, setLoading] = useState(true);
    const [priceData, setPriceData] = useState([]);
    const [marketStats, setMarketStats] = useState(null);

    // Sample data for demonstration - replace with actual API calls
    useEffect(() => {
        // Simulating API call
        setTimeout(() => {
            const mockData = generateMockPriceData(timeRange);
            setPriceData(mockData.prices);
            setMarketStats(mockData.stats);
            setLoading(false);
        }, 500);
    }, [timeRange]);

    const generateMockPriceData = (range) => {
        const days = range === '7days' ? 7 : range === '30days' ? 30 : 90;
        const prices = [];
        const basePrice = 2500;

        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const variation = Math.random() * 400 - 200;

            prices.push({
                date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                fullDate: date.toLocaleDateString('en-IN'),
                price: Math.round(basePrice + variation),
                avgPrice: Math.round(basePrice + variation * 0.8),
                minPrice: Math.round(basePrice + variation - 100),
                maxPrice: Math.round(basePrice + variation + 100),
                volume: Math.round(Math.random() * 500 + 200),
            });
        }

        const currentPrice = prices[prices.length - 1].price;
        const previousPrice = prices[prices.length - 2].price;
        const change = currentPrice - previousPrice;
        const changePercent = ((change / previousPrice) * 100).toFixed(2);

        return {
            prices,
            stats: {
                currentPrice,
                change,
                changePercent,
                avgPrice: Math.round(prices.reduce((sum, p) => sum + p.price, 0) / prices.length),
                highPrice: Math.max(...prices.map(p => p.maxPrice)),
                lowPrice: Math.min(...prices.map(p => p.minPrice)),
                totalVolume: prices.reduce((sum, p) => sum + p.volume, 0),
            }
        };
    };

    const StatCard = ({ title, value, subtitle, trend }) => (
        <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,.08)',
            flex: 1,
            minWidth: '200px'
        }}>
            <div style={{ fontSize: '14px', color: '#878787', marginBottom: '8px' }}>
                {title}
            </div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#212121', marginBottom: '4px' }}>
                {value}
            </div>
            {subtitle && (
                <div style={{ fontSize: '12px', color: trend > 0 ? '#388e3c' : trend < 0 ? '#d32f2f' : '#878787' }}>
                    {trend > 0 ? '▲' : trend < 0 ? '▼' : '●'} {subtitle}
                </div>
            )}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f3f6' }}>
            {/* Header */}
            <header style={{ backgroundColor: '#2874f0', padding: '16px 0', boxShadow: '0 2px 4px rgba(0,0,0,.08)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" style={{ color: '#fff', fontSize: '24px', fontWeight: '700', textDecoration: 'none', fontStyle: 'italic' }}>
                        AgroBid
                    </Link>
                    <nav style={{ display: 'flex', gap: '24px' }}>
                        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '14px' }}>Home</Link>
                        <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontSize: '14px' }}>Login</Link>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 16px' }}>
                {/* Page Title and Controls */}
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#212121', marginBottom: '4px' }}>
                            📊 Price Analytics
                        </h1>
                        <p style={{ fontSize: '14px', color: '#878787' }}>
                            Real-time market price trends and insights for Paddy
                        </p>
                    </div>

                    {/* Time Range Selector */}
                    <div style={{ display: 'flex', gap: '8px', backgroundColor: '#fff', padding: '4px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,.08)' }}>
                        {['7days', '30days', '90days'].map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                style={{
                                    padding: '8px 16px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    border: 'none',
                                    borderRadius: '2px',
                                    backgroundColor: timeRange === range ? '#2874f0' : 'transparent',
                                    color: timeRange === range ? '#fff' : '#878787',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : '90 Days'}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#878787' }}>
                        Loading price data...
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        {marketStats && (
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                                <StatCard
                                    title="Current Price"
                                    value={`₹${marketStats.currentPrice}/quintal`}
                                    subtitle={`${marketStats.changePercent}% (${marketStats.change > 0 ? '+' : ''}₹${marketStats.change})`}
                                    trend={marketStats.change}
                                />
                                <StatCard
                                    title="Average Price"
                                    value={`₹${marketStats.avgPrice}/quintal`}
                                    subtitle={`Last ${timeRange === '7days' ? '7' : timeRange === '30days' ? '30' : '90'} days`}
                                />
                                <StatCard
                                    title="Highest Price"
                                    value={`₹${marketStats.highPrice}/quintal`}
                                    subtitle="Period high"
                                />
                                <StatCard
                                    title="Total Volume"
                                    value={`${(marketStats.totalVolume / 1000).toFixed(1)}K`}
                                    subtitle="Quintals traded"
                                />
                            </div>
                        )}

                        {/* Price Trend Chart */}
                        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,.08)', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#212121', marginBottom: '20px' }}>
                                Price Trend
                            </h2>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={priceData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#878787"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        stroke="#878787"
                                        style={{ fontSize: '12px' }}
                                        label={{ value: 'Price (₹/quintal)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px' }}
                                        labelStyle={{ fontWeight: '600', marginBottom: '4px' }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="price"
                                        stroke="#2874f0"
                                        strokeWidth={3}
                                        name="Market Price"
                                        dot={{ fill: '#2874f0', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="avgPrice"
                                        stroke="#fb641b"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        name="Average Price"
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Price Range Chart */}
                        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,.08)', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#212121', marginBottom: '20px' }}>
                                Price Range (High/Low)
                            </h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={priceData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#878787"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        stroke="#878787"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px' }}
                                    />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="maxPrice"
                                        stroke="#388e3c"
                                        fill="#c8e6c9"
                                        name="High Price"
                                        fillOpacity={0.6}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="minPrice"
                                        stroke="#d32f2f"
                                        fill="#ffcdd2"
                                        name="Low Price"
                                        fillOpacity={0.6}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Trading Volume Chart */}
                        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,.08)' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#212121', marginBottom: '20px' }}>
                                Trading Volume
                            </h2>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={priceData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#878787"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        stroke="#878787"
                                        style={{ fontSize: '12px' }}
                                        label={{ value: 'Volume (quintals)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px' }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="volume"
                                        fill="#ff9800"
                                        name="Volume Traded"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Market Insights */}
                        <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '4px', marginTop: '24px', border: '1px solid #90caf9' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1976d2', marginBottom: '12px' }}>
                                💡 Market Insights
                            </h3>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#424242', fontSize: '14px', lineHeight: '1.8' }}>
                                <li>Prices have shown {marketStats.change > 0 ? 'an upward' : 'a downward'} trend of {Math.abs(marketStats.changePercent)}% over the selected period</li>
                                <li>Average trading volume: {Math.round(marketStats.totalVolume / priceData.length)} quintals per day</li>
                                <li>Price volatility: ₹{marketStats.highPrice - marketStats.lowPrice} (difference between high and low)</li>
                                <li>Best time to sell: When prices are above ₹{Math.round(marketStats.avgPrice * 1.05)}/quintal</li>
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
