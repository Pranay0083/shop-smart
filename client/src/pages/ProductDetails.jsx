import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProductById } from '../api/products';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
      try {
        const result = await getProductById(id);
        if (mounted) {
          setProduct(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Could not load product details.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="container">
        <p>Loading product details...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container product-details-page">
        <p className="error-message" role="alert">
          {error}
        </p>
        <Link to="/" className="nav-link" data-testid="back-home-link">
          Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="container product-details-page">
      <Link to="/" className="back-link" data-testid="back-home-link">
        &lt;- Back to products
      </Link>
      <article className="product-details-card" data-testid="product-details-card">
        <img src={product.image} alt={product.name} className="product-details-image" />
        <div className="product-details-content">
          <p className="product-category">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="product-description">{product.description}</p>
          <div className="product-meta">
            <span>${Number(product.price).toFixed(2)}</span>
            <span>Rating: {product.rating}</span>
            <span>{product.stock} left in stock</span>
          </div>
          <div className="product-cta-row">
            <button className="buy-button" type="button">
              Add to Cart
            </button>
            <button className="wishlist-button" type="button">
              Save for Later
            </button>
          </div>
          <p className="delivery-note">
            Delivery in 2-4 business days. Easy returns within 30 days.
          </p>
        </div>
      </article>
    </main>
  );
}

export default ProductDetails;
