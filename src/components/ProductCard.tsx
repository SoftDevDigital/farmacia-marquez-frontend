import { FC, useEffect, useState } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';  // Importa jwt-decode
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
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: 0,
    discount: 0,
    stock: 0,
    imageUrl: '',
    categoryId: '',
    subcategoryId: '',
    brandId: '',
    isFeatured: false
  });
  const [editingProduct, setEditingProduct] = useState<string | null>(null); // Estado para edición de productos
  const [isAdmin, setIsAdmin] = useState(false); // Verificar si el usuario tiene rol ADMIN

  // Verificar si el usuario tiene rol ADMIN
  useEffect(() => {
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) {
      return;
    }
    try {
      const decodedToken = jwt_decode(token) as { role: string };
      if (decodedToken.role === 'ADMIN') {
        setIsAdmin(true); // Si el rol es ADMIN, habilitar la creación, eliminación y edición de productos
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

  // Filtrar productos por categoría, marca y precio
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
    const matchesBrand = selectedBrand ? product.brandId === selectedBrand : true;
  
    // Asegúrate de que los valores de priceFrom y priceTo no sean 0, y que los valores ingresados sean correctos
    const matchesPrice =
      (priceFrom > 0 ? product.price >= priceFrom : true) &&
      (priceTo > 0 ? product.price <= priceTo : true);
  
    return matchesCategory && matchesBrand && matchesPrice;
  });

  const filteredBrands = brands.filter((brand) => true);

  // Crear producto
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('USER_TOKEN');
    if (!token) {
      setError('No estás autenticado');
      return;
    }


    try {
      const res = await axios.post(
        'http://localhost:3000/products',
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.status === 201) {
        alert('Producto creado con éxito');
        setProducts([...products, res.data]); // Agregar el nuevo producto a la lista
        setProductData({
          name: '',
          description: '',
          price: 0,
          discount: 0,
          stock: 0,
          imageUrl: '',
          categoryId: '',
          subcategoryId: '',
          brandId: '',
          isFeatured: false,
        });
      } else {
        alert('Hubo un problema al crear el producto');
      }
    } catch (error) {
      console.error(error);
      alert('Error al crear el producto');
    }
  };



  // Editar producto
  const handleEditProduct = (productId: string) => {
    const product = products.find((product) => product._id === productId);
    if (product) {
      setProductData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        discount: product.discount || 0,
        stock: product.stock,
        imageUrl: product.imageUrl || '',
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId || '',
        brandId: product.brandId,
        isFeatured: product.isFeatured || false,
      });
      setEditingProduct(productId); // Establecer el producto que se está editando
    }
  };

  // Actualizar producto
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const token = localStorage.getItem('USER_TOKEN');
    try {
      const res = await axios.patch(
        `http://localhost:3000/products/${editingProduct}`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.status === 200) {
        alert('Producto actualizado con éxito');
        setProducts(
          products.map((product) =>
            product._id === editingProduct ? res.data : product
          )
        );
        setProductData({
          name: '',
          description: '',
          price: 0,
          discount: 0,
          stock: 0,
          imageUrl: '',
          categoryId: '',
          subcategoryId: '',
          brandId: '',
          isFeatured: false,
        });
        setEditingProduct(null); // Resetear el estado de edición
      } else {
        alert('Hubo un problema al actualizar el producto');
      }
    } catch (error) {
      console.error(error);
      alert('Error al actualizar el producto');
    }
  };
  const handleAddToCart = async (productId: string, quantity: number) => {
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) {
      setError('No estás autenticado');
      return;
    }

    const product = products.find((product) => product._id === productId);
    if (!product) {
      setError('Producto no encontrado');
      return;
    }

    // Validar que el precio y la cantidad sean correctos
    const price = product.price; // Tomar el precio del producto
    if (!price || quantity <= 0) {
      setError('Por favor, selecciona un producto y una cantidad válida.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3000/cart/add',
        {
          productId, 
          quantity, 
          price,
          applyDiscount: false // Asumiendo que no se aplica descuento por defecto
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
        alert('Hubo un problema al agregar el producto al carrito');
      }
    } catch (error) {
      console.error(error);
      setError('Error al agregar el producto al carrito');
      alert('Hubo un error al agregar el producto al carrito');
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (productId: string) => {
    const token = localStorage.getItem('USER_TOKEN');
    try {
      const res = await axios.delete(`http://localhost:3000/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        alert('Producto eliminado con éxito');
        setProducts(products.filter((product) => product._id !== productId));
      } else {
        alert('Hubo un problema al eliminar el producto');
      }
    } catch (error) {
      console.error(error);
      alert('Error al eliminar el producto');
    }
  };

  return (
    <div>
     
      <div className="products-page">
        <aside className="sidebar">
          <h2>Categorías</h2>
          <select className="filter-select" onChange={(e) => setSelectedCategory(e.target.value)}>
            <option>Categorías</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <h3>Marca</h3>
          <select className="filter-select" onChange={(e) => setSelectedBrand(e.target.value)} value={selectedBrand}>
            <option>Marca</option>
            {filteredBrands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </select>

          <h3>Filtrar por</h3>
<h4>Precio (Desde y Hasta)</h4>
<div className="price-filter">
  <label>Desde</label>
  <input
    type="number"
    placeholder="Precio desde"
    value={priceFrom}
    onChange={(e) => setPriceFrom(Number(e.target.value))}
  />
  <label>Hasta</label>
  <input
    type="number"
    placeholder="Precio hasta"
    value={priceTo}
    onChange={(e) => setPriceTo(Number(e.target.value))}
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
                {product.discount && <span className="discount-badge">{product.discount}% OFF</span>}
                <img src={product.imageUrl} alt={product.name} className="product-image" />
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">${product.price.toLocaleString('es-AR')}</p>
                {product.installment && (
                  <p className="installment">3 cuotas sin interés de ${product.installment.price.toLocaleString('es-AR')}</p>
                )}
                {isAdmin && (
                  <>
                    <button onClick={() => handleEditProduct(product._id)}>Editar</button>
                    <button onClick={() => handleDeleteProduct(product._id)}>Eliminar</button>
                  </>
                )}
                 <button
                  onClick={() => handleAddToCart(product._id, 1)} // Llamada a la función para agregar al carrito
                >
                  Comprar
                </button>
              </div>
            ))}
          </div>
        </main>

        {isAdmin && (
          <div className="create-product-form">
            <h3>{editingProduct ? 'Editar Producto' : 'Crear Producto'}</h3>
            <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}>
              <input
                type="text"
                name="name"
                value={productData.name}
                onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                placeholder="Nombre del producto"
                required
              />
              <textarea
                name="description"
                value={productData.description}
                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                placeholder="Descripción"
              />
              <input
                type="number"
                name="price"
                value={productData.price}
                onChange={(e) => setProductData({ ...productData, price: Number(e.target.value) })}
                placeholder="Precio"
                required
              />
              <input
                type="number"
                name="stock"
                value={productData.stock}
                onChange={(e) => setProductData({ ...productData, stock: Number(e.target.value) })}
                placeholder="Stock"
                required
              />
              <input
                type="number"
                name="discount"
                value={productData.discount}
                onChange={(e) => setProductData({ ...productData, discount: Number(e.target.value) })}
                placeholder="Descuento (%)"
              />
              <input
                type="text"
                name="imageUrl"
                value={productData.imageUrl}
                onChange={(e) => setProductData({ ...productData, imageUrl: e.target.value })}
                placeholder="URL de la imagen"
              />
              <select
                name="categoryId"
                value={productData.categoryId}
                onChange={(e) => setProductData({ ...productData, categoryId: e.target.value })}
                required
              >
                <option value="">Seleccionar Categoría</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                name="subcategoryId"
                value={productData.subcategoryId}
                onChange={(e) => setProductData({ ...productData, subcategoryId: e.target.value })}
              >
                <option value="">Seleccionar Subcategoría</option>
                {categories
                  .filter((category) => category._id === productData.categoryId)
                  .map((category) =>
                    category.subcategories.map((subcategory: any) => (
                      <option key={subcategory._id} value={subcategory._id}>
                        {subcategory.name}
                      </option>
                    ))
                  )}
              </select>

              <select
                name="brandId"
                value={productData.brandId}
                onChange={(e) => setProductData({ ...productData, brandId: e.target.value })}
                required
              >
                <option value="">Seleccionar Marca</option>
                {brands.map((brand) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
              </select>

              <label>
                Producto Destacado
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={productData.isFeatured}
                  onChange={(e) => setProductData({ ...productData, isFeatured: e.target.checked })}
                />
              </label>

              <button type="submit">{editingProduct ? 'Actualizar Producto' : 'Crear Producto'}</button>
            </form>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default Products;

