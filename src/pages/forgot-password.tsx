import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header'; 
import Footer from '@/components/Footer';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Hacer la solicitud POST al backend
      const response = await fetch('http://localhost:3003/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Te hemos enviado un correo para restablecer tu contraseña.');
        setError('');  // Limpiar cualquier error previo
      } else {
        setError(data.message || 'Hubo un problema al enviar el correo.');
        setMessage('');
      }
    } catch (error) {
      setError('Error al conectar con el servidor.');
      setMessage('');
    }
  };

  return (
    <div className="forgot-password-page">
      <Header />
      
      <div className="forgot-password-container">
        <div className="forgot-password-form">
          <h2 className="forgot-password-title">
            Cambiar contraseña
          </h2>

          <p className="forgot-password-description">
            Vamos a enviarte un email para que puedas cambiar tu contraseña.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="submit-button">
              ENVIAR EMAIL
            </button>

            {message && <p className="message success">{message}</p>}
            {error && <p className="message error">{error}</p>}
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
