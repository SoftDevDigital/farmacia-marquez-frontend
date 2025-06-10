import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PaymentFailure = () => {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    const { status, collection_status } = router.query;
    setStatus(status as string);
    setDetail(collection_status as string);
  }, [router.query]);

  return (
    <>
      <Header onSearch={() => {}} />
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>❌ Pago Rechazado</h1>
        <p>Tu pago no pudo ser procesado.</p>
        <p><strong>Estado:</strong> {status ?? 'rejected'}</p>
        <p><strong>Detalle:</strong> {detail ?? 'rejected_by_issuer'}</p>

        <button className="btn btn-buy" onClick={() => router.push('/cart')}>
          Volver al Carrito
        </button>
      </div>
      <Footer />
    </>
  );
};

export default PaymentFailure;