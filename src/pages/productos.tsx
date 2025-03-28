import { FC } from 'react';
import Header from '../components/Header'; 
import Footer from '@/components/Footer';


const Products: FC = () => {
 
  const products = [
    {
      id: 1,
      name: '102 Mujer x 30 cap blandas',
      price: 18148,
      installment: { price: 6049.33, count: 3 },
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 2,
      name: '102 Plus x 30 comp',
      price: 15092,
      installment: { price: 5030.67, count: 3 },
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 3,
      name: 'Above Protect Repelente Aerosol x 150 ml',
      price: 24000,
      discount: 15,
      installment: { price: 6800, count: 3 },
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 4,
      name: 'Above Protect Repelente x 200 ml',
      price: 24000,
      discount: 15,
      installment: { price: 6800, count: 3 },
      image: 'https://via.placeholder.com/150',
    },
  ];

  return (
    <div>
      <Header />
      <div className="products-page">
     
        <aside className="sidebar">
          <h2>Categorías</h2>
          <ul className="category-list">
            <li>Cyber Wagner</li>
            <li>Dermocosmética</li>
            <li>Bebé y Lactancia</li>
            <li>Nutrición</li>
            <li>Cuidado personal</li>
            <li>COVID-19</li>
            <li>Gift Card</li>
          </ul>
          <button className="see-more-button">Ver más</button>

          <h3>Filtrar por</h3>
          <h4>Precio</h4>
          <div className="price-filter">
            <input type="number" placeholder="Desde" defaultValue={0} />
            <input type="number" placeholder="Hasta" defaultValue={122800} />
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
            {products.map((product) => (
              <div key={product.id} className="product-card">
                {product.discount && (
                  <span className="discount-badge">{product.discount}% OFF</span>
                )}
                <img src={product.image} alt={product.name} className="product-image" />
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">${product.price.toLocaleString('es-AR')}</p>
                {product.installment && (
                  <p className="installment">
                    3 cuotas sin interés de ${product.installment.price.toLocaleString('es-AR')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
      <Footer/>
    </div>
  );
};

export default Products;