import { FC, useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CartPage: FC = () => {
  const [cart, setCart] = useState<any>(null); // Estado para el carrito
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('USER_TOKEN'); // Obtener el token
        if (!token) {
          setError('No se ha encontrado el token de usuario');
          return;
        }

        // Realizamos la solicitud GET para obtener el carrito
        const response = await axios.get('http://localhost:3000/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCart(response.data); // Establecemos el carrito en el estado
      } catch (error) {
        setError('Error al cargar el carrito');
      }
    };

    fetchCart();
  }, []);

  if (error) {
    return <div>{error}</div>; // Muestra error si algo falla
  }

  return (
    <div>
      <Header />
      <div className="cart-page">
        <h1>Mi Carrito</h1>
        {cart ? (
          <div className="cart-items">
            {cart.items.length === 0 ? (
              <p>No hay productos en el carrito</p>
            ) : (
              cart.items.map((item: any) => (
                <div key={item.productId} className="cart-item">
                  <img
                    src={item.productId.imageUrl}
                    alt={item.productId.name}
                    className="cart-item-image"
                  />
                  <div className="cart-item-info">
                    <h3>{item.productId.name}</h3>
                    <p>${item.productId.price}</p>
                    <p>Cantidad: {item.quantity}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <p>Cargando...</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
