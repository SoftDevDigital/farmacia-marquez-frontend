import { FC, useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '@/context/CartContext';
const CartPage: FC = () => {
  const [cart, setCart] = useState<any>(null); // Estado para el carrito
  const [error, setError] = useState<string>(''); // Estado para manejar errores
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga mientras obtenemos los datos
  const [shippingInfo, setShippingInfo] = useState({
    recipientName: '',
    phoneNumber: '',
    documentNumber: '',
    street: '',
    streetNumber: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    additionalNotes: ''
  });
  const [showShippingForm, setShowShippingForm] = useState(false); // Estado para mostrar el formulario de envío
  const { fetchCartCount } = useCart();
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('USER_TOKEN');
        if (!token) {
          alert('No se ha encontrado el token de usuario');
          return;
        }

        const response = await axios.get('http://localhost:3000/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          // Cargar los datos correctamente
          const cartWithProductDetails = await Promise.all(
            response.data.items.map(async (item: any) => {
              try {
                // Obtener el producto con el ID desde la base de datos o API
                const productResponse = await axios.get(
                  `http://localhost:3000/products/${item.productId}`
                );
                const product = productResponse.data; // Asume que la respuesta contiene el producto completo

                return {
                  ...item,
                  price: item.price ?? product.price, // importante: asegura el precio
                  product: product || {},
                };
              } catch (error) {
                console.error('Error al obtener el producto:', error);
                return { ...item, product: {} }; // Si falla, devolver un objeto vacío para product
              }
            })
          );

          setCart({ ...response.data, items: cartWithProductDetails }); // Establecer el carrito con productos completos
        } else {
          setError('No se pudo obtener el carrito.');
        }
      } catch (error) {
        setError('Error al cargar el carrito.');
        console.error(error);
      } finally {
        setLoading(false); // Finalizar carga
      }
    };

    fetchCart();
  }, []);

  // Función para actualizar la cantidad de un producto en el carrito
  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      alert('La cantidad debe ser mayor que 0');
      return;
    }

    // Actualizar la cantidad de forma instantánea en la UI
    const updatedCart = { ...cart };
    const updatedItems = updatedCart.items.map((item: any) =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    updatedCart.items = updatedItems;
    setCart(updatedCart);

    const token = localStorage.getItem('USER_TOKEN'); // Obtener el token del localStorage
    if (!token) {
      alert('No estás autenticado');
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:3000/cart/update/${productId}`,
        { quantity: newQuantity }, // Cuerpo de la solicitud
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200) {
        alert('Hubo un problema al actualizar la cantidad');
      }
    } catch (error) {
      console.error(error);
      alert('Error al actualizar la cantidad del producto');
    }
  };

  // Función para eliminar un producto del carrito
  const handleRemoveItem = async (productId: string) => {
    const token = localStorage.getItem('USER_TOKEN'); // Obtener el token
    if (!token) {
      alert('No estás autenticado');
      return;
    }

    // Eliminar el producto de manera instantánea en la UI
    const updatedCart = { ...cart };
    updatedCart.items = updatedCart.items.filter((item: any) => item.productId !== productId);
    setCart(updatedCart);
  
    try {
      const response = await axios.delete(`http://localhost:3000/cart/remove/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        
        await fetchCartCount(); // ✅ ACTUALIZA el contador
      }
      if (response.status === 200) {
        alert('Producto eliminado del carrito');
      } else {
        alert('Hubo un problema al eliminar el producto');
      }
    } catch (error) {
      console.error(error);
      alert('Error al eliminar el producto');
    }
  };

  // Función para limpiar todo el carrito
  const handleClearCart = async () => {
    const token = localStorage.getItem('USER_TOKEN'); // Obtener el token
    if (!token) {
      alert('No estás autenticado');
      return;
    }

    // Limpiar el carrito de manera instantánea en la UI
    setCart({ items: [], total: 0 });

    try {
      const response = await axios.delete('http://localhost:3000/cart/clear', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        alert('Carrito limpiado con éxito');
      } else {
        alert('Hubo un problema al limpiar el carrito');
      }
    } catch (error) {
      console.error(error);
      alert('Error al limpiar el carrito');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  // Función para mostrar el formulario de envío al hacer clic en "Iniciar Proceso de Pago"
  const handleShowShippingForm = () => {
    setShowShippingForm(true); // Mostrar formulario
  };

  // Función para iniciar el proceso de pago con Mercado Pago
  const handleCheckout = async () => {
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) {
      alert('No estás autenticado');
      return;
    }

    try {
      const shippingResponse = await axios.post(
        'http://localhost:3000/users/shipping-info',
        shippingInfo,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    
      if (shippingResponse.status === 200 || shippingResponse.status === 201) {
        const paymentResponse = await axios.post(
          'http://localhost:3000/payments/checkout',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
    
        if (paymentResponse.data.init_point) {
          // Redirigir al usuario a Mercado Pago
          window.location.href = paymentResponse.data.init_point;
        } else {
          alert('No se pudo iniciar el proceso de pago, intente nuevamente.');
        }
      } else {
        alert('Hubo un problema al actualizar la información de envío');
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error.response?.data || error);
      alert('Error al procesar la información de pago');
    }
  }
  return (
    <div>
      <Header />
      <div className="cart-page">
        <h1>Mi Carrito</h1>
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className="cart-items">
            {cart?.items.length === 0 ? (
              <p>No hay productos en el carrito</p>
            ) : (
              cart.items.map((item: any) => {
                const product = item.product || {}; // Asegurarse de que 'product' siempre sea un objeto
                return (
                  <div key={item.productId} className="cart-item">
                    {product.name ? (
                      <>
                        <img
                          src={product.imageUrl || '/default-image.jpg'}
                          alt={product.name}
                          className="cart-item-image"
                        />
                        <div className="cart-item-info">
                          <h3>{product.name}</h3>
                          <p>Precio unitario: ${product.discountedPrice ?? item.price}</p>
<p>Cantidad: {item.quantity}</p>
<p>Total del producto: ${item.finalPrice !== undefined ? item.finalPrice : (item.price * item.quantity)}</p>
                          <div>
                            <label>Cantidad: </label>
                            <input
                              type="number"
                              value={item.quantity}
                              min="1"
                              onChange={(e) =>
                                handleUpdateQuantity(item.productId, Number(e.target.value))
                              }
                            />
                          </div>
                          <button className="btn btn-buy" onClick={() => handleRemoveItem(item.productId)}>
                            Eliminar
                          </button>
                        </div>
                      </>
                    ) : (
                      <p>Producto no disponible</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
          
        )}
        {cart?.total !== undefined && (
  <div className="cart-total">
    <h3>Total del carrito: ${cart.total}</h3>
  </div>
)}
        {/* Botón para mostrar el formulario de envío */}
        <button className="toggle-shipping-button btn btn-buy" onClick={() => setShowShippingForm(!showShippingForm)}>
  {showShippingForm ? 'Ocultar Información de Envío' : 'Iniciar Proceso de Pago'}
</button>
        {showShippingForm && (
          <>
            <h2>Información de Envío</h2>
            <form className="shipping-form">
  <div className="form-group">
    <label htmlFor="recipientName">Nombre:</label>
    <input type="text" id="recipientName" name="recipientName" value={shippingInfo.recipientName} onChange={handleChange} required />
  </div>
  <div className="form-group">
    <label htmlFor="phoneNumber">Teléfono:</label>
    <input type="text" id="phoneNumber" name="phoneNumber" value={shippingInfo.phoneNumber} onChange={handleChange} required />
  </div>
  <div className="form-group">
    <label htmlFor="documentNumber">Documento:</label>
    <input type="text" id="documentNumber" name="documentNumber" value={shippingInfo.documentNumber} onChange={handleChange} required />
  </div>
  <div className="form-group">
    <label htmlFor="street">Dirección:</label>
    <input type="text" id="street" name="street" value={shippingInfo.street} onChange={handleChange} required />
  </div>
  <div className="form-group">
    <label htmlFor="streetNumber">Número:</label>
    <input type="text" id="streetNumber" name="streetNumber" value={shippingInfo.streetNumber} onChange={handleChange} required />
  </div>
  <div className="form-group">
    <label htmlFor="apartment">Departamento:</label>
    <input type="text" id="apartment" name="apartment" value={shippingInfo.apartment} onChange={handleChange} />
  </div>
  <div className="form-group">
    <label htmlFor="city">Ciudad:</label>
    <input type="text" id="city" name="city" value={shippingInfo.city} onChange={handleChange} required />
  </div>
  <div className="form-group">
    <label htmlFor="state">Provincia:</label>
    <input type="text" id="state" name="state" value={shippingInfo.state} onChange={handleChange} required />
  </div>
  <div className="form-group">
    <label htmlFor="postalCode">Código Postal:</label>
    <input type="text" id="postalCode" name="postalCode" value={shippingInfo.postalCode} onChange={handleChange} required />
  </div>
  <div className="form-group">
    <label htmlFor="country">País:</label>
    <input type="text" id="country" name="country" value={shippingInfo.country} onChange={handleChange} required />
  </div>
  <div className="form-group full-width">
    <label htmlFor="additionalNotes">Notas adicionales:</label>
    <textarea id="additionalNotes" name="additionalNotes" value={shippingInfo.additionalNotes} onChange={handleChange} />
  </div>
</form>
            <button className="btn btn-buy" onClick={handleCheckout}>Confirmar Información y Pagar</button>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
