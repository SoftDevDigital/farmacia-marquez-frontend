import { FC, useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import Header from '../components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';



const Categories: FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]); 
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [categoryData, setCategoryData] = useState<{
  name: string;
  subcategories: { _id?: string; name: string }[];
}>({
  name: '',
  subcategories: [{ name: '' }],
});
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const router = useRouter();
  const { fetchCartCount } = useCart();
const [priceFrom, setPriceFrom] = useState<string>('');
  
  useEffect(() => {
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) return;
    try {
      const decodedToken = jwt_decode(token) as { role: string };
      if (decodedToken.role === 'ADMIN') setIsAdmin(true);
    } catch (err) {
      console.error('Error al verificar el rol', err);
    }
  }, []);

  useEffect(() => {
    axios.get('https://api.farmaciamarquezcity.com/categories')
      .then(res => setCategories(res.data))
      .catch(() => setError('Error al cargar las categorías'));
  }, []);


 useEffect(() => {
  const fetchProducts = async () => {
    try {
      let url = 'https://api.farmaciamarquezcity.com/products';

      // Si hay categoría seleccionada, agregamos el filtro
      if (selectedCategory) {
        url += `?categoryId=${selectedCategory}`;

        if (selectedSubcategory) {
          url += `&subcategoryId=${selectedSubcategory}`;
        }
      }

      const res = await axios.get(url);
      const filtered = priceFrom !== ''
        ? res.data.filter((p: any) => p.price >= parseInt(priceFrom))
        : res.data;

      setProducts(filtered);
    } catch (err) {
      setError('Error al cargar los productos');
    }
  };

  fetchProducts();
}, [selectedCategory, selectedSubcategory, priceFrom]);
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSelectedSubcategory('');
  };

  const handleFilterSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubcategory(e.target.value);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) return alert('No estás autenticado');
    if (!categoryData.name || categoryData.subcategories.some(sub => !sub.name)) {
      return alert('Completá todos los campos');
    }
    try {
      const res = await axios.post('https://api.farmaciamarquezcity.com/categories', categoryData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.status === 201) {
        alert('Categoría creada con éxito');
        setCategories([...categories, res.data]);
        setCategoryData({ name: '', subcategories: [{ name: '' }] });
      }
    } catch (err) {
      console.error(err);
      alert('Error al crear la categoría');
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('USER_TOKEN');
    if (!token || !editingCategory) return alert('No estás autenticado o sin categoría seleccionada');
    try {
      const payload = {
        name: categoryData.name,
        subcategories: categoryData.subcategories.map(sub => sub._id ? { _id: sub._id, name: sub.name } : { name: sub.name })
      };
      const res = await axios.patch(`https://api.farmaciamarquezcity.com/categories/${editingCategory}`, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.status === 200) {
        alert('Categoría actualizada con éxito');
        setCategories(categories.map(cat => cat._id === editingCategory ? res.data : cat));
        setCategoryData({ name: '', subcategories: [{ name: '' }] });
        setEditingCategory(null);
      }
    } catch (err) {
      console.error(err);
      alert('Error al actualizar la categoría');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) return alert('No estás autenticado');
  
    try {
      const res = await axios.delete(`https://api.farmaciamarquezcity.com/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        validateStatus: (status) => status < 500 // Evita que axios lance automáticamente un error por código 4xx
      });
  
      if (res.status === 204 || res.status === 200) {
        setCategories(categories.filter(c => c._id !== id));
        alert('Categoría eliminada con éxito');
      } else {
        alert('Hubo un problema al eliminar la categoría');
      }
    } catch (err) {
      console.error('Error inesperado al eliminar la categoría:', err);
      alert('Error inesperado al eliminar la categoría');
    }
  };
  

  const handleAddSubcategory = () => setCategoryData(prev => ({ ...prev, subcategories: [...prev.subcategories, { name: '' }] }));
  const handleRemoveSubcategory = (i: number) => setCategoryData(prev => ({ ...prev, subcategories: prev.subcategories.filter((_, idx) => idx !== i) }));
  const handleSubcategoryChange = (i: number, value: string) => {
    const updated = [...categoryData.subcategories];
    updated[i].name = value;
    setCategoryData({ ...categoryData, subcategories: updated });
  };

  const handleAddToCart = async (productId: string) => {
  const token = localStorage.getItem('USER_TOKEN');
  if (!token) {
  setShowLoginModal(true); 
  return;
}

  try {
    const response = await axios.post(
      'https://api.farmaciamarquezcity.com/cart/add',
      {
        productId,
        quantity: 1,
        applyDiscount: false,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 201) {
      await fetchCartCount(); // ✅ ACTUALIZA el contador del carrito
      
      // 🔄 Animación de producto al carrito
      const productImage = document.querySelector(`img[data-product-id="${productId}"]`);
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
      alert('Hubo un problema al agregar el producto');
    }
  } catch (error) {
    console.error(error);
    alert('Error al agregar el producto al carrito');
  }
};

  
  return (
    <div>
      <Header onSearch={() => {}} />
       
           <div className="categories-page">

  <aside className="sidebar">
    <h3>Categorías</h3>
    <select value={selectedCategory} onChange={handleCategoryChange} className="filter-select select-categoria">
      <option value="">Selecciona una categoría</option>
      {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
    </select>

    {selectedCategory && (
      <>
        <h3>Subcategorías</h3>
        <select
          value={selectedSubcategory}
          onChange={handleFilterSubcategoryChange}
          className="filter-select"
        >
          <option value="">Selecciona una subcategoría</option>
          {categories.find(c => c._id === selectedCategory)?.subcategories.map((sub: any) => (
            <option key={sub._id} value={sub._id}>{sub.name}</option>
          ))}
        </select>
      </>
    )}

    <h3>Filtrar por</h3>
    <h4>Precio</h4>
    <div className="price-filter">
      <label>Desde</label>
      <input
        type="number"
        placeholder="Precio desde"
        value={priceFrom}
        onChange={(e) => {
          const value = e.target.value;
          if (/^\d*$/.test(value)) setPriceFrom(value);
        }}
      />
    </div>
  </aside>

  <main className="product-grid" >
    <h1></h1>
    {error && <p className="error-message">{error}</p>}
    <div className="products">
      {products.map((prod) => (
  <div key={prod._id} className="product-card">
    <Link href={`/products/${prod._id}`} passHref legacyBehavior>
      <a style={{ textDecoration: 'none', color: 'inherit' }}>
        <img
          src={prod.imageUrl || '/default-image.jpg'}
          alt={prod.name}
          data-product-id={prod._id}
          className="product-image"
        />
        <h3 className="product-name">{prod.name}</h3>
        <p className="product-description">{prod.description}</p>
        {prod.discountedPrice !== undefined && prod.discountedPrice < prod.price ? (
          <p className="product-price">
            <span style={{ textDecoration: 'line-through', color: 'gray', marginRight: '8px' }}>
              ${prod.price.toLocaleString('es-AR')}
            </span>
            <span style={{ fontWeight: 'bold', color: 'green' }}>
              ${prod.discountedPrice.toLocaleString('es-AR')}
            </span>
          </p>
        ) : (
          <p className="product-price">${prod.price.toLocaleString('es-AR')}</p>
        )}
        <p className="product-stock">Stock: {prod.stock}</p>
      </a>
    </Link>
    <button className="btn btn-buy" onClick={() => handleAddToCart(prod._id)}>
      Agregar producto al carrito
    </button>
  </div>
))}

    </div>
  </main>

</div>

      {isAdmin && (
        <div className="create-brand-form">
          <h3>{editingCategory ? 'Editar Categoría' : 'Crear Categoría'}</h3>
          <form onSubmit={editingCategory ? handleUpdateCategory : handleSubmitCreate} className="brand-form">
            <input type="text" placeholder="Nombre de la categoría" value={categoryData.name} onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })} required />
            {categoryData.subcategories.map((sub, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="text" placeholder={`Subcategoría ${index + 1}`} value={sub.name} onChange={(e) => handleSubcategoryChange(index, e.target.value)} required />
                {categoryData.subcategories.length > 1 && (
                  <button type="button" onClick={() => handleRemoveSubcategory(index)} className="btn btn-delete">X</button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddSubcategory} className="btn btn-edit">+ Subcategoría</button>
            <button type="submit" className="btn btn-buy">{editingCategory ? 'Actualizar Categoría' : 'Crear Categoría'}</button>
          </form>
        </div>
      )}

      {isAdmin && (
  <div className="brand-list">
    {categories.map((cat) => (
      <div key={cat._id} className="brand-card">
        <h3>{cat.name}</h3>
        <div className="brand-buttons">
          <button className="btn btn-edit" onClick={() => {
            setCategoryData({ name: cat.name, subcategories: cat.subcategories.map((sub: any) => ({ ...sub })) });
            setEditingCategory(cat._id);
          }}>Editar Categoría</button>
          <button className="btn btn-delete" onClick={() => handleDeleteCategory(cat._id)}>Eliminar Categoría</button>
        </div>
      </div>
      
    ))}
  </div>
)}

{showLoginModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Iniciar sesión requerido</h2>
      <p>Debes iniciar sesión o registrarte para agregar productos al carrito.</p>
      <div className="modal-buttons">
        <button className="btn btn-buy" onClick={() => router.push('/login')}>Iniciar sesión</button>
        <button className="btn btn-buy" onClick={() => router.push('/register')}>Registrarme</button>
        <button className="btn btn-buy" onClick={() => setShowLoginModal(false)}>Cancelar</button>
      </div>
    </div>
  </div>
)}
     
      <Footer />
    </div>
    
  );
};

export default Categories;
