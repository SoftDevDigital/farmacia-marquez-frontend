import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import Header from '../components/Header';
import Footer from '@/components/Footer';
import { FiEye, FiEyeOff } from 'react-icons/fi';


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
        const response = await axios.post('http://localhost:3003/auth/login', {
          email: email,
          password: password,
        });

        if (response.data && response.data.accessToken) {
          localStorage.setItem('USER_TOKEN', response.data.accessToken);

          const decodedToken = jwt_decode(response.data.accessToken) as { role: string };

          if (decodedToken.role === 'ADMIN') {
            router.push('/');
          } else {
            router.push('/');
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
    window.open(
      'http://localhost:3003/auth/google',
      'google_login',
      `width=${width},height=${height},top=${top},left=${left}`
    );
  };

  // Escuchar mensajes del popup de Google
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'http://localhost:3003') return; // Verificar la fuente

      const { accessToken, redirectUrl, error } = event.data;

      if (accessToken) {
        localStorage.setItem('USER_TOKEN', accessToken); // Guardar el token
        if (redirectUrl) {
          window.location.href = redirectUrl; // Redirigir a la URL proporcionada
        } else {
          setError('No se recibió una URL de redirección del backend');
        }
      } else if (error) {
        setError('Error al iniciar sesión con Google');
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

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
  className="password-toggle-icon"
  aria-label="Mostrar/Ocultar contraseña"
>
  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
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