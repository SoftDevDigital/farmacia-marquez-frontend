import { FC } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Categories: FC = () => {

  const products = [
    {
      id: 1,
      name: 'Nutrilon Profutura 3 800 gr',
      price: 20697.00,
      discount: 40,
      installment: { price: 6899.00, count: 3 },
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 2,
      name: 'PerPiel Humectación Profunda Emulsión 40...',
      price: 11691.36,
      discount: 20,
      installment: { price: 3897.12, count: 3 },
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 3,
      name: 'Dermaglós Solar FPS 50 250 ml',
      price: 18693.07,
      discount: 30,
      installment: { price: 6231.02, count: 3 },
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 4,
      name: 'Dermaglós Crema Gel Ultra Hidratante 50 gr',
      price: 17683.11,
      discount: 25,
      installment: { price: 5894.37, count: 3 },
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 5,
      name: 'Curitas Tela Elástica 8 Unidades',
      price: 9000.00,
      installment: { price: 3000.00, count: 3 },
      image: 'https://via.placeholder.com/150',
    },
  ];

  return (
    <div>
      <Header />
      <div className="categories-page">
     
        <aside className="sidebar">
          <h2>Categorías</h2>
          <select className="filter-select">
            <option>Categorías</option>
            <option>Bebés</option>
            <option>Cuidado Personal</option>
            <option>Salud</option>
          </select>

          

          <h3>Marca</h3>
          <select className="filter-select">
            <option>Marca</option>
            <option>Nutrilon</option>
            <option>PerPiel</option>
            <option>Dermaglós</option>
            <option>Curitas</option>
          </select>

          <h3>Precio</h3>
          <div className="price-filter">
            <input type="number" placeholder="Desde" defaultValue={900} />
            <input type="number" placeholder="Hasta" defaultValue={66670} />
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
                    3 x ${product.installment.price.toLocaleString('es-AR')} sin interés
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

export default Categories;