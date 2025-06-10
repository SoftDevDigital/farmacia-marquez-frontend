import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ProductDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:3002/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError('Producto no encontrado');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  const handleAddToCart = async () => {
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) {
      alert('Debes iniciar sesión para agregar productos al carrito.');
      router.push('/login');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3002/cart/add',
        { productId: product._id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        alert('Producto agregado al carrito ✅');
      } else {
        alert('No se pudo agregar al carrito.');
      }
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al agregar al carrito.');
    }
  };

  return (
    <>
      <Header onSearch={() => {}} />
      <div style={{ padding: '40px 20px', backgroundColor: '#f9f9f9' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '40px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ flex: '1 1 300px', textAlign: 'center' }}>
            <img
              src={product.imageUrl || '/default-image.jpg'}
              alt={product.name}
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px', objectFit: 'contain' }}
            />
          </div>

          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>
              {product.name}
            </h1>
            <p style={{ fontSize: '16px', color: '#4B5563', marginBottom: '20px', lineHeight: '1.6' }}>
              {product.description}
            </p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#14b8a6', marginBottom: '24px' }}>
              ${product.price.toLocaleString('es-AR')}
            </p>
            <button
              onClick={handleAddToCart}
              style={{
                backgroundColor: '#14b8a6',
                color: 'white',
                fontSize: '16px',
                padding: '14px 0',
                border: 'none',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              COMPRAR
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetail;
