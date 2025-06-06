import { useState, useEffect } from 'react';
import Link from 'next/link';
import jwt_decode from 'jwt-decode';
import { useRouter } from 'next/router';
import { useCart } from '@/context/CartContext';


const Header = ({ onSearch }: { onSearch: (term: string) => void }) => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]); // Estado para los resultados de búsqueda
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Controlar la visibilidad del dropdown
  const { cartCount } = useCart();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
const [userName, setUserName] = useState<string | null>(null);

useEffect(() => {
  const token = localStorage.getItem('USER_TOKEN');
  if (token) {
    try {
      const decodedToken = jwt_decode(token) as { role: string; name?: string };
      setIsAuthenticated(true);
      setUserName(decodedToken.name || null);
      if (decodedToken?.role === 'ADMIN') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setIsAuthenticated(false);
    }
  } else {
    setIsAuthenticated(false);
  }
}, []);
useEffect(() => {
  const fetchSearchResults = async () => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    try {
      const token = localStorage.getItem('USER_TOKEN') || '';
      const response = await fetch(
        `http://localhost:3000/products?search=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al buscar productos');
      }

      const data = await response.json();
      setSearchResults(data);
      setIsDropdownOpen(true);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      setSearchResults([]);
      setIsDropdownOpen(false);
    }
  };

  const debounce = setTimeout(() => {
    fetchSearchResults();
  }, 300); // Debounce de 300ms para evitar demasiadas solicitudes

  return () => clearTimeout(debounce); // Limpiar el timeout al desmontar o cambiar el término
}, [searchTerm]);



const handleResultClick = (productId: string) => {
  setIsDropdownOpen(false); // Cerrar el dropdown al seleccionar un producto
  setSearchTerm(''); // Limpiar el término de búsqueda
  router.push(`/products/${productId}`); // Redirigir al detalle del producto
};

  

  return (
    <header className="header">
      <div className="header-top">
      <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
  <img src="/farmacia.png" alt="Farmacia Marquez City Logo" className="logo-img" />
  <span className="logo-text">Farmacia Marquez City</span>
</Link>
<div className="search-bar" style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="¿Qué estás buscando?"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchResults.length > 0 && setIsDropdownOpen(true)}
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)} // Retraso para permitir clics en el dropdown
          />
       

          {isDropdownOpen && searchResults.length > 0 && (
            <div
              className="search-dropdown"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              {searchResults.map((product) => (
                <div
                  key={product._id}
                  className="search-result-item"
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee',
                  }}
                  onMouseDown={() => handleResultClick(product._id)} // Usar onMouseDown para evitar el blur del input
                >
                  {product.name} - ${product.price}
                </div>
              ))}
            </div>
          )}
        </div>



        <div className="user-options">
        {isAuthenticated ? (
  <>
    <Link href="/profile" className="greeting">Mi perfil</Link>
    <button
      className="logout-button btn btn-buy"
      onClick={() => {
        localStorage.removeItem('USER_TOKEN');
        window.location.href = '/';
      }}
    >
      Cerrar sesión
    </button>
  </>
) : (
  <>
    <Link href="/login" className="greeting">Iniciar sesión</Link>
    <Link href="/register" className="register-link">o puedes registrarte</Link>
  </>
)}

<Link href="/cart" className="cart">
  <span className="cart-icon" role="img" aria-label="cart">🛒</span>
  <span className="cart-count">{cartCount}</span> 
</Link>
        </div>
      </div>

      <nav className="header-nav">
        <ul className="nav-list">
          <li><Link href="/">Inicio</Link></li>
          <li><Link href="/categorias">Categorías</Link></li>
          <li><Link href="/marcas">Marcas</Link></li>
          <li><Link href="/PromotionsPage">Promociones</Link></li>
          <li><Link href="/nosotros">Nosotros</Link></li>
          {isAdmin && (
            <li><Link href="/affiliates">Afiliados</Link></li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;