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
          <button onClick={handleFilter} className="apply-button">
            Aplicar
          </button>

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

        {/* Lista de categorías */}
        <div className="product-grid">
          <h2 className="grid-header">Categorías</h2>
          {error && <p className="error-message">{error}</p>}
          <div className="category-list">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div key={category._id} className="product-card">
                  <h3 className="product-name">{category.name}</h3>
                  <ul className="category-list">
                    {category.subcategories.map((subcategory: any, index: number) => (
                      <li key={index} className="installment">
                        {subcategory.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="installment">No hay categorías disponibles.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Categories;