import { FC, useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '@/components/Footer';

const Marcas: FC = () => {
  const [categories, setCategories] = useState<any[]>([]); 
  const [brands, setBrands] = useState<any[]>([]); 
  const [products, setProducts] = useState<any[]>([]); 
  const [selectedCategory, setSelectedCategory] = useState<string>(''); 
  const [selectedBrand, setSelectedBrand] = useState<string>(''); 
  const [priceFrom, setPriceFrom] = useState<number>(0); 
  const [priceTo, setPriceTo] = useState<number>(999999); 
  const [error, setError] = useState(''); 

  
  useEffect(() => {
    const fetchCategoriesAndProductsAndBrands = async () => {
      try {
        const categoryResponse = await axios.get('http://localhost:3000/categories');
        const productResponse = await axios.get('http://localhost:3000/products');
        const brandResponse = await axios.get('http://localhost:3000/brands');
        
        setCategories(categoryResponse.data);
        setProducts(productResponse.data);
        setBrands(brandResponse.data);
      } catch (error) {
        setError('Error al cargar las categorías, productos o marcas');
      }
    };

    fetchCategoriesAndProductsAndBrands();
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSelectedBrand('');
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBrand(e.target.value);
  };

  const handlePriceChange = () => {
    const from = parseFloat((document.getElementById('priceFrom') as HTMLInputElement).value) || 0;
    const to = parseFloat((document.getElementById('priceTo') as HTMLInputElement).value) || 999999;
    setPriceFrom(from);
    setPriceTo(to);
  };

  
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
    const matchesBrand = selectedBrand ? product.brandId === selectedBrand : true;
    const matchesPrice =
      product.price >= priceFrom && product.price <= priceTo; 

    return matchesCategory && matchesBrand && matchesPrice;
  });

  const filteredBrands = brands.filter((brand) => {
    return true; 
  });

  return (
    <div>
      <Header />
      <div className="categories-page">
        
        <aside className="sidebar">
          <h2>Categorías</h2>
          <select className="filter-select" onChange={handleCategoryChange}>
            <option>Categorías</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <h3>Marca</h3>
          <select className="filter-select" onChange={handleBrandChange} value={selectedBrand}>
            <option>Marca</option>
            {filteredBrands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </select>

          <h3>Filtrar por</h3>
          <h4>Precio</h4>
          <div className="price-filter">
            <input 
              id="priceFrom" 
              type="number" 
              placeholder="Desde" 
              defaultValue={900} 
              onChange={handlePriceChange} 
            />
            <input 
              id="priceTo" 
              type="number" 
              placeholder="Hasta" 
              defaultValue={66670} 
              onChange={handlePriceChange} 
            />
            <button className="apply-button" onClick={handlePriceChange}>Aplicar</button>
          </div>
        </aside>

        <main className="product-grid">
          <div className="grid-header">
            <h1>Marcas</h1>
            <div className="sort-options">
              <span>↑↓ Ordenar</span>
            </div>
          </div>

          <div className="products">
            {filteredProducts.map((product) => (
              <div key={product._id} className="product-card">
                {product.discount && (
                  <span className="discount-badge">{product.discount}% OFF</span>
                )}
                <img src={product.imageUrl} alt={product.name} className="product-image" />
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">${product.price.toLocaleString('es-AR')}</p>
                {product.installment && (
                  <p className="installment">
                    3 x ${product.installment.price.toLocaleString('es-AR')} sin interés
                  </p>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Marcas;
