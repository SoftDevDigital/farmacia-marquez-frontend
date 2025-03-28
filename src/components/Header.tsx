import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  return (
    <header className="header">
      
      <div className="header-top">
        
        <div className="logo">
          <img
            src="/farmacia.jpg" // Ruta al logo
            alt="Farmacia Curva Roces Logo"
            className="logo-img"
          />
          <span className="logo-text">Farmacia Curva Roces</span>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="¿Qué estás buscando?"
            className="search-input"
          />
          <button className="search-button">
            <span role="img" aria-label="search">🔍</span>
          </button>
        </div>

        <div className="user-options">
          <Link href="/login" className="greeting">Iniciar sesión</Link>
          <Link href="/register" className="register-link">o puedes registrarte</Link>
          <div className="cart">
            <span role="img" aria-label="cart">🛒</span>
            <span className="cart-count">0</span>
          </div>
        </div>
      </div>

      
      <nav className="header-nav">
        <ul className="nav-list">
          <li><a href="/">Inicio</a></li>
          <li><a href="/productos">Productos</a></li>
          <li><a href="/categorias">Categorías</a></li>
          <li><a href="/marcas">Marcas</a></li>
          <li><a href="/nosotros">Nosotros</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;

