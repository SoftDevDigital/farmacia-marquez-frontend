import { FC, useEffect, useState } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';  // Importa jwt-decode
import Header from '../components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/router';
import Link from 'next/link';


const Products: FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { fetchCartCount } = useCart(); 
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [priceFrom, setPriceFrom] = useState<string>('');
  const [priceTo, setPriceTo] = useState<number>(0);
  const [error, setError] = useState('');
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',         // ← antes era 0
    discount: '',      // ← opcional también
    stock: '',         // ← antes era 0
    imageUrl: '',
    categoryId: '',
    subcategoryId: '',
    brandId: '',
    isFeatured: false
  });
  const [editingProduct, setEditingProduct] = useState<string | null>(null); // Estado para edición de productos
  const [isAdmin, setIsAdmin] = useState(false); // Verificar si el usuario tiene rol ADMIN
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
const productsPerPage = 14;
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
    const [categoryRes, productRes, brandRes, promotionRes] = await Promise.all([
      axios.get('https://api.farmaciamarquezcity.com/categories'),
      axios.get('https://api.farmaciamarquezcity.com/products'),
      axios.get('https://api.farmaciamarquezcity.com/brands'),
      axios.get('https://api.farmaciamarquezcity.com/promotions'),
    ]);

    const promotions = promotionRes.data;

    const normalizedPromotions = promotions.map((promo: any) => ({
  ...promo,
  productIds: Array.isArray(promo.productIds)
    ? promo.productIds
    : [promo.productIds],
}));

    const enrichedProducts = productRes.data.map((product: any) => {
      const matchedPromotion = normalizedPromotions.find((promo: any) =>
        promo.productIds.includes(String(product._id))
      );

      console.log("Producto:", product.name, "→ Promo encontrada:", matchedPromotion?.type);

      return {
        ...product,
        appliedPromotion: matchedPromotion || null,
        promotionType: matchedPromotion?.type || null,
      };
    });

    setCategories(categoryRes.data);
    setBrands(brandRes.data);
    setProducts(enrichedProducts);
  } catch (error) {
    setError('Error al cargar categorías, productos o promociones');
    console.error(error);
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
  (priceFrom !== '' ? product.price >= parseInt(priceFrom) : true) &&
  (priceTo > 0 ? product.price <= priceTo : true);
  
    return matchesCategory && matchesBrand && matchesPrice;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const filteredBrands = brands.filter((brand) => true);

  // Crear producto
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) {
      setError('No estás autenticado');
      return;
    }
  
    const {
  subcategoryId,
  ...rest
} = productData;

const preparedProduct = {
  ...rest,
  price: Number(productData.price),
  stock: Number(productData.stock),
  discount: Number(productData.discount) || 0,
};

