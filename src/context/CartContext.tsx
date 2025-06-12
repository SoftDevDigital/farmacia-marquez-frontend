import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartCount, setCartCount] = useState<number>(0);

  const fetchCartCount = async () => {
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) return;
    try {
      const res = await axios.get('https://api.farmaciamarquezcity.com/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200 && res.data.items) {
        const totalItems = res.data.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setCartCount(totalItems);
      }
    } catch (err) {
      console.error('Error al obtener cantidad de productos del carrito', err);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, []);


  return (
    <CartContext.Provider value={{ cartCount, setCartCount, fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
