import { FC, useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';  // Para verificar el rol
import Header from '../components/Header';
import Footer from '@/components/Footer';

const Categories: FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState({
    name: '',
    subcategories: [{ name: '' }]
  });
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar si el usuario tiene rol ADMIN
  useEffect(() => {
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) {
      return;
    }
    try {
      const decodedToken = jwt_decode(token) as { role: string };
      if (decodedToken.role === 'ADMIN') {
        setIsAdmin(true); // Si el rol es ADMIN, habilitar la creación y eliminación
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

  // Eliminar categoría
  const handleDelete = async (categoryId: string) => {
    const token = localStorage.getItem('USER_TOKEN');
    try {
      const res = await axios.delete(`http://localhost:3000/categories/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        alert('Categoría eliminada con éxito');
        setCategories(categories.filter((category) => category._id !== categoryId));
      } else {
        alert('Hubo un problema al eliminar la categoría');
      }
    } catch (error) {
      console.error(error);
      alert('Error al eliminar la categoría');
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value } = e.target;
    const updatedSubcategories = [...categoryData.subcategories];
    updatedSubcategories[index] = { ...updatedSubcategories[index], [name]: value };
    setCategoryData({ ...categoryData, subcategories: updatedSubcategories });
  };

  // Agregar nueva subcategoría
  const handleAddSubcategory = () => {
    setCategoryData({
      ...categoryData,
      subcategories: [...categoryData.subcategories, { name: '' }],
    });
  };

  // Crear nueva categoría
  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div>
      <Header />
      <div className="categories-page">
        <h2>Categorías</h2>
        {error && <p>{error}</p>}

        {isAdmin && (
          <div className="create-category-form">
            <h3>Crear Categoría</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                value={categoryData.name}
                onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                placeholder="Nombre de la categoría"
                required
              />
              <h4>Subcategorías</h4>
              {categoryData.subcategories.map((subcategory, index) => (
                <div key={index}>
                  <input
                    type="text"
                    name="name"
                    value={subcategory.name}
                    onChange={(e) => handleChange(e, index)}
                    placeholder="Nombre de la subcategoría"
                  />
                </div>
              ))}
              <button type="button" onClick={handleAddSubcategory}>Agregar Subcategoría</button>
              <button type="submit">Crear Categoría</button>
            </form>
          </div>
        )}

        <div className="category-list">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category._id} className="category-card">
                <h3>{category.name}</h3>
                <ul>
                  {category.subcategories.map((subcategory: any, index: number) => (
                    <li key={index}>{subcategory.name}</li>
                  ))}
                </ul>

                {isAdmin && (
                  <button onClick={() => handleDelete(category._id)}>Eliminar Categoría</button>
                )}
              </div>
            ))
          ) : (
            <p>No hay categorías disponibles.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Categories;
