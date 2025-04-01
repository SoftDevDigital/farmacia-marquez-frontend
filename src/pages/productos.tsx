import { FC, useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '@/components/Footer';

const Products: FC = () => {
  const [categories, setCategories] = useState<any[]>([]); 
  const [brands, setBrands] = useState<any[]>([]); 
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>(''); 
  const [priceFrom, setPriceFrom] = useState<number>(0);
  const [priceTo, setPriceTo] = useState<number>(0);
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

  const handlePriceFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPriceFrom(Number(e.target.value));
  };

  const handlePriceToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPriceTo(Number(e.target.value));
  };

  
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
    const matchesBrand = selectedBrand ? product.brandId === selectedBrand : true;
    const matchesPrice =
      (priceFrom === 0 || product.price >= priceFrom) &&
      (priceTo === 0 || product.price <= priceTo);

    return matchesCategory && matchesBrand && matchesPrice;
  });

  const filteredBrands = brands.filter((brand) => true);

  const addToCart = async (productId: string, quantity: number) => {
    try {
      const token = localStorage.getItem('USER_TOKEN'); 
      if (!token) {
        console.error('No user token found');
        return;
      }
  
      const response = await axios.post(
        'http://localhost:3000/cart/add',
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log('Product added to cart:', response.data); 
    } catch (error: any) {
      console.error('Error adding product to cart:', error.response || error.message);
    }
  };

  return (
    <div>
      <Header />
      <div className="products-page">
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
              type="number"
              placeholder="Desde"
              value={priceFrom}
              onChange={handlePriceFromChange}
            />
            <input
              type="number"
              placeholder="Hasta"
              value={priceTo}
              onChange={handlePriceToChange}
            />
            <button className="apply-button">→</button>
          </div>
        </aside>

        <main className="product-grid">
          <div className="grid-header">
            <h1>Productos</h1>
            <div className="sort-options">
              <span>A-Z</span>
              <span>↑↓</span>
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
                    3 cuotas sin interés de ${product.installment.price.toLocaleString('es-AR')}
                  </p>
                )}
                <button
                  className="add-to-cart-button"
                  onClick={() => addToCart(product._id, 1)} 
                >
                  Comprar
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Products;
