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

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/products/${id}`);
        setProduct(res.data);
      } catch (err: any) {
        setError('Producto no encontrado');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <Header onSearch={() => {}} />
      <div className="product-detail">
        <h1>{product.name}</h1>
        <img src={product.imageUrl || '/default-image.jpg'} alt={product.name} />
        <p>{product.description}</p>
        <p><strong>Precio original:</strong> ${product.originalPrice}</p>
        {product.discountedPrice !== product.originalPrice && (
          <p><strong>Precio con descuento:</strong> ${product.discountedPrice}</p>
        )}
        <p><strong>Stock:</strong> {product.stock}</p>
        <p><strong>Promoción aplicada:</strong> {product.appliedPromotion || 'Ninguna'}</p>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetail;