import { FC, useEffect, useState } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';  // Para verificar el rol
import Header from '../components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

const CreateProduct: FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) {
      router.push('/login'); // Si no hay token, redirigir al login
      return;
    }

    try {
      const decodedToken = jwt_decode(token) as { role: string };
      if (decodedToken.role === 'ADMIN') {
        setIsAdmin(true); // Si el rol es ADMIN, habilitar la creación de productos
      }
    } catch (err) {
      console.error('Error al verificar el rol', err);
      router.push('/login'); // Si no se puede decodificar el token, redirigir al login
    }
  }, [router]);

  // Obtener categorías y marcas
  useEffect(() => {
    const fetchCategoriesAndBrands = async () => {
      try {
        const categoryResponse = await axios.get('http://localhost:3000/categories');
        const brandResponse = await axios.get('http://localhost:3000/brands');
        
        setCategories(categoryResponse.data);
        setBrands(brandResponse.data);
      } catch (error) {
        setError('Error al cargar las categorías o marcas');
      }
    };

    fetchCategoriesAndBrands();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  // Crear nuevo producto
  const handleSubmit = async (e: React.FormEvent) => {
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
        router.push('/products'); // Redirigir a la lista de productos
      } else {
        alert('Hubo un problema al crear el producto');
      }
    } catch (error) {
      console.error(error);
      alert('Error al crear el producto');
    }
  };

  return (
    <div>
      <Header />
      <div className="create-product-page">
        <h2>Crear Producto</h2>

        {isAdmin ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              value={productData.name}
              onChange={handleChange}
              placeholder="Nombre del producto"
              required
            />
            <textarea
              name="description"
              value={productData.description}
              onChange={handleChange}
              placeholder="Descripción"
            />
            <input
              type="number"
              name="price"
              value={productData.price}
              onChange={handleChange}
              placeholder="Precio"
              required
            />
            <input
              type="number"
              name="stock"
              value={productData.stock}
              onChange={handleChange}
              placeholder="Stock"
              required
            />
            <input
              type="number"
              name="discount"
              value={productData.discount}
              onChange={handleChange}
              placeholder="Descuento (%)"
            />
            <input
              type="text"
              name="imageUrl"
              value={productData.imageUrl}
              onChange={handleChange}
              placeholder="URL de la imagen"
            />
            <select
              name="categoryId"
              value={productData.categoryId}
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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

            <button type="submit">Crear Producto</button>
          </form>
        ) : (
          <p>Acceso restringido. Solo los administradores pueden crear productos.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

<button onClick={handleClearCart}>Limpiar Carrito</button>
<button onClick={handleCheckout}>Iniciar Proceso de Pago</button>

export default CreateProduct;