import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/products';

function Home() {
  const [healthData, setHealthData] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    fetch(`${apiUrl}/api/health`)
      .then((res) => res.json())
      .then((data) => setHealthData(data))
      .catch((err) => console.error('Error fetching health check:', err));

    getProducts()
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setProductsError('Could not load products right now.');
      })
      .finally(() => {
        setProductsLoading(false);
      });
  }, []);

  return (
    <main className="container storefront">
      <header className="store-topbar">
        <h1>ShopSmart</h1>
        <div className="store-actions">
          {isAuthenticated ? (
            <div className="user-section">
              <p className="welcome-text">Welcome, {user.firstName || user.email}!</p>
              <button onClick={logout} className="logout-button" data-testid="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link" data-testid="login-link">
                Login
              </Link>
              <Link to="/signup" className="nav-link nav-link-primary" data-testid="signup-link">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      <section className="hero-shell" aria-label="hero">
        <p className="hero-kicker">Spring deals</p>
        <p className="hero-subtitle">
          Discover quality tech products curated for your daily needs.
        </p>
        <div className="hero-meta">
          <span>Free shipping over $50</span>
          <span>2-year warranty</span>
          <span>Fast checkout</span>
        </div>
      </section>

      <section className="card products-section" aria-label="products-listing">
        <div className="section-head">
          <h2>Featured Products</h2>
          <p>Handpicked items with premium quality and competitive pricing.</p>
        </div>
        {productsLoading ? <p>Loading products...</p> : null}
        {!productsLoading && productsError ? <p role="alert">{productsError}</p> : null}
        {!productsLoading && !productsError ? (
          <div className="products-grid" data-testid="products-grid">
            {products.map((product) => (
              <article
                key={product.id}
                className="product-card"
                data-testid={`product-card-${product.id}`}
              >
                <img src={product.image} alt={product.name} className="product-image" />
                <div className="product-card-content">
                  <p className="product-category">{product.category}</p>
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-footer">
                    <span className="product-price">${Number(product.price).toFixed(2)}</span>
                    <Link
                      className="view-details-link"
                      to={`/products/${product.id}`}
                      data-testid={`product-link-${product.id}`}
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="status-panel card">
        <h2>Backend Status</h2>
        {healthData ? (
          <div className="status-grid">
            <p>
              Status: <span className="status-ok">{healthData.status}</span>
            </p>
            <p>Message: {healthData.message}</p>
            <p>Timestamp: {healthData.timestamp}</p>
          </div>
        ) : (
          <p>Loading backend status...</p>
        )}
      </section>
    </main>
  );
}

export default Home;
