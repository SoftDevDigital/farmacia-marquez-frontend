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
            src="/farmacia-zentner-illustration.jpg"
            alt="Farmacia Zentner Illustration"
            className="nosotros-image"
          />
        </div>

        <h2 className="nosotros-subtitle">Nuestra prioridad, tu bienestar</h2>

        <p className="nosotros-text">
          En el corazón de Santa Fe, en la esquina de San Jerónimo y Suipacha,
          nos encontramos desde hace más de 70 años, comprometidos con tu salud
          y bienestar.
        </p>

        <div className="nosotros-block">
          <h3>Líderes en Dermocosmética</h3>
          <p>
            Somos referentes en la región y hemos sido reconocidos a nivel nacional por nuestros estándares de excelencia. En 2018, La Roche Posay nos distinguió como uno de los tres mejores centros de dermocosmética de Argentina. Además, L’Oreal Paris nos seleccionó para ser el primer Dermacenter del país.
          </p>
        </div>

        <div className="nosotros-block">
          <h3>Accesibilidad e Innovación</h3>
          <p>
            Nos esforzamos por estar a la vanguardia de las últimas tendencias tanto en el sector farmacéutico como en la Dermocosmética. Nuestra presencia digital es líder en el mercado, con una página web y aplicación móvil diseñadas para facilitarte el acceso a nuestros productos y servicios obteniendo mayores beneficios.
          </p>
        </div>

        <div className="nosotros-block">
          <h3>Tu Salud, Nuestra Prioridad</h3>
          <p>
            Queremos ser tu aliado en el cuidado de tu salud y bienestar. Comprometemos brindarte soluciones efectivas y personalizadas para tus necesidades y mejorar aun más tu calidad de vida. Somos farmacia ZENTNER.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Nosotros;
