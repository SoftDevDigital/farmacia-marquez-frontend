import { FC, useEffect, useState } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';  // Para verificar el rol
import Header from '../components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';


const Marcas: FC = () => {
  const [categories, setCategories] = useState<any[]>([]); 
  const [brands, setBrands] = useState<any[]>([]); 
  const [products, setProducts] = useState<any[]>([]); 
  const [selectedCategory, setSelectedCategory] = useState<string>(''); 
  const [selectedBrand, setSelectedBrand] = useState<string>(''); 
  const [priceFrom, setPriceFrom] = useState<string>(''); 
  const [priceTo, setPriceTo] = useState<number>(999999); 
  const [error, setError] = useState('');
  const [brandName, setBrandName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingBrand, setEditingBrand] = useState<string | null>(null); // Estado para la marca en edición
  const { fetchCartCount } = useCart();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Verificar si el usuario tiene rol ADMIN
  useEffect(() => {
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) {
      return;
    }
    try {
      const decodedToken = jwt_decode(token) as { role: string };
      if (decodedToken.role === 'ADMIN') {
        setIsAdmin(true); // Si el rol es ADMIN, habilitar la creación, eliminación y edición de marcas
      }
    } catch (err) {
      console.error('Error al verificar el rol', err);
    }
  }, []);

  // Fetch categories, products, and brands from API
  useEffect(() => {
    const fetchCategoriesAndProductsAndBrands = async () => {
      try {
        const categoryResponse = await axios.get('https://api.farmaciamarquezcity.com/categories');
        const productResponse = await axios.get('https://api.farmaciamarquezcity.com/products');
        const brandResponse = await axios.get('https://api.farmaciamarquezcity.com/brands');
        
        setCategories(categoryResponse.data);
        setProducts(productResponse.data);
        setBrands(brandResponse.data);
      } catch (error) {
        setError('Error al cargar las categorías, productos o marcas');
      }
    };

    fetchCategoriesAndProductsAndBrands();
  }, []);

  // Eliminar marca
  const handleDelete = async (brandId: string) => {
    const token = localStorage.getItem('USER_TOKEN');
    try {
      const res = await axios.delete(`https://api.farmaciamarquezcity.com/brands/${brandId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        alert('Marca eliminada con éxito');
        setBrands(brands.filter((brand) => brand._id !== brandId));
      } else {
        alert('Hubo un problema al eliminar la marca');
      }
    } catch (error) {
      console.error(error);
      alert('Error al eliminar la marca');
    }
  };

  // Crear marca
  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('USER_TOKEN');
    if (!token) {
      setError('No estás autenticado');
      return;
    }

    try {
      const res = await axios.post(
        'https://api.farmaciamarquezcity.com/brands',
        { name: brandName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.status === 201) {
        alert('Marca creada con éxito');
        setBrands([...brands, res.data]); // Agregar la nueva marca al estado
        setBrandName(''); // Limpiar el campo de entrada
      } else {
        alert('Hubo un problema al crear la marca');
      }
    } catch (error) {
      console.error(error);
      alert('Error al crear la marca');
    }
  };

  // Editar marca
  const handleEdit = (brandId: string) => {
    const brand = brands.find((brand) => brand._id === brandId);
    if (brand) {
      setBrandName(brand.name); // Setear el nombre de la marca en el formulario
      setEditingBrand(brandId); // Establecer el estado de la marca en edición
    }
  };

  // Actualizar marca
  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;

    const token = localStorage.getItem('USER_TOKEN');
    try {
      const res = await axios.patch(
        `https://api.farmaciamarquezcity.com/brands/${editingBrand}`,
        { name: brandName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.status === 200) {
        alert('Marca actualizada con éxito');
        setBrands(
          brands.map((brand) =>
            brand._id === editingBrand ? res.data : brand
          )
        );
        setBrandName(''); // Limpiar el campo de entrada
        setEditingBrand(null); // Resetear el estado de edición
      } else {
        alert('Hubo un problema al actualizar la marca');
      }
    } catch (error) {
      console.error(error);
      alert('Error al actualizar la marca');
    }
  };

  // Filtrado de productos
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
    const matchesBrand = selectedBrand ? product.brandId === selectedBrand : true;
    const from = parseFloat(priceFrom || '0');
const matchesPrice = product.price >= from && product.price <= priceTo;

    return matchesCategory && matchesBrand && matchesPrice;
  });

  const filteredBrands = brands.filter((brand) => {
    return true; 
  });

  const handleAddToCart = async (productId: string) => {
  const token = localStorage.getItem('USER_TOKEN');
  if (!token) {
  setShowLoginModal(true);
  return;
}

  try {
    const response = await axios.post(
      'https://api.farmaciamarquezcity.com/cart/add',
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
      await fetchCartCount();

// ✅ Esperar al siguiente ciclo de render para asegurar que los elementos están posicionados correctamente
setTimeout(() => {
  const productImage = document.querySelector(`img[data-product-id="${productId}"]`);
  const cartIcon = document.querySelector('.cart-icon');

  if (productImage && cartIcon) {
    const imgRect = productImage.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    const flyingImg = productImage.cloneNode(true) as HTMLElement;
    flyingImg.style.position = 'fixed';
    flyingImg.style.top = `${imgRect.top}px`;
    flyingImg.style.left = `${imgRect.left}px`;
    flyingImg.style.width = `${imgRect.width}px`;
    flyingImg.style.height = `${imgRect.height}px`;
    flyingImg.style.transition = 'all 0.8s ease-in-out';
    flyingImg.style.zIndex = '9999';

    document.body.appendChild(flyingImg);

    requestAnimationFrame(() => {
      flyingImg.style.top = `${cartRect.top}px`;
      flyingImg.style.left = `${cartRect.left}px`;
      flyingImg.style.width = '20px';
      flyingImg.style.height = '20px';
      flyingImg.style.opacity = '0.5';
    });

    flyingImg.addEventListener('transitionend', () => {
      flyingImg.remove();
      cartIcon.classList.add('bounce');
      setTimeout(() => cartIcon.classList.remove('bounce'), 500);
    });
  }
}, 0); 

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
      <Header onSearch={() => {}} />
      <div className="categories-page">
        
        <aside className="sidebar">

        <h3>Marca</h3>
         <select
  className="filter-select"
  onChange={(e) => setSelectedBrand(e.target.value)}
  value={selectedBrand}
>
  <option value="">Todas las marcas</option>
  {filteredBrands.map((brand) => (
    <option key={brand._id} value={brand._id}>
      {brand.name}
    </option>
  ))}
</select>
          
          <h2>Categorías</h2>
        <select
  className="filter-select"
  value={selectedCategory}
  onChange={(e) => setSelectedCategory(e.target.value)}
>
  <option value="">Todas las categorías</option>
  {categories.map((category) => (
    <option key={category._id} value={category._id}>
      {category.name}
    </option>
  ))}
</select>

         

          <h3>Filtrar por</h3>
          <h4>Precio</h4>
          <div className="price-filter">
          <label>Desde</label>
          <input 
  id="priceFrom" 
  type="number" 
  placeholder="Precio desde"
  value={priceFrom}
  onChange={(e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) setPriceFrom(value); // Solo permite números positivos
  }}
/>
           
            
          </div>
        </aside>

        <main className="product-grid">
          <div className="grid-header">
            
                   </div>

          <div className="products">
          {filteredProducts.map((product) => (
  <div key={product._id} className="product-card">
    <Link href={`/products/${product._id}`} passHref legacyBehavior>
      <a style={{ textDecoration: 'none', color: 'inherit' }}>
        <img src={product.imageUrl || '/default-image.jpg'} alt={product.name} data-product-id={product._id} className="product-image" />
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
      </a>
    </Link>
    <button className="btn btn-buy" onClick={() => handleAddToCart(product._id)}>Agregar producto al carrito</button>
  </div>
))}
          </div>
        </main>

       
        </div>
         {isAdmin && (
          <div className="create-brand-form">
            <h3>{editingBrand ? 'Editar Marca' : 'Crear Marca'}</h3>
            <form onSubmit={editingBrand ? handleUpdateBrand : handleCreateBrand} className="brand-form">
              <input
                type="text"
                name="name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Nombre de la marca"
                required
              />
              <button className="btn btn-buy" type="submit">{editingBrand ? 'Actualizar Marca' : 'Crear Marca'}</button>
            </form>
          </div>
        )}

       {isAdmin && (
  <div className="brand-list">
    {brands.length > 0 ? (
      brands.map((brand) => (
        <div key={brand._id} className="brand-card">
          <h3>{brand.name}</h3>
          <div className="brand-buttons">
            <button className="btn btn-edit" onClick={() => handleEdit(brand._id)}>Editar Marca</button>
            <button className="btn btn-delete" onClick={() => handleDelete(brand._id)}>Eliminar Marca</button>
          </div>
        </div>
      ))
    ) : (
      <p>No hay marcas disponibles.</p>
    )}
  </div>
)}

{showLoginModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Iniciar sesión requerido</h2>
      <p>Debes iniciar sesión o registrarte para agregar productos al carrito.</p>
      <div className="modal-buttons">
        <button className="btn btn-buy" onClick={() => window.location.href = '/login'}>Iniciar sesión</button>
        <button className="btn btn-buy" onClick={() => window.location.href = '/register'}>Registrarme</button>
        <button className="btn btn-buy" onClick={() => setShowLoginModal(false)}>Cancelar</button>
      </div>
    </div>
  </div>
)}
     
      <Footer />
    </div>
  );
};

export default Marcas;
