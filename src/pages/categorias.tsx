import { FC, useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import Header from '../components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

const Categories: FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]); 
  const [categoryData, setCategoryData] = useState({
    name: '',
    subcategories: [{ name: '' }],
  });
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const router = useRouter();

  // Verificar si el usuario tiene rol ADMIN
  useEffect(() => {
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) {
      return;
    }
    try {
      const decodedToken = jwt_decode(token) as { role: string };
      if (decodedToken.role === 'ADMIN') {
        setIsAdmin(true);
      }
    } catch (err) {
      console.error('Error al verificar el rol', err);
    }
  }, []);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:3000/categories');
        setCategories(response.data);
      } catch (error) {
        setError('Error al cargar las categorías');
      }
    };
    fetchCategories();
  }, []);

  // Cargar todos los productos al principio
useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/products'); // Obtiene todos los productos
      setProducts(response.data); // Establece los productos sin filtrar
    } catch (error) {
      setError('Error al cargar los productos');
    }
  };
  
  fetchProducts();
}, []); // Solo se ejecuta una vez cuando el componente se monta

// Filtrado de productos cuando cambian la categoría o subcategoría
useEffect(() => {
  const fetchFilteredProducts = async () => {
    if (!selectedCategory) return; // No filtrar si no hay categoría seleccionada

    // Crear la URL para la API según los filtros seleccionados
    const url = selectedSubcategory
    ? `http://localhost:3000/products?categoryId=${selectedCategory}&subcategoryId=${selectedSubcategory}`
    : `http://localhost:3000/products?categoryId=${selectedCategory}`;

    try {
      const response = await axios.get(url); // Llamada a la API con los filtros
      setProducts(response.data); // Establece los productos filtrados
    } catch (error) {
      setError('Error al cargar los productos filtrados');
    }
  };

  fetchFilteredProducts();
}, [selectedCategory, selectedSubcategory]); 


  // Manejar cambio de categoría seleccionada
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSelectedSubcategory('');
  };

  // Manejar cambio de subcategoría seleccionada
  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubcategory(e.target.value);
  };

  // Crear nueva categoría
  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('USER_TOKEN');
    try {
      const res = await axios.post(
        'http://localhost:3000/categories',
        categoryData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.status === 201) {
        alert('Categoría creada con éxito');
        setCategories([...categories, res.data]);
        setCategoryData({ name: '', subcategories: [{ name: '' }] });
      } else {
        alert('Hubo un problema al crear la categoría');
      }
    } catch (error) {
      console.error(error);
      alert('Error al crear la categoría');
    }
  };

  // Filtrar (puedes ajustar esta función para redirigir a una página de productos filtrados)
  const handleFilter = () => {
    if (selectedCategory && selectedSubcategory) {
      router.push(`/products?category=${selectedCategory}&subcategory=${selectedSubcategory}`);
    } else if (selectedCategory) {
      router.push(`/products?category=${selectedCategory}`);
    }
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
        {/* Sidebar con filtros */}
        <div className="sidebar">
          <h3 className="form-label">Categorías</h3>
          <div className="form-group">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="filter-select"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select
              value={selectedSubcategory}
              onChange={handleSubcategoryChange}
              className="filter-select"
              disabled={!selectedCategory}
            >
              <option value="">Selecciona una subcategoría</option>
              {selectedCategory &&
                categories
                  .find((category) => category._id === selectedCategory)
                  ?.subcategories.map((subcategory: any, index: number) => (
                    <option key={index} value={subcategory._id}>
                      {subcategory.name}
                    </option>
                  ))}
            </select>
          </div>
        

          {/* Formulario para crear categoría (visible solo para admins) */}
          {isAdmin && (
            <div className="form-group">
              <h3 className="form-label">
                {editingCategory ? 'Editar Categoría' : 'Crear Categoría'}
              </h3>
              <form onSubmit={handleSubmitCreate} className="form-group">
                <div className="form-group">
                  <label className="form-label">Nombre de la categoría:</label>
                  <input
                    type="text"
                    placeholder="Nombre de la categoría"
                    value={categoryData.name}
                    onChange={(e) =>
                      setCategoryData({ ...categoryData, name: e.target.value })
                    }
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre de la subcategoría:</label>
                  <input
                    type="text"
                    placeholder="Nombre de la subcategoría"
                    value={categoryData.subcategories[0].name}
                    onChange={(e) =>
                      setCategoryData({
                        ...categoryData,
                        subcategories: [{ name: e.target.value }],
                      })
                    }
                    className="form-input"
                    required
                  />
                </div>
                <button type="submit" className="submit-button">
                  {editingCategory ? 'Actualizar Categoría' : 'Crear Categoría'}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="product-grid">
          <h2 className="grid-header">Productos</h2>
          {error && <p className="error-message">{error}</p>}
          <div className="category-list">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product._id} className="product-card">
                <img
                  src={product.imageUrl || '/default-image.jpg'}
                  alt={product.name}
                  className="product-image"
                />
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                {product.discountedPrice !== undefined && product.discountedPrice < product.price ? (
  <p className="product-price">
    <span style={{ textDecoration: 'line-through', color: 'gray', marginRight: '8px' }}>
      ${product.price.toLocaleString('es-AR')}
    </span>
    <span style={{ fontWeight: 'bold', color: 'green' }}>
      ${product.discountedPrice.toLocaleString('es-AR')}
    </span>
  </p>
) : (
  <p className="product-price">
    ${product.price.toLocaleString('es-AR')}
  </p>
)}
                <p className="product-stock">Stock: {product.stock}</p>
                {product.discount && (
                  <div className="discount-tag">{product.discount}% OFF</div>
                )}
                <button className="btn btn-buy" onClick={() => handleAddToCart(product._id)}>Comprar</button>
              </div>
              
              ))
            ) : (
              <p>No hay productos disponibles en esta categoría.</p>
            )}
          </div>

          </div>
       
      
      </div>
      <Footer />
    </div>
  );
};

export default Categories;