if (subcategoryId) {
  preparedProduct.subcategoryId = subcategoryId;
}
  
    try {
      const res = await axios.post('https://api.farmaciamarquezcity.com/products', preparedProduct, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',  
        },
      });
  
      if (res.status === 201) {
        alert('Producto creado con éxito');
        setProducts((prevProducts) => [...prevProducts, res.data]);
  
        setProductData({
          name: '',
          description: '',
          price: '',
          discount: '',
          stock: '',
          imageUrl: '',
          categoryId: '',
          subcategoryId: '',
          brandId: '',
          isFeatured: false
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
  
  const {
    subcategoryId,
    ...rest
  } = productData;

  const preparedProduct: any = {
    ...rest,
    price: Number(productData.price),
    stock: Number(productData.stock),
    discount: Number(productData.discount) || 0,
  };

  if (subcategoryId) {
    preparedProduct.subcategoryId = subcategoryId;
  }

  try {
    const res = await axios.patch(
      `https://api.farmaciamarquezcity.com/products/${editingProduct}`,
      preparedProduct,
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
        price: '',
        discount: '',
        stock: '',
        imageUrl: '',
        categoryId: '',
        subcategoryId: '',
        brandId: '',
        isFeatured: false,
      });
      setEditingProduct(null);
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
      setShowLoginModal(true);
      return;
    }
  
    const product = products.find((product) => product._id === productId);
    if (!product) {
      setError('Producto no encontrado');
      return;
    }
  
    const price = product.price;
    let finalQuantity = quantity;
    let totalPrice = product.price * quantity;
  
    if (product.appliedPromotion?.type === 'NXN') {
      const buyQty = product.appliedPromotion.buyQuantity || 1;
      const getQty = product.appliedPromotion.getQuantity || 1;
      const fullGroups = Math.floor(quantity / buyQty);
      const remaining = quantity % buyQty;
  
      finalQuantity = fullGroups * (buyQty + getQty) + remaining;
      totalPrice = fullGroups * buyQty * product.price + remaining * product.price;
    }
  
    if (product.appliedPromotion && product.promotionType === 'PERCENT_SECOND') {
      if (quantity >= 2) {
        const pairs = Math.floor(quantity / 2);
        const remaining = quantity % 2;
        const discount = product.appliedPromotion.discountPercentage || 0;
        const discountedPrice = product.price * (1 - discount / 100);
  
        totalPrice = (pairs * product.price) + (pairs * discountedPrice) + (remaining * product.price);
      } else {
        totalPrice = product.price * quantity;
      }
    }
  
    try {
      const response = await axios.post(
        'https://api.farmaciamarquezcity.com/cart/add',
        {
          productId,
          quantity: finalQuantity,
          finalPrice: totalPrice,
          applyDiscount: true
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.status === 201) {
        await fetchCartCount(); // ✅ actualiza el contador del carrito
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

      } else {
        setError('Hubo un problema al agregar el producto al carrito');
      }
    } catch (error) {
      console.error(error);
      setError('Error al agregar el producto al carrito');
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (productId: string) => {
    const token = localStorage.getItem('USER_TOKEN');
    try {
      const res = await axios.delete(`https://api.farmaciamarquezcity.com/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        
        setProducts(products.filter((product) => product._id !== productId));
      } else {
        alert('Hubo un problema al eliminar el producto');
      }
    } catch (error) {
      console.error(error);
      alert('Error al eliminar el producto');
    }
  };

  const confirmDeleteProduct = async () => {
  if (!productToDelete) return;

  const token = localStorage.getItem('USER_TOKEN');
  try {
    const res = await axios.delete(`https://api.farmaciamarquezcity.com/products/${productToDelete}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 200) {
      setProducts(products.filter((product) => product._id !== productToDelete));
    } else {
      alert('Hubo un problema al eliminar el producto');
    }
  } catch (error) {
    console.error(error);
    alert('Error al eliminar el producto');
  } finally {
    setShowDeleteModal(false);
    setProductToDelete(null);
  }
};




  return (
    <div>
     
      <div className="products-page" >
        <aside className="sidebar">
          <h2>Categorías</h2>
          
         <select className="filter-select" onChange={(e) => setSelectedCategory(e.target.value)} value={selectedCategory}>
          
  <option value="">Todas las categorías</option>
  {categories.map((category) => (
    <option key={category._id} value={category._id}>
      {category.name}
    </option>
  ))}
</select>

          <h3>Marca</h3>
         <select className="filter-select" onChange={(e) => setSelectedBrand(e.target.value)} value={selectedBrand}>
  <option value="">Todas las marcas</option>
  {filteredBrands.map((brand) => (
    <option key={brand._id} value={brand._id}>
      {brand.name}
    </option>
  ))}
</select>

          <h3>Filtrar por</h3>
<h4>Precio</h4>
<div className="price-filter">
  <label>Desde</label>
  <input
  type="number"
  placeholder="Precio desde"
  value={priceFrom}
  onChange={(e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) setPriceFrom(value);
  }}
/>
  {/* <label>Hasta</label>
  <input
    type="number"
    placeholder="Precio hasta"
    value={priceTo}
    onChange={(e) => setPriceTo(Number(e.target.value))}
  /> */}
  
</div>
        </aside>

        <main className="product-grid">
          <div className="grid-header">
      
          </div>

         <div className="products">
          
  {currentProducts.map((product) => (
    <div key={product._id} className="product-card">
      <Link href={`/products/${product._id}`} passHref legacyBehavior>
  <a style={{ textDecoration: 'none', color: 'inherit', position: 'relative', display: 'block' }}>
   {product.promotionType === 'NXN' && (
  <div style={{
    backgroundColor: '#ff4081',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '8px',
    fontWeight: 'bold',
    position: 'absolute',
    top: '10px',
    left: '10px',
    zIndex: 1,
    fontSize: '0.75rem'
  }}>
    ¡2x1!
  </div>
)}

{product.promotionType === 'PERCENT_SECOND' && (
  <div style={{
    backgroundColor: '#ff9800',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '8px',
    fontWeight: 'bold',
    position: 'absolute',
    top: '10px',
    left: '10px',
    zIndex: 1,
    fontSize: '0.75rem'
  }}>
    2da unidad -{product.appliedPromotion?.discountPercentage || 50}%
  </div>
)}
    <img src={product.imageUrl} alt={product.name} data-product-id={product._id} className="product-image" />
    <h3 className="product-name">{product.name}</h3>
    <p className="product-description">
      {product.description.length > 40
        ? product.description.slice(0, 40) + '...'
        : product.description}
    </p>
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
    {product.installment && (
      <p className="installment">
        3 cuotas sin interés de ${product.installment.price.toLocaleString('es-AR')}
      </p>
    )}
  </a>
</Link>


      <div className="product-buttons">
        {isAdmin && (
          <>
            <button className="btn btn-buy" onClick={() => handleEditProduct(product._id)}>Editar</button>
            <button className="btn btn-buy" onClick={() => {
  setProductToDelete(product._id);
  setShowDeleteModal(true);
}}>
  Eliminar
</button>
          </>
        )}
        <button className="btn btn-buy" onClick={() => handleAddToCart(product._id, 1)}>Agregar producto al carrito</button>
      </div>
    </div>
  ))}
</div>
        </main>

        
      </div>

      <div className="pagination">
  {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) }, (_, i) => (
    <button
      key={i + 1}
      onClick={() => setCurrentPage(i + 1)}
      className={`pagination-button ${currentPage === i + 1 ? 'active' : ''}`}
    >
      {i + 1}
    </button>
  ))}
</div>

      {showLoginModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Iniciar sesión requerido</h2>
      <p>Debes iniciar sesión o registrarte para agregar productos al carrito.</p>
      <div className="modal-buttons">
        <button className="btn btn-buy" onClick={() => router.push('/login')}>Iniciar sesión</button>
        <button className="btn btn-buy" onClick={() => router.push('/register')}>Registrarme</button>
        <button className="btn btn-buy" onClick={() => setShowLoginModal(false)}>Cancelar</button>
      </div>
    </div>
  </div>
)}
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
             <div className="form-group">
  <label htmlFor="price">Precio</label>
  <input
  type="number"
  id="price"
  name="price"
  value={productData.price}
  onChange={(e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setProductData({ ...productData, price: value });
    }
  }}
  placeholder="Precio"
  
/>
</div>




<div className="form-group">
  <label htmlFor="stock">Stock</label>
  <input
  type="number"
  id="stock"
  name="stock"
  value={productData.stock}
  onChange={(e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setProductData({ ...productData, stock: value });
    }
  }}
  placeholder="Cantidad disponible"
  
/>
</div>


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


{showDeleteModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>¿Eliminar producto?</h3>
   
      <div className="modal-buttons">
        <button className="btn btn-buy" onClick={confirmDeleteProduct}>Sí, eliminar</button>
        <button className="btn btn-buy" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Products;

