import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Link from 'next/link';

const SuccessPage = () => {
  const router = useRouter();
  const { status, detail, orderId } = router.query;

 useEffect(() => {
  if (!status || !detail || !orderId) return;

  console.log('Pago recibido:', { status, detail, orderId });

  if (status === 'approved') {
    // Redirige automáticamente a /orders después de 3 segundos
    const timeout = setTimeout(() => {
      router.push('/orders');
    }, 3000);

    return () => clearTimeout(timeout); // limpieza en caso de desmontaje
  }
}, [status, detail, orderId, router]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>✅ ¡Gracias por tu compra!</h1>
      <p><strong>Estado:</strong> {status}</p>
      <p><strong>Detalle:</strong> {detail}</p>
      <p><strong>ID del Pedido:</strong> {orderId}</p>

      <div style={{ marginTop: '2rem' }}>
        <Link href="/orders">
          <button style={{
            padding: '10px 20px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            Ver mis pedidos
          </button>
        </Link>
      </div>
    </div>
  );
};

export default SuccessPage;