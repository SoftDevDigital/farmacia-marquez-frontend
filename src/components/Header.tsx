import { useState, useEffect } from 'react';
import Link from 'next/link';
import jwt_decode from 'jwt-decode';
import { useRouter } from 'next/router';
import { useCart } from '@/context/CartContext';


const Header = ({ onSearch }: { onSearch: (term: string) => void }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');  
  const { cartCount } = useCart();
  useEffect(() => {
    const token = localStorage.getItem('USER_TOKEN');
    if (token) {
      try {
        // Decodificar el token
        const decodedToken = jwt_decode(token) as { role: string };
        if (decodedToken?.role === 'ADMIN') {
          setIsAdmin(true); 
        } else {
          setIsAdmin(false); 
        }
      } catch (error) {
        console.error('Error al verificar el rol:', error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false); 
    }
  }, []);

  const handleSearch = () => {
    onSearch(searchTerm);  // Pasamos el término de búsqueda al componente padre
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="logo">
          <img src="/farmacia.jpg" alt="Farmacia Curva Roces Logo" className="logo-img" />
          <span className="logo-text">Farmacia Curva Roces</span>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="¿Qué estás buscando?"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-button" onClick={handleSearch}>
            <span role="img" aria-label="search">🔍</span>
          </button>
        </div>

        <div className="user-options">
          <Link href="/login" className="greeting">Iniciar sesión</Link>
          <Link href="/register" className="register-link">o puedes registrarte</Link>

          <Link href="/cart" className="cart">
          <span role="img" aria-label="cart">🛒</span>
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