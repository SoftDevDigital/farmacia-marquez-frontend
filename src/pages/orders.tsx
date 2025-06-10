import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');


  const [products, setProducts] = useState([]);
  const router = useRouter();
useEffect(() => {
  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:3003/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error al cargar productos', err);
    }
  };

  fetchProducts();
}, []);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('USER_TOKEN');  

      try {
        const response = await axios.get('http://localhost:3003/orders', {
          headers: {
            Authorization: `Bearer ${token}`  
          }
        });
        setOrders(response.data);  
      } catch (err) {
        setError('Error al cargar los pedidos');
        console.error(err);
      }
    };

    fetchOrders();  
  }, []);  

  return (
    <div className="orders-page">
    <h1>Mis Pedidos</h1>
    {error && <p>{error}</p>}
    {orders.map((order) => (
      <div key={order._id} className="order-card">
        <h3>Pedido #{order._id.slice(0, 8)}...</h3>
        <p className="order-status">Estado: {order.status}</p>
        <p className="order-total">Total: ${order.total}</p>
        <ul className="item-list">
        {order.items.map((item, index) => {
  const foundProduct = products.find((p) => p._id === item.productId);
  return (
    <li key={index} className="item">
      Producto: <strong>{foundProduct?.name || 'Nombre no disponible'}</strong>, 
      Cantidad: {item.quantity}, Precio: ${item.price}
    </li>
  );
})}
        </ul>
      </div>
    ))}

<div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
  <button
    className="btn btn-buy"
    onClick={() => router.push('/')}
  >
    Volver al Inicio
  </button>
</div>
  </div>
  );
};

export default OrdersPage;