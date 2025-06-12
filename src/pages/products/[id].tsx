import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const ProductDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { fetchCartCount } = useCart();

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await axios.get(`https://api.farmaciamarquezcity.com/products/${id}`);
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
      'https://api.farmaciamarquezcity.com/cart/add',
      {
        productId: product._id,
        quantity,
        applyDiscount: false,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 201) {
      await fetchCartCount(); // ✅ actualiza el contador

      const productImage = document.querySelector(`img[data-product-id="${product._id}"]`);
      const cartIcon = document.querySelector('.cart-icon');

      if (productImage && cartIcon) {
        const imgRect = productImage.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();

        const flyingImg = productImage.cloneNode(true) as HTMLElement;
        flyingImg.style.position = 'fixed';
        flyingImg.style.top = `${imgRect.top}px`;
        flyingImg.style.left = `${imgRect.left}px`;
        flyingImg.style.width = `${imgRect.width}px`;
        flyingImg.style.height = `${imgRect.height}px`;
        flyingImg.style.transition = 'all 0.8s ease-in-out';
        flyingImg.style.zIndex = '9999';

        document.body.appendChild(flyingImg);

        requestAnimationFrame(() => {
          flyingImg.style.top = `${cartRect.top}px`;
          flyingImg.style.left = `${cartRect.left}px`;
          flyingImg.style.width = '20px';
          flyingImg.style.height = '20px';
          flyingImg.style.opacity = '0.5';
        });

        flyingImg.addEventListener('transitionend', () => {
          flyingImg.remove();
          cartIcon.classList.add('bounce');
          setTimeout(() => cartIcon.classList.remove('bounce'), 500);
        });
      }
    } else {
      alert('No se pudo agregar al carrito.');
    }
  } catch (err: any) {
    console.error(err.response?.data || err);
    alert('Ocurrió un error al agregar al carrito.');
  }
};

  return (
    <>
      <Header onSearch={() => {}} />
         <main style={{ flex: 1 }}>
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
               data-product-id={product._id} 
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
      </main>
      <Footer />
    </>
  );
};

export default ProductDetail;
