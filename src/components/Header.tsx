
import { useState, useEffect } from 'react';
import Link from 'next/link';
import jwt_decode from 'jwt-decode';
import { useRouter } from 'next/router';
import { useCart } from '@/context/CartContext';
import Slider from 'react-slick';


const Header = ({ onSearch }: { onSearch: (term: string) => void }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { cartCount, fetchCartCount } = useCart();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
 const [promoMessageIndex, setPromoMessageIndex] = useState(0);
 const promoMessages = [
  <span className="text-[#e94c1f]">dale ❤️ a <span className="text-white font-bold">@marquez.city</span></span>,
  <span className="text-[#e94c1f] text-2xl font-semibold">Descuentos todos los días</span>,
];

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
        fetchCartCount();
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
          `https://api.farmaciamarquezcity.com/products?search=${encodeURIComponent(searchTerm)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error('Error al buscar productos');
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
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleResultClick = (productId: string) => {
    setIsDropdownOpen(false);
    setSearchTerm('');
    router.push(`/products/${productId}`);
  };

  return (
    <>

{router.pathname === '/' && (
  <div className="promo-banner">
    <div className="promo-slider">
      <Slider
        dots={false}
        infinite={true}
        speed={500}
        slidesToShow={1}
        slidesToScroll={1}
        arrows={true}
        autoplay={true}
        autoplaySpeed={3000}
      >
        <div className="promo-text">
  Dale ❤️ a{" "}
  <a
    href="https://www.instagram.com/marquez.city/"
    target="_blank"
    rel="noopener noreferrer"
    className="white-text"
  >
    @marquez.city
  </a>
</div>
        <div>
          <div className="promo-text">
            Descuentos todos los días
          </div>
        </div>
        <div>
          <div className="promo-text">
            Bienvenidos a Farmacia Marquez City
          </div>
        </div>
      </Slider>
    </div>
  </div>
)}

      <header className="header">
        <div className="header-top">
          <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/farmacia.png" alt="Farmacia Marquez City Logo" className="logo-img" />
            <span className="logo-text">Farmacia Marquez City</span>
          </Link>

          {!['/login', '/register', '/forgot-password'].includes(router.pathname) && (
            <div className="search-bar" style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="¿Qué estás buscando?"
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchResults.length > 0 && setIsDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
              />

              {isDropdownOpen && searchResults.length > 0 && (
                <div className="search-dropdown" style={{
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
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                  {searchResults.map((product) => (
                    <div
                      key={product._id}
                      className="search-result-item"
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                      }}
                      onMouseDown={() => handleResultClick(product._id)}
                    >
                      {product.name} - ${product.price}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          

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
            {isAdmin && <li><Link href="/affiliates">Afiliados</Link></li>}
          </ul>
        </nav>
      </header>
      {router.pathname === '/' && (
  <section className="promo-image-banner">
    <img
      src="/farmacia_marquezcity.jpg"
      alt="Promoción especial"
      className="promo-banner-img"
    />
  </section>
)}

{router.pathname === '/' && (
  <section className="benefits-section">
    <div className="benefits-container">
      <div className="benefit-box">
        <img src="/marquezcity_envios.jpg" alt="Envíos" className="benefit-icon" />
        <div>
          <h4>Envíos</h4>
          <p>Gratis a partir de los $80.000</p>
        </div>
      </div>
      <div className="benefit-box">
        <img src="/marquezcity_paga.jpg" alt="Pagá" className="benefit-icon" />
        <div>
          <h4>Pagá</h4>
          <p>En 3 sin interés</p>
        </div>
      </div>
      <div className="benefit-box">
        <img src="/marquezcity_retira.jpg" alt="Retirá" className="benefit-icon" />
        <div>
          <h4>Retirá</h4>
          <p>Gratis en nuestro local</p>
        </div>
      </div>
      <a
  href="https://wa.me/3424058477"
  target="_blank"
  rel="noopener noreferrer"
  className="benefit-box"
>
  <img src="/marquezcity_wpp.jpg" alt="Asesoramiento Online" className="benefit-icon" />
  <div>
    <h4>Asesoramiento Online</h4>
    <p>Vía WhatsApp</p>
  </div>
</a>
    </div>
  </section>
)}
{router.pathname === '/' && (
  <section className="promo-image-banner">
    <Link href="/PromotionsPage" passHref legacyBehavior>
      <a>
        <img
          src="/marquezcity_promociones.jpg"
          alt="Promociones Farmacia Marquez City"
          className="promo-banner-img hover:opacity-90 transition-opacity duration-300"
        />
      </a>
    </Link>
  </section>
)}
  {router.pathname === '/' && (
  <section className="promo-carousel-wrapper">
    <div className="promo-carousel-container">
      <Slider
        dots={true}
        infinite={true}
        speed={200}
        slidesToShow={1}
        slidesToScroll={1}
        arrows={true}
        autoplay={true}
        autoplaySpeed={900}
      >
        {[
          'farmacia-marquezcity-carrusel-08-.png',
          'farmacia-marquezcity-carrusel-09.png',
          'farmacia-marquezcity-carrusel-10.png',
          'farmacia-marquezcity-carrusel-11.png',
          'farmacia-marquezcity-carrusel-12.png',
        ].map((filename, index) => (
          <div key={index} className="promo-slide">
            <img
              src={`/${filename}`}
              alt={`Banner ${index + 1}`}
              className="promo-slide-img"
            />
          </div>
        ))}
      </Slider>
    </div>
  </section>
)}



    </>
  );
};

export default Header;
