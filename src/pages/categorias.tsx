import { FC, useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '@/components/Footer';

const Categories: FC = () => {
  const [categories, setCategories] = useState<any[]>([]); 
  const [selectedCategory, setSelectedCategory] = useState<string>(''); 
  const [selectedBrand, setSelectedBrand] = useState<string>(''); 
  const [error, setError] = useState('');

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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value); 
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBrand(e.target.value); 
  };

  return (
    <div>
      <Header />
      <div className="categories-page">
        <aside className="sidebar">
          <h2>Categorías</h2>
          <select className="filter-select" onChange={handleCategoryChange} value={selectedCategory}>
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <h3>Marca</h3>
          <select className="filter-select" onChange={handleBrandChange} value={selectedBrand}>
            <option value="">Selecciona una marca</option>
            {categories
              .filter((category) => selectedCategory === '' || category.name === selectedCategory) // Filtra las categorías si se seleccionó alguna
              .map((category) => 
                category.marcas && category.marcas.map((brand: any) => (
                  <option key={brand._id} value={brand.name}>
                    {brand.name}
                  </option>
                ))
              )}
          </select>

          <h3>Precio</h3>
          <div className="price-filter">
            <input type="number" placeholder="Desde" />
            <input type="number" placeholder="Hasta" />
            <button className="apply-button">Aplicar</button>
          </div>
        </aside>

        <main className="product-grid">
          <div className="grid-header">
            <h1>Categorías</h1>
            <div className="sort-options">
              <span>↑↓ Ordenar</span>
            </div>
          </div>

          <div className="products">
            {categories
              .filter((category) => {
            
                if (selectedCategory === '' || selectedCategory === category.name) {
                  return true;
                }
                return false;
              })
              .map((category) => (
                <div key={category._id} className="product-card">
                  <h3 className="product-name">{category.name}</h3>
                  <p>Marcas:</p>
                  <ul>
                    {category.marcas && category.marcas
                      .filter((brand: any) => selectedBrand === '' || brand.name === selectedBrand) 
                      .map((brand: any, index: number) => (
                        <li key={index}>{brand.name}</li>
                      ))}
                  </ul>
                  <p>Subcategorías:</p>
                  <ul>
                    {category.subcategories.map((subcategory: any, index: number) => (
                      <li key={index}>{subcategory.name}</li> 
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Categories;
