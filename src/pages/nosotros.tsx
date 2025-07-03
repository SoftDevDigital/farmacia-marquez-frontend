import Footer from '@/components/Footer';
import Header from '../components/Header';

const Nosotros = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Header onSearch={() => {}} />

      <div className="nosotros-container">
        <h1 className="nosotros-title">Nosotros</h1>

        <div className="nosotros-image-container">
          <img
  src="/marquez.png"
  alt="Farmacia Marquez City"
  className="nosotros-image"
/>
        </div>

        <h2 className="nosotros-subtitle">Estamos cerca. Siempre.</h2>

        <p className="nosotros-text">
          En la zona norte de Santa Fe, sobre Blas Parera 8448, justo frente a los hospitales Mira y López y Nuevo Iturraspe, nos encontrás todos los días para lo que necesites.
        </p>
        <p className="nosotros-text">📍 Lunes a viernes, de 8 a 00 hs</p>
        <p className="nosotros-text">📍 Sábados, de 8 a 20 hs</p>

        <div className="nosotros-block">
          <h3>Más que una farmacia, un equipo que te acompaña</h3>
          <p>
            En MarquezCity nos mueve el compromiso con tu salud. Sabemos que cada persona que entra a nuestra farmacia busca mucho más que un medicamento: busca atención, orientación y tranquilidad.
            Por eso, trabajamos con un equipo capacitado y cercano, que te escucha y te ayuda a encontrar la mejor solución para vos y tu familia.
          </p>
        </div>

        <div className="nosotros-block">
          <h3>Confianza que se construye día a día</h3>
          <p>
            Hace años que somos un punto de referencia en la zona, y eso no es casualidad. Estamos donde más se nos necesita, con un servicio ágil, moderno y humano.
            Nuestra misión es simple: que siempre que pienses en farmacia, pienses en nosotros. Porque en MarquezCity, cuidarte es lo que mejor sabemos hacer.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Nosotros;
