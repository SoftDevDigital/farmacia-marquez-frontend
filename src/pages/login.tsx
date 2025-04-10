import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import Header from '../components/Header';
import Footer from '@/components/Footer';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const router = useRouter();

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

          // Decode the token and check the role
          const decodedToken = jwt_decode(response.data.accessToken) as { role: string };

          // If the user is an admin, redirect them to the create-product page
          if (decodedToken.role === 'ADMIN') {
            router.push('/');
          } else {
            router.push('/');  // Redirect to homepage for non-admin users
          }
        }
      } catch (err) {
        setError('Error al iniciar sesión');
        console.error(err);
      }
    } else {
      setError('Por favor, ingresa ambos campos.');
    }
  };


  // Función de inicio de sesión con Google
  
  const handleGoogleLogin = () => {
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    // Abre el popup para el login con Google
    const popup = window.open(
      'http://localhost:3000/auth/google',
      'google_login',
      `width=${width},height=${height},top=${top},left=${left}`
    );
  
    // Escucha los mensajes desde el popup
    const handleMessage = (event) => {
      if (event.origin !== 'http://localhost:3000') return; // Verificar la fuente
    
      const { accessToken, error } = event.data;
    
      if (accessToken) {
        localStorage.setItem('USER_TOKEN', accessToken); // Guardar el token
        popup.close(); // Cerrar la ventana emergente
        router.push('/'); // Redirigir al inicio
      } else if (error) {
        setError('Error al iniciar sesión con Google');
        popup.close(); // Cerrar la ventana si hay un error
      }
    };
  
    // Agregar el listener para escuchar los mensajes del popup
    window.addEventListener('message', handleMessage);
  
    // Asegúrate de remover el listener al desmontar el componente para evitar memory leaks
    return () => {
      window.removeEventListener('message', handleMessage);
    };
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
  <button onClick={handleGoogleLogin} className="google-login-button">
    Iniciar sesión con Google
  </button>
</div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
