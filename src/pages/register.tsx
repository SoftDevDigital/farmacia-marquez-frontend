import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios'; // Importar axios para hacer la solicitud
import Header from '../components/Header';
import Footer from '@/components/Footer';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    
    if (!name || !email || !phone || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    try {
     
      const response = await axios.post('http://localhost:3000/auth/register', {
        email: email,
        password: password,
        firstName: name.split(' ')[0], 
        lastName: name.split(' ')[1], 
      });

    
      if (response.data) {
       
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('role', response.data.role); 
        router.push('/login'); // Redirigir al login
      }
    } catch (err) {
      
      setError('Error al registrar usuario');
      console.error(err);
    }
  };

  return (
    <div className="register-page">
    
      <Header />

      <div className="register-container">
        <div className="register-form">
          <h2 className="register-title">Crear cuenta</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Nombre y apellido</label>
              <input
                id="name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">Teléfono</label>
              <input
                id="phone"
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <div className="password-container">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle btn btn-buy" 
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
              <div className="password-container">
                <input
                
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle btn btn-buy" 
                
                >
                  
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="submit-button">CREAR CUENTA</button>

            <p className="login-link">
              ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Register;
