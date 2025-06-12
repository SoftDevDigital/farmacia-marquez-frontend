import { useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

  const handleSelectPromotion = (promotionId: string) => {
    const promotion = promotions.find(p => p._id === promotionId);
    if (promotion) {
      setPromotionData({ ...promotionData, _id: promotionId });
      console.log("Promoción seleccionada:", promotionId); 
    }
  };
  
  return (
    <div>
      <Header onSearch={() => {}} />
      <h1>Promociones</h1>
      {error && <p>{error}</p>}
      <div>
  {promotions.length > 0 ? (
    promotions.map((promotion) => (
      <div key={promotion._id}>
        <h3>{promotion.title}</h3>
        <p>{promotion.description}</p>
        <p>{promotion.discountPercentage}% de descuento</p>
        <p>Válida del {promotion.startDate} al {promotion.endDate}</p>
        
        {isAdmin && (
          <div className="promotion-buttons">
          <>
            <button className="btn btn-buy" onClick={() => handleEditPromotion(promotion._id)}>Editar</button>
            <button className="btn btn-buy" onClick={() => handleDeletePromotion(promotion._id)}>Eliminar</button>
          </>
          </div>
        )}
        
        
        
      </div>
    ))
  ) : (
    <p>No se encontraron promociones.</p>
  )}
</div>

     
      {isAdmin && (
        <div>
          <h2>{promotionData._id ? 'Actualizar' : 'Crear'} promoción</h2>
          <form onSubmit={promotionData._id ? handleUpdatePromotion : handleCreatePromotion}>
            <div>
              <label>Título</label>
              <input
                type="text"
                value={promotionData.title}
                onChange={(e) =>
                  setPromotionData({ ...promotionData, title: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>Descripción</label>
              <input
                type="text"
                value={promotionData.description}
                onChange={(e) =>
                  setPromotionData({ ...promotionData, description: e.target.value })
                }
              />
            </div>
            {promotionData.type === 'NXN' && (
              <>
                <div>
                  <label>Cantidad a comprar</label>
                  <input
                    type="number"
                    value={promotionData.buyQuantity}
                    onChange={(e) =>
                      setPromotionData({
                        ...promotionData,
                        buyQuantity: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label>Cantidad a recibir</label>
                  <input
                    type="number"
                    value={promotionData.getQuantity}
                    onChange={(e) =>
                      setPromotionData({
                        ...promotionData,
                        getQuantity: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </>
            )}
            <div>

            </div>
            {promotionData.type === 'FIXED' && (
              <div>
                <label>Descuento fijo</label>
                <input
                  type="number"
                  value={promotionData.discountAmount}
                  onChange={(e) =>
                    setPromotionData({
                      ...promotionData,
                      discountAmount: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
            )}
            <div>
              <label>Fecha de inicio</label>
              <input
                type="date"
                value={promotionData.startDate}
                onChange={(e) =>
                  setPromotionData({ ...promotionData, startDate: e.target.value })
                }
                required
              />
            </div>
            {promotionData.type === 'PERCENTAGE' && (
  <div>
    <label>Descuento (%)</label>
    <input
  type="number"
  value={promotionData.discountPercentage}
  onChange={(e) =>
    setPromotionData({
      ...promotionData,
       discountPercentage: e.target.value,
    })
  }
  required
/>
  </div>
)}
            <div>
              <label>Fecha de fin</label>
              <input
                type="date"
                value={promotionData.endDate}
                onChange={(e) =>
                  setPromotionData({ ...promotionData, endDate: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>Tipo de promoción</label>
              
              <select
                value={promotionData.type}
                onChange={(e) =>
                  setPromotionData({ ...promotionData, type: e.target.value })
                  
                }
              >
                 <select
                value={promotionData.type}
                onChange={handlePromotionTypeChange}
              ></select>
                
                <option value="PERCENTAGE">Porcentaje</option>
                <option value="FIXED">Monto Fijo</option>
                <option value="BUNDLE">Oferta por Paquete</option>
                <option value="NXN">2x1</option>
                <option value="PERCENT_SECOND">Porcentaje Segundo Producto</option>
              </select>
            </div>
            {promotionData.type === 'PERCENT_SECOND' && (
              <div>
                <label>Descuento en la segunda unidad (%)</label>
                <input
                  type="number"
                  value={promotionData.discountPercentageSecond}
                  onChange={(e) =>
                    setPromotionData({
                      ...promotionData,
                      discountPercentageSecond: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
            )}
           <div>
  <label>Productos (ID)</label>
  <select
    value={promotionData.productIds}
    onChange={(e) =>
      setPromotionData({
        ...promotionData,
        productIds: Array.from(e.target.selectedOptions, (option) => option.value),
      })
    }
    multiple
    required
  >
    {products.map((product) => (
      <option key={product._id} value={product._id}>
        {product.name} - ${product.price}
      </option>
    ))}
  </select>
</div>
            <button className="btn btn-buy" type="submit">{promotionData._id ? 'Actualizar' : 'Crear'} Promoción</button>
          </form>
        </div>
      )}

      
     

      <Footer />
    </div>
  );
};


export default PromotionsPage;
