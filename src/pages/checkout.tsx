import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Checkout = () => {
  const [cart, setCart] = useState<any>({ items: [] });
const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const router = useRouter();
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

  useEffect(() => {
    const fetchCartAndSelection = async () => {
      const token = localStorage.getItem('USER_TOKEN');
      if (!token) return;
  
      try {
        const cartResponse = await axios.get('http://localhost:3000/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCart(cartResponse.data);
  
        const storedSelectedIds = localStorage.getItem('selectedProductIds');
        if (storedSelectedIds) {
          setSelectedProductIds(JSON.parse(storedSelectedIds));
        }
  
        const savedShippingInfo = localStorage.getItem('shippingInfo');
        if (savedShippingInfo) {
          setShippingInfo(JSON.parse(savedShippingInfo));
        }
  
      } catch (err) {
        console.error('Error al traer el carrito o la selección', err);
      }
    };
  
    fetchCartAndSelection();
  }, []);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };
  const handleCheckout = async () => {
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) {
      alert('No estás autenticado');
      return;
    }
  
    // Validación de campos obligatorios
    const requiredFields = [
      'recipientName',
      'phoneNumber',
      'documentNumber',
      'street',
      'streetNumber',
      'city',
      'state',
      'postalCode',
      'country',
    ];
  
    const missingFields = requiredFields.filter((field) => !shippingInfo[field as keyof typeof shippingInfo]);
  
    if (missingFields.length > 0) {
      alert('Todos los campos son obligatorios menos los campos de departamento y notas adiccionales.');
      return;
    }
  
    try {
      const selectedItems = selectedProductIds.length > 0
        ? cart.items.filter((item: any) => selectedProductIds.includes(item.productId))
        : cart.items;
  
      if (selectedItems.length === 0) {
        alert('Seleccioná al menos un producto para pagar');
        return;
      }
  
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
          {
            selectedProductIds: selectedItems.map((item: any) => item.productId),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
  
        if (paymentResponse.data.init_point) {
          window.location.href = paymentResponse.data.init_point;
        } else {
          alert('No se pudo iniciar el proceso de pago.');
        }
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error.response?.data || error);
      alert('Error al procesar el pago');
    }
  };
  

  
  

  return (
    <>
      <Header />
      <div className="checkout-container">
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
        <button className="btn btn-buy" onClick={handleCheckout}>
          Confirmar Información y Pagar
        </button>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;