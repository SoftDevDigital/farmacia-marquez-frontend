import { FC, useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/router';
import ModalLoginRequired from '../components/ModalLoginRequired'; 

const CartPage: FC = () => {
  const [cart, setCart] = useState<any>(null); // Estado para el carrito
  const [error, setError] = useState<string>(''); // Estado para manejar errores
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga mientras obtenemos los datos
  const router = useRouter();
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false)
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
  const [quantityUpdating, setQuantityUpdating] = useState<{ [key: string]: boolean }>({});
  const [quantityTimers, setQuantityTimers] = useState<{ [key: string]: NodeJS.Timeout }>({});

  const [existingShippingInfo, setExistingShippingInfo] = useState<any>(null);
  const [showShippingDecision, setShowShippingDecision] = useState(false);
 

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('USER_TOKEN');
      if (!token) {
        alert('No se ha encontrado el token de usuario');
        return;
      }
  
      const response = await axios.get('https://api.farmaciamarquezcity.com/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 200) {
        const cartWithProductDetails = await Promise.all(
          response.data.items.map(async (item: any) => {
            try {
              const productResponse = await axios.get(
                `https://api.farmaciamarquezcity.com/products/${item.productId}`
              );
              const product = productResponse.data;
  
              return {
                ...item,
                price: item.price ?? product.price,
                product: product || {},
              };
            } catch (error) {
              console.error('Error al obtener el producto:', error);
              return { ...item, product: {} };
            }
          })
        );
  
        setCart({ ...response.data, items: cartWithProductDetails });
  
        // 👉 INICIALIZAR SELECCIONADOS
        const allProductIds = cartWithProductDetails.map((item: any) => item.productId);
        setSelectedProductIds(allProductIds);
  
      } else {
        setError('No se pudo obtener el carrito.');
      }
    } catch (error) {
      setError('Error al cargar el carrito.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const token = localStorage.getItem('USER_TOKEN');
  if (!token) {
    setShowLoginModal(true); // muestra el modal si no está logueado
    return;
  }

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
        `https://api.farmaciamarquezcity.com/cart/update/${productId}`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    
      if (response.status === 200) {
        await fetchCart(); // 🔁 ← Esto refresca el `discountedSubtotal`
      } else {
        alert('Hubo un problema al actualizar la cantidad');
      }
    } catch (error) {
      console.error(error);
      alert('Error al actualizar la cantidad del producto');
    }
  }

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
      const response = await axios.delete(`https://api.farmaciamarquezcity.com/cart/remove/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        
        await fetchCartCount(); // ✅ ACTUALIZA el contador
      }
      if (response.status === 200) {
        
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
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) {
      alert('No estás autenticado');
      return;
    }
  
    setCart({ items: [], total: 0 });
  
    try {
      const response = await axios.delete('https://api.farmaciamarquezcity.com/cart/clear', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        
        await fetchCartCount(); // actualiza contador del ícono
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

 
 


  const updateQuantityDebounced = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;
  
    // Clear previous timeout if exists
    if (quantityTimers[productId]) {
      clearTimeout(quantityTimers[productId]);
    }
  
    setQuantityUpdating((prev) => ({ ...prev, [productId]: true }));
  
    // Set timeout for backend update
    const timer = setTimeout(() => {
      handleUpdateQuantity(productId, newQuantity)
        .finally(() => {
          setQuantityUpdating((prev) => ({ ...prev, [productId]: false }));
        });
    }, 600); // 600ms delay
  
    setQuantityTimers((prev) => ({ ...prev, [productId]: timer }));
  
    // Update UI immediately
    const updatedCart = { ...cart };
    updatedCart.items = updatedCart.items.map((item: any) =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
  };

  useEffect(() => {
    const fetchExistingShippingInfo = async () => {
      const token = localStorage.getItem('USER_TOKEN');
      if (!token) return;
  
      try {
        const res = await axios.get('https://api.farmaciamarquezcity.com/users/shipping-info', {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (res.data) {
          setExistingShippingInfo(res.data); // guardar datos actuales
          setShowShippingDecision(true); // mostrar decisión al usuario
        } else {
          setShowShippingForm(true); // si no hay datos, mostrar directamente el form
        }
      } catch (error) {
        console.error('No hay información de envío previa o falló la petición');
        setShowShippingForm(true); // por las dudas mostrar igual el form
      }
    };
  
    fetchExistingShippingInfo();
  }, []);

  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onSearch={() => {}} />
        <main style={{ flex: 1, paddingTop: '140px' }}>
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
                    <label>
  <input
    type="checkbox"
    checked={selectedProductIds.includes(item.productId)}
    onChange={() => {
      setSelectedProductIds((prev) =>
        prev.includes(item.productId)
          ? prev.filter((id) => id !== item.productId)
          : [...prev, item.productId]
      );
    }}
  />
  Seleccionar
</label>
                    {product.name ? (
                      <>
                        <img
                          src={product.imageUrl || '/default-image.jpg'}
                          alt={product.name}
                          data-product-id={product._id}
                          className="cart-item-image"
                        />
                        <div className="cart-item-info">
                          <h3>{product.name}</h3>
                          <p>Precio unitario: ${product.discountedPrice ?? item.price}</p>
<p>Cantidad: {item.quantity}</p>
<p>Total del producto: ${item.discountedSubtotal ?? (item.finalPrice !== undefined ? item.finalPrice : (item.price * item.quantity))}</p>
<div className="quantity-wrapper">
  <label>Cantidad: </label>
  <div className="quantity-controls">
    <button
      disabled={quantityUpdating[item.productId]}
      onClick={() => updateQuantityDebounced(item.productId, item.quantity - 1)}
    >−</button>
    
    {quantityUpdating[item.productId] ? (
      <span className="spinner">⏳</span>
    ) : (
      <span>{item.quantity}</span>
    )}
    
    <button
      disabled={quantityUpdating[item.productId]}
      onClick={() => updateQuantityDebounced(item.productId, item.quantity + 1)}
    >+</button>
  </div>
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
       {cart?.items && (
  <div className="cart-total">
    <h3>Total seleccionado: $
      {
        cart.items
          .filter((item: any) => selectedProductIds.includes(item.productId))
          .reduce((acc: number, item: any) => acc + (item.discountedSubtotal ?? item.finalPrice ?? item.price * item.quantity), 0)
      }
    </h3>
  </div>
)}

{cart?.items.length > 0 && (
  <div style={{ marginTop: '1rem' }}>
    <button className="btn btn-buy" onClick={handleClearCart}>
      Limpiar carrito
    </button>
  </div>
)}

{showShippingDecision && existingShippingInfo && (
  <div className="shipping-decision">
    <h3>¿Querés usar tu información de envío guardada?</h3>
    <div className="saved-shipping-info">
      <p><strong>Nombre:</strong> {existingShippingInfo.recipientName}</p>
      <p><strong>Teléfono:</strong> {existingShippingInfo.phoneNumber}</p>
      <p><strong>Dirección:</strong> {existingShippingInfo.street} {existingShippingInfo.streetNumber}, {existingShippingInfo.city}, {existingShippingInfo.state}, {existingShippingInfo.country}</p>
    </div>
    <div className="decision-buttons">
      <button className="btn btn-buy" onClick={() => {
        setShippingInfo(existingShippingInfo);
        setShowShippingForm(true);
        setShowShippingDecision(false);
      }}>
        Usar esta información
      </button>
      <button className="btn btn-buy" onClick={() => {
        setShowShippingForm(true);
        setShowShippingDecision(false);
      }}>
        Ingresar nueva información
      </button>
    </div>
  </div>
)}
        <button
  className="toggle-shipping-button btn btn-buy"
  onClick={() => {
    localStorage.setItem('selectedProductIds', JSON.stringify(selectedProductIds));
    router.push('/checkout');
  }}
>
  Iniciar Proceso de Pago
</button>
       
      </div>
      </main>
      {showLoginModal && <ModalLoginRequired onClose={() => setShowLoginModal(false)} />}
      <Footer />
    </div>
  );
};

export default CartPage;
