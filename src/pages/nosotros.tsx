import Footer from '@/components/Footer';
import Header from '../components/Header'; // Adjust the path to your Header component

const Nosotros = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Content Container */}
      <div className="w-full max-w-7xl mx-auto py-8 px-4">
        {/* Title */}
        <h1 className="text-3xl font-bold mb-8">Nosotros</h1>

        {/* Illustration */}
        <div className="bg-gray-100 rounded-lg p-8 mb-8 flex justify-center">
          <img
            src="/farmacia-zentner-illustration.jpg" // Placeholder path for the illustration
            alt="Farmacia Zentner Illustration"
            className="max-w-full h-auto"
            style={{ maxHeight: '300px' }}
          />
        </div>

        {/* Tagline */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Nuestra prioridad, tu bienestar
        </h2>

        {/* Main Description */}
        <p className="text-gray-600 mb-8">
          En el corazón de Santa Fe, en la esquina de San Jerónimo y Suipacha, nos encontramos desde hace más de 70 años, comprometidos con tu salud y bienestar.
        </p>

        {/* Subsections */}
        <div className="space-y-8">
          {/* Líderes en Dermocosmética */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Líderes en Dermocosmética
            </h3>
            <p className="text-gray-600">
              Somos referentes en la región y hemos sido reconocidos a nivel nacional por nuestros estándares de excelencia. En 2018, La Roche Posay nos distinguió como uno de los tres mejores centros de dermocosmética de Argentina. Adema, L’Oreal Paris nos seleccionó para ser el primer Dermacenter del país.
            </p>
          </div>

          {/* Accesibilidad e Innovación */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Accesibilidad e Innovación
            </h3>
            <p className="text-gray-600">
              Nos esforzamos por estar a la vanguardia de las últimas tendencias tanto en el sector farmacéutico como en la Dermocosmética. Nuestra presencia digital es líder en el mercado, con una página web y aplicación móvil diseñadas para facilitarte el acceso a nuestros productos y servicios obteniendo mayores beneficios.
            </p>
          </div>

          {/* Tu Salud, Nuestra Prioridad */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Tu Salud, Nuestra Prioridad
            </h3>
            <p className="text-gray-600">
              Queremos ser tu aliado en el cuidado de tu salud y bienestar. Comprometemos brindarte soluciones efectivas y personalizadas para tus necesidades y mejorar aun más tu calidad de vida. Somos farmacia ZENTNER.
            </p>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Nosotros;