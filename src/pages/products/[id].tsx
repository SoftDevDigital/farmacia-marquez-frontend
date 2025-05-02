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
        const res = await axios.get(`http://localhost:3000/products/${id}`);
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
        'http://localhost:3000/cart/add',
        { productId: product._id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.status === 200) {
        alert('Producto agregado al carrito ✅');
        // Opcional: router.push('/cart');
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
      <div className="product-detail-page" style={{ padding: '20px' }}>
        {/* BREADCRUMB */}
        

        <div className="product-detail-container" style={{ display: 'flex', gap: '40px' }}>
          {/* IMAGEN */}
          <div style={{ flex: '1', textAlign: 'center' }}>
            <img
              src={product.imageUrl || '/default-image.jpg'}
              alt={product.name}
              style={{ maxWidth: '350px', height: 'auto', objectFit: 'contain' }}
            />
          </div>

          {/* INFO */}
          <div style={{ flex: '1' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>{product.name}</h1>
            <p className="product-description">{product.description}</p>
            {/* ESTRELLAS Y REVIEWS */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
             
              
            </div>

            {/* PRECIO */}
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>
              ${product.price.toLocaleString('es-AR')}
            </p>
           

       
           
             
              

            <button
  onClick={handleAddToCart}
  style={{
    backgroundColor: '#14b8a6',
    color: 'white',
    fontSize: '16px',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    width: '100%',
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
