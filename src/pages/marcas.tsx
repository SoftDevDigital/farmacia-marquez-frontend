import { FC, useEffect, useState } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';  // Para verificar el rol
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
  const [brandName, setBrandName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingBrand, setEditingBrand] = useState<string | null>(null); // Estado para la marca en edición

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

  // Eliminar marca
  const handleDelete = async (brandId: string) => {
    const token = localStorage.getItem('USER_TOKEN');
    try {
      const res = await axios.delete(`http://localhost:3000/brands/${brandId}`, {
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
        'http://localhost:3000/brands',
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
        `http://localhost:3000/brands/${editingBrand}`,
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
    const matchesPrice =
      product.price >= priceFrom && product.price <= priceTo; 

    return matchesCategory && matchesBrand && matchesPrice;
  });

  const filteredBrands = brands.filter((brand) => {
    return true; 
  });

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
        
        <aside className="sidebar">

        <h3>Marca</h3>
          <select className="filter-select" onChange={(e) => setSelectedBrand(e.target.value)} value={selectedBrand}>
            <option>Marca</option>
            {filteredBrands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </select>
          
          <h2>Categorías</h2>
          <select className="filter-select" onChange={(e) => setSelectedCategory(e.target.value)}>
            <option>Categorías</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
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
              defaultValue={0} 
              onChange={(e) => setPriceFrom(parseFloat(e.target.value))}
            />
            <input 
              id="priceTo" 
              type="number" 
              placeholder="Hasta" 
              defaultValue={0} 
              onChange={(e) => setPriceTo(parseFloat(e.target.value))}
            />
            <button className="apply-button">Aplicar</button>
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
    <img src={product.imageUrl || '/default-image.jpg'} alt={product.name} className="product-image" />
    <h3 className="product-name">{product.name}</h3>
    <p className="product-description">{product.description}</p>
    <p className="product-price">Precio: ${product.price}</p>
    <p className="product-stock">Stock: {product.stock}</p>
    <button className="btn btn-buy" onClick={() => handleAddToCart(product._id)}>Comprar</button>
  </div>
))}
          </div>
        </main>

       
        </div>
         {isAdmin && (
          <div className="create-brand-form">
            <h3>{editingBrand ? 'Editar Marca' : 'Crear Marca'}</h3>
            <form onSubmit={editingBrand ? handleUpdateBrand : handleCreateBrand}>
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

        <div className="brand-list">
          {brands.length > 0 ? (
            brands.map((brand) => (
              <div key={brand._id} className="brand-card">
                <h3>{brand.name}</h3>
                {isAdmin && (
                  <div>
                    <button className="btn btn-edit" onClick={() => handleEdit(brand._id)}>Editar Marca</button>
                    <button  className="btn btn-delete" onClick={() => handleDelete(brand._id)}>Eliminar Marca</button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No hay marcas disponibles.</p>
          )}
      </div>
      <Footer />
    </div>
  );
};

export default Marcas;
