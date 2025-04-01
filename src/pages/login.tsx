import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';  
import Header from '../components/Header';
import Footer from '@/components/Footer';
import { GoogleLogin } from '@react-oauth/google';  

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const router = useRouter();


  const handleGoogleLogin = async (response: any) => {
    try {
      const googleToken = response.credential;
      const res = await axios.post('http://localhost:3000/auth/google', {
        token: googleToken,
      });

      if (res.data && res.data.accessToken) {
        localStorage.setItem('USER_TOKEN', res.data.accessToken);  
        router.push('/'); 
      }
    } catch (err) {
      setError('Error al iniciar sesión con Google');  
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      try {
        
        const response = await axios.post('http://localhost:3000/auth/login', {
          email: email,
          password: password,
        });

        
        if (response.data && response.data.accessToken) {
          localStorage.setItem('USER_TOKEN', response.data.accessToken);  
          router.push('/'); 
        }
      } catch (err) {
        setError('Error al iniciar sesión');  
        console.error(err);
      }
    } else {
      setError('Por favor, ingresa ambos campos.');
    }
  };

  return (
    <div className="login-page">
      
      <Header />

      <div className="login-container">
        <div className="login-form">
          
          <h2 className="login-title">Iniciá sesión</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
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
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
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
                  className="password-toggle"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <Link href="/forgot-password" className="forgot-password">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="submit-button">
              INICIAR SESIÓN
            </button>

            <p className="create-account">
              ¿No tenés cuenta aún?{' '}
              <Link href="/register">
                Crear cuenta
              </Link>
            </p>
          </form>

          <div className="google-login">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={(error) => console.log('Login Failed:', error)}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;
