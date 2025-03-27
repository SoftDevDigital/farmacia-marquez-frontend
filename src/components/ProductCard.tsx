import { FC } from 'react';

const ProductCard: FC = () => {
  return (
    <div className="product-card">
      <img src="/producto.jpg" alt="Producto" />
      <div className="product-details">
        <h3>Nombre del Producto</h3>
        <p>$ Precio</p>
        <button>Comprar</button>
      </div>
    </div>
  );
};

export default ProductCard;
