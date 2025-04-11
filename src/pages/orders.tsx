import { useState, useEffect } from 'react';
import axios from 'axios';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('USER_TOKEN');  

      try {
        const response = await axios.get('http://localhost:3000/orders', {
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
    <div>
      <h1>Mis Pedidos</h1>
      {error && <p>{error}</p>}
      <ul>
        {orders.map((order) => (
          <li key={order._id}>
            <h3>Pedido {order._id}</h3>
            <p>Status: {order.status}</p>
            <p>Total: ${order.total}</p>
            <ul>
              {order.items.map((item, index) => (
                <li key={index}>
                  Producto: {item.productId}, Cantidad: {item.quantity}, Precio: ${item.price}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersPage;