import { useState, useEffect } from 'react'

function App() {
    const [data, setData] = useState(null);

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        fetch(`${apiUrl}/api/health`)
            .then(res => res.json())
            .then(data => setData(data))
            .catch(err => console.error('Error fetching health check:', err));
    }, []);

    return (
        <div className="container">
            <h1>ShopSmart and save more!</h1>
            <div className="card">
                <h2>Backend Status</h2>
                {data ? (
                    <div>
                        <p>Status: <span className="status-ok">{data.status}</span></p>
                        <p>Message: {data.message}</p>
                        <p>Timestamp: {data.timestamp}</p>
                    </div>
                ) : (
                    <p>Loading backend status...</p>
                )}
            </div>
            <p className="hint">
                Edit <code>src/App.jsx</code> and save to test HMR
            </p>
        </div>
    )
}

export default App
