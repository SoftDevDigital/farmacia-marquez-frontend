import { useRouter } from 'next/router';

const ModalLoginRequired = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '1rem' }}>
          Iniciar sesión requerido
        </h2>
        <p style={{ fontSize: '16px', marginBottom: '1.5rem' }}>
          Debes iniciar sesión o registrarte para agregar productos al carrito.
        </p>
        <div className="modal-buttons">
          <button className="btn btn-buy" onClick={() => router.push('/login')}>
            Iniciar sesión
          </button>
          <button className="btn btn-buy" onClick={() => router.push('/register')}>
            Registrarme
          </button>
          <button
            className="btn"
            style={{ backgroundColor: '#14b8a6' }}
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalLoginRequired;
