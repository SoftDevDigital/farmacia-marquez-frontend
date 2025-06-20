import { useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const PromotionsPage = () => {
  type Promotion = {
  _id: string;
  title: string;
  description: string;
  discountPercentage?: number;
  startDate: string;
  endDate: string;
  productIds: string[] | string;
  type: string;
  isActive: boolean;
  discountAmount?: number;
  discountPercentageSecond?: number;
  buyQuantity?: number;
  getQuantity?: number;
};

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false); 
  type PromotionFormData = {
  _id: string;
  title: string;
  description: string;
  discountPercentage: string;
  startDate: string;
  endDate: string;
  productIds: string[]; // <-- esto es clave
  type: string;
  isActive: boolean;
  discountAmount?: number;
  discountPercentageSecond?: number;
  buyQuantity?: number;
  getQuantity?: number;
};

const [promotionData, setPromotionData] = useState<PromotionFormData>({
  _id: '',
  title: '',
  description: '',
  discountPercentage: '',
  startDate: '',
  endDate: '',
  productIds: [],
  type: 'PERCENTAGE',
  isActive: true,
});
  const [quantity, setQuantity] = useState(0);  
  const [productPrice, setProductPrice] = useState(0);  
  const [calculatedDiscount, setCalculatedDiscount] = useState(null); 
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedPromotionType, setSelectedPromotionType] = useState<string>('');

  // Verificar si el usuario tiene rol ADMIN
  useEffect(() => {
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) return;

    try {
      const decodedToken = jwt_decode(token) as { role: string };
      if (decodedToken.role === 'ADMIN') {
        setIsAdmin(true); 
      }
    } catch (err) {
      console.error('Error al verificar el rol', err);
    }
  }, []);


  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await axios.get('https://api.farmaciamarquezcity.com/promotions');
        setPromotions(response.data);
      } catch (error) {
        setError('Error al cargar las promociones');
        console.error(error);
      }
    };

    fetchPromotions();
  }, []);

 
  const handleEditPromotion = (promotionId: string) => {
    const promotion = promotions.find(p => p._id === promotionId);
    if (promotion) {
      setPromotionData({
        _id: promotion._id,
        title: promotion.title,
        description: promotion.description,
        discountPercentage: promotion.discountPercentage?.toString() || '',
        startDate: promotion.startDate.split('T')[0],
        endDate: promotion.endDate.split('T')[0],
       
        productIds: Array.isArray(promotion.productIds)
  ? promotion.productIds
  : promotion.productIds?.split(',') || [],
        type: promotion.type,
        isActive: promotion.isActive,
      });
    }
  };
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('https://api.farmaciamarquezcity.com/products');
        setProducts(response.data);
      } catch (error) {
        setError('Error al cargar los productos');
        console.error(error);
      }
    };

    fetchProducts();
  }, []);
  

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) {
      alert('No estás autenticado');
      return;
    }
  
    // Crear un objeto limpio según el tipo
    const preparedPromotion: any = {
      title: promotionData.title,
      description: promotionData.description,
      startDate: promotionData.startDate,
      endDate: promotionData.endDate,
      productIds: promotionData.productIds,
      type: promotionData.type,
      isActive: promotionData.isActive,
    };
  
    // Agregar solo el campo correcto según el tipo
    switch (promotionData.type) {
      case 'PERCENTAGE':
        preparedPromotion.discountPercentage = Number(promotionData.discountPercentage) || 0;
        break;
      case 'FIXED':
        preparedPromotion.discountAmount = Number(promotionData.discountAmount) || 0;
        break;
      case 'PERCENT_SECOND':
        preparedPromotion.discountPercentage = Number(promotionData.discountPercentageSecond) || 0;
        break;
      case 'NXN':
        preparedPromotion.buyQuantity = Number(promotionData.buyQuantity) || 0;
        preparedPromotion.getQuantity = Number(promotionData.getQuantity) || 0;
        break;
    }
  
    try {
      const response = await axios.post(
        'https://api.farmaciamarquezcity.com/promotions',
        preparedPromotion,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.status === 201) {
        alert('Promoción creada con éxito');
        setPromotions([...promotions, response.data]);
        
        setTimeout(() => {
    fetchAllPromoProducts();
  }, 500);

        setPromotionData({
          _id: '',
          title: '',
          description: '',
          discountPercentage: '',
          startDate: '',
          endDate: '',
          productIds: [],
          type: 'PERCENTAGE',
          isActive: true,
        });
      } else {
        alert('Hubo un problema al crear la promoción');
      }
    } catch (error) {
      console.error(error);
      alert('Error al crear la promoción');
    }
  };

  const handleUpdatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) {
      alert('No estás autenticado');
      return;
    }
  
    const updatedPromotionData = {
      ...promotionData,
   productIds: promotionData.productIds,
    };
  
    try {
      const response = await axios.patch(
        `https://api.farmaciamarquezcity.com/promotions/${promotionData._id}`,
        updatedPromotionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.status === 200) {
        alert('Promoción actualizada con éxito');
        setPromotions(
          promotions.map((promotion) =>
            promotion._id === promotionData._id ? response.data : promotion
          )
        );
        setPromotionData({
          _id: '',
          title: '',
          description: '',
          discountPercentage: '',
          startDate: '',
          endDate: '',
          productIds: [], 
          isActive: true,
          type: 'PERCENTAGE',
        });
      } else {
        alert('Hubo un problema al actualizar la promoción');
      }
    } catch (error) {
      console.error(error);
      alert('Error al actualizar la promoción');
    }
  };


  const handlePromotionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setPromotionData((prevState) => ({
      ...prevState,
      type: value,
      buyQuantity: value === 'NXN' ? 2 : prevState.buyQuantity, 
      getQuantity: value === 'NXN' ? 1 : prevState.getQuantity,
      discountPercentageSecond: value === 'PERCENT_SECOND' ? 50 : prevState.discountPercentageSecond,
      discountAmount: value === 'FIXED' ? 100 : prevState.discountAmount
    }));
  };


  const handleDeletePromotion = async (promotionId: string) => {
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) {
      alert('No estás autenticado');
      return;
    }

    try {
      const response = await axios.delete(`https://api.farmaciamarquezcity.com/promotions/${promotionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        alert('Promoción eliminada con éxito');
      
        setPromotions(promotions.filter(promotion => promotion._id !== promotionId));
      } else {
        alert('Hubo un problema al eliminar la promoción');
      }
    } catch (error) {
      console.error(error);
      alert('Error al eliminar la promoción');
    }
  };

const [productosPorPromocion, setProductosPorPromocion] = useState<{ [promotionId: string]: any[] }>({});

const fetchAllPromoProducts = async () => {
  try {
    const res = await axios.get('https://api.farmaciamarquezcity.com/products?promotionType=ALL');
    const productosConPromos = res.data;

    const agrupados: { [promotionId: string]: any[] } = {};
    productosConPromos.forEach((producto: any) => {
      const pid = producto.appliedPromotion;
      if (!agrupados[pid]) agrupados[pid] = [];
      agrupados[pid].push(producto);
    });

    setProductosPorPromocion(agrupados);
  } catch (err) {
    console.error('Error al traer productos con promociones', err);
  }
};

useEffect(() => {
  if (promotions.length > 0) {
    fetchAllPromoProducts();
  }
}, [promotions]);
  

const handleSelectPromotion = (promotionId: string) => {
  const promotion = promotions.find(p => p._id === promotionId);
  if (promotion) {
    setPromotionData({ ...promotionData, _id: promotionId });
  }
};

const { fetchCartCount } = useCart();
const handleAddToCart = async (product: any) => {
  const token = localStorage.getItem('USER_TOKEN');
  if (!token) {
  setShowLoginModal(true);
  return;
}

  try {
    const quantity = 1;
    const response = await axios.post(
      'https://api.farmaciamarquezcity.com/cart/add',
      {
        productId: product._id,
        quantity: quantity,
        finalPrice: product.discountedPrice ?? product.price,
        applyDiscount: true
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 201) {
      await fetchCartCount();
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
      alert('No se pudo agregar el producto al carrito');
    }
  } catch (error) {
    console.error(error);
    alert('Error al agregar al carrito');
  }
};

const filteredPromotions = selectedPromotionType
  ? promotions.filter(promo => promo.type === selectedPromotionType)
  : promotions;
  
  return (
     <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onSearch={() => {}} />
          <main style={{ flex: 1, paddingTop: '120px' }}>
      
      {error && <p>{error}</p>}
      <div className="promo-section">
        <div className="form-group">
  <label>Filtrar por tipo de promoción</label>
  <select
    value={selectedPromotionType}
    onChange={(e) => setSelectedPromotionType(e.target.value)}
  >
    <option value="">Todas</option>
    <option value="PERCENTAGE">Porcentaje</option>
    <option value="FIXED">Monto Fijo</option>
    <option value="BUNDLE">Oferta por Paquete</option>
    <option value="NXN">2x1</option>
    <option value="PERCENT_SECOND">2da unidad con descuento</option>
    
  </select>
</div>
    {filteredPromotions.map((promotion) => (
    <div key={promotion._id} className="promo-box">
      <div className="promo-header">
        <div>
          <h2 className="promo-name">{promotion.title}</h2>
          <p className="promo-subtitle">{promotion.description}</p>
        </div>
        {promotion.discountPercentage && (
          <span className="promo-tag">-{promotion.discountPercentage}% OFF</span>
        )}
      </div>

      <div className="promo-products-grid">
        {productosPorPromocion[promotion._id]?.map((prod) => (
          <div key={prod._id} className="promo-product-card">
            <img
              src={prod.imageUrl || '/placeholder.png'}
              alt={prod.name}
              className="promo-img"
              data-product-id={prod._id}
            />
            <p className="promo-prod-name">{prod.name}</p>
            <p className="promo-price">
              <span className="price-old">${prod.price}</span>
              <span className="price-new">${prod.discountedPrice}</span>
            </p>
            <button className="btn-buy" onClick={() => handleAddToCart(prod)}>
              Agregar al carrito
            </button>
          </div>
          
        ))}
      </div>

      <p className="promo-date">
        Válida del {new Date(promotion.startDate).toLocaleDateString('es-AR')} al {new Date(promotion.endDate).toLocaleDateString('es-AR')}
      </p>

      {isAdmin && (
        <div className="promo-admin-btns">
          <button className="btn-edit" onClick={() => handleEditPromotion(promotion._id)}>Editar</button>
          <button className="btn-delete" onClick={() => handleDeletePromotion(promotion._id)}>Eliminar</button>
        </div>
      )}
      
    </div>
    
  ))}

  </div>


     
    {isAdmin && (
  <div className="create-promotion-form">
    <h2>{promotionData._id ? 'Actualizar promoción' : 'Crear nueva promoción'}</h2>
    <form onSubmit={promotionData._id ? handleUpdatePromotion : handleCreatePromotion}>
      <div className="form-group">
        <label>Título</label>
        <input type="text" value={promotionData.title} onChange={(e) => setPromotionData({ ...promotionData, title: e.target.value })} required />
      </div>
      <div className="form-group">
        <label>Descripción</label>
        <input type="text" value={promotionData.description} onChange={(e) => setPromotionData({ ...promotionData, description: e.target.value })} />
      </div>
      <div className="form-group">
        <label>Fecha de inicio</label>
        <input type="date" value={promotionData.startDate} onChange={(e) => setPromotionData({ ...promotionData, startDate: e.target.value })} required />
      </div>
      <div className="form-group">
        <label>Fecha de fin</label>
        <input type="date" value={promotionData.endDate} onChange={(e) => setPromotionData({ ...promotionData, endDate: e.target.value })} required />
      </div>
      <div className="form-group">
        <label>Tipo de promoción</label>
        <select value={promotionData.type} onChange={handlePromotionTypeChange}>
          <option value="PERCENTAGE">Porcentaje</option>
          <option value="FIXED">Monto Fijo</option>
          <option value="BUNDLE">Oferta por Paquete</option>
          <option value="NXN">2x1</option>
          <option value="PERCENT_SECOND">2da unidad con descuento</option>
        </select>
      </div>

      {promotionData.type === 'PERCENTAGE' && (
        <div className="form-group">
          <label>Descuento (%)</label>
          <input type="number" value={promotionData.discountPercentage} onChange={(e) => setPromotionData({ ...promotionData, discountPercentage: e.target.value })} />
        </div>
      )}

      {promotionData.type === 'FIXED' && (
        <div className="form-group">
          <label>Descuento fijo ($)</label>
          <input type="number" value={promotionData.discountAmount} onChange={(e) => setPromotionData({ ...promotionData, discountAmount: Number(e.target.value) })} />
        </div>
      )}

      {promotionData.type === 'NXN' && (
        <>
          <div className="form-group">
            <label>Cantidad a comprar</label>
            <input type="number" value={promotionData.buyQuantity} onChange={(e) => setPromotionData({ ...promotionData, buyQuantity: Number(e.target.value) })} />
          </div>
          <div className="form-group">
            <label>Cantidad a recibir</label>
            <input type="number" value={promotionData.getQuantity} onChange={(e) => setPromotionData({ ...promotionData, getQuantity: Number(e.target.value) })} />
          </div>
        </>
      )}

      {promotionData.type === 'PERCENT_SECOND' && (
        <div className="form-group">
          <label>Descuento 2da unidad (%)</label>
          <input type="number" value={promotionData.discountPercentageSecond} onChange={(e) => setPromotionData({ ...promotionData, discountPercentageSecond: Number(e.target.value) })} />
        </div>
      )}

      <div className="form-group">
        <label>Productos incluidos</label>
        <select
          multiple
          value={promotionData.productIds}
          onChange={(e) =>
            setPromotionData({
              ...promotionData,
              productIds: Array.from(e.target.selectedOptions, (option) => option.value),
            })
          }
        >
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name} - ${product.price}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn btn-buy">
        {promotionData._id ? 'Actualizar promoción' : 'Crear promoción'}
      </button>
    </form>
  </div>
)}

      
     
</main>
{showLoginModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Iniciar sesión requerido</h3>
      <p>Debes iniciar sesión o registrarte para agregar productos al carrito.</p>
      <div className="modal-buttons">
        <a href="/login" className="btn btn-buy">Iniciar sesión</a>
        <a href="/register" className="btn btn-buy">Registrarme</a>
        <button onClick={() => setShowLoginModal(false)} className="btn btn-delete">Cancelar</button>
      </div>
    </div>
  </div>
)}
      <Footer />
    </div>
  );
};


export default PromotionsPage;
