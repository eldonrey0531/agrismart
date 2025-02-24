import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAPI } from '@/hooks/useAPI';
import { useAuth } from '@/hooks/useAuth';
import { Product } from '@/types';

const ProductPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const api = useAPI();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const response = await api.get(`/api/marketplace/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div>
      <h1>{product.title}</h1>
      <p>{product.description}</p>
      <div>Price: ${product.price}</div>
      {user?.id === product.sellerId && (
        <div>
          <button onClick={() => router.push(`/marketplace/edit/${id}`)}>
            Edit Listing
          </button>
        </div>
      )}
      {user && user.id !== product.sellerId && (
        <button onClick={() => router.push(`/chat/${product.sellerId}`)}>
          Contact Seller
        </button>
      )}
    </div>
  );
};

export default ProductPage;
