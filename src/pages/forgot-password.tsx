import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header'; 
import Footer from '@/components/Footer';


const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setMessage('Te hemos enviado un correo para restablecer tu contraseña.');
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

            {message && <p className="message">{message}</p>}
          </form>
        </div>
      </div>
       <Footer/>
    </div>
  );
};

export default ForgotPassword;