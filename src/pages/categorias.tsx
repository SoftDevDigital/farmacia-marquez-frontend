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
  const [categoryData, setCategoryData] = useState({ name: '', subcategories: [{ name: '' }] });
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
    axios.get('http://localhost:3000/categories')
      .then(res => setCategories(res.data))
      .catch(() => setError('Error al cargar las categorías'));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3000/products')
      .then(res => setProducts(res.data))
      .catch(() => setError('Error al cargar los productos'));
  }, []);

  useEffect(() => {
  if (!selectedCategory) return;

  const url = selectedSubcategory
    ? `http://localhost:3000/products?categoryId=${selectedCategory}&subcategoryId=${selectedSubcategory}`
    : `http://localhost:3000/products?categoryId=${selectedCategory}`;

  axios.get(url)
    .then(res => {
      const filtered = res.data.filter((p: any) =>
        priceFrom !== '' ? p.price >= parseInt(priceFrom) : true
      );
      setProducts(filtered);
    })
    .catch(() => setError('Error al cargar los productos filtrados'));
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
      const res = await axios.post('http://localhost:3000/categories', categoryData, {
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
      const res = await axios.patch(`http://localhost:3000/categories/${editingCategory}`, payload, {
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
      const res = await axios.delete(`http://localhost:3000/categories/${id}`, {
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
      alert('No estás autenticado');
      return;
    }
  
    try {
      const response = await axios.post(
        'http://localhost:3000/cart/add',
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
        alert('Producto agregado al carrito');
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
      <Header />
      <div className="categories-page">
        <div className="sidebar">
          <h3>Categorías</h3>
          <select value={selectedCategory} onChange={handleCategoryChange} className="filter-select select-categoria">
            <option value="">Selecciona una categoría</option>
            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
          </select>
          <select value={selectedSubcategory} onChange={handleFilterSubcategoryChange} className="filter-select" disabled={!selectedCategory}>
            <option value="">Selecciona una subcategoría</option>
            {selectedCategory && categories.find(c => c._id === selectedCategory)?.subcategories.map((sub: any) => (
              <option key={sub._id} value={sub._id}>{sub.name}</option>
            ))}
          </select>
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
        </div>

        <div className="product-grid">
  <h2>Productos</h2>
  {error && <p className="error-message">{error}</p>}
  <div className="category-list">
    {products.map((prod) => (
      <div key={prod._id} className="product-card">
        <Link href={`/products/${prod._id}`} passHref legacyBehavior>
          <a style={{ textDecoration: 'none', color: 'inherit' }}>
            <img src={prod.imageUrl || '/default-image.jpg'} alt={prod.name} className="product-image" />
            <h3>{prod.name}</h3>
            <p>
              {prod.description.length > 40
                ? prod.description.slice(0, 40) + '...'
                : prod.description}
            </p>
            <p className="product-price">
              {prod.discountedPrice !== undefined && prod.discountedPrice < prod.price ? (
                <>
                  <span style={{ textDecoration: 'line-through', color: 'gray' }}>${prod.price.toLocaleString('es-AR')}</span>
                  <span style={{ fontWeight: 'bold', color: 'green' }}> ${prod.discountedPrice.toLocaleString('es-AR')}</span>
                </>
              ) : `$${prod.price.toLocaleString('es-AR')}`}
            </p>
            <p>Stock: {prod.stock}</p>
          </a>
        </Link>
        <button className="btn btn-buy" onClick={() => handleAddToCart(prod._id)}>Comprar</button>
      </div>
    ))}
  </div>
</div>

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
     
      <Footer />
    </div>
  );
};

export default Categories;
