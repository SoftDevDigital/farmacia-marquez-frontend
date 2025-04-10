import { useState, useEffect } from 'react';
import Link from 'next/link';
import jwt_decode from 'jwt-decode'; // Importación correcta
import { useRouter } from 'next/router'; 
const Header = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('USER_TOKEN');
    if (token) {
      try {
        // Decodificar el token
        const decodedToken = jwt_decode(token) as { role: string };
        if (decodedToken?.role === 'ADMIN') {
          setIsAdmin(true); // Si el rol es ADMIN, mostramos la opción de crear productos
        } else {
          setIsAdmin(false); // Si no es ADMIN, ocultamos la opción
        }
      } catch (error) {
        console.error('Error al verificar el rol:', error);
        setIsAdmin(false); // Si hay error al decodificar, no permitir acceso
      }
    } else {
      setIsAdmin(false); // Si no hay token, no mostramos la opción
    }
  }, []); // El efecto solo se ejecuta al montar el componente

  return (
    <header className="header">
      <div className="header-top">
        <div className="logo">
          <img src="/farmacia.jpg" alt="Farmacia Curva Roces Logo" className="logo-img" />
          <span className="logo-text">Farmacia Curva Roces</span>
        </div>

        {/* Barra de búsqueda */}
        <div className="search-bar">
          <input type="text" placeholder="¿Qué estás buscando?" className="search-input" />
          <button className="search-button">
            <span role="img" aria-label="search">🔍</span>
          </button>
        </div>

        <div className="user-options">
          <Link href="/login" className="greeting">Iniciar sesión</Link>
          <Link href="/register" className="register-link">o puedes registrarte</Link>

          <Link href="/cart" className="cart">
            <span role="img" aria-label="cart">🛒</span>
            <span className="cart-count">0</span> {/* Esto debería actualizarse con la cantidad real de items en el carrito */}
          </Link>
        </div>
      </div>

      <nav className="header-nav">
        <ul className="nav-list">
          <li><Link href="/">Inicio</Link></li>
           {/* <li><Link href="/productos">Productos</Link></li>  */}
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
