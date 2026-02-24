const apiUrl = import.meta.env.VITE_API_URL || '';

export async function getProducts() {
  const response = await fetch(`${apiUrl}/api/products`);
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch products');
  }

  return data.data.products || [];
}

export async function getProductById(id) {
  const response = await fetch(`${apiUrl}/api/products/${id}`);
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch product details');
  }

  return data.data.product;
}
