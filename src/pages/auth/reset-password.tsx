import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './reset-password.module.css'; // Importa el archivo CSS

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const query = new URLSearchParams(window.location.search);
      const tokenFromUrl = query.get('token');
      setToken(tokenFromUrl);
    }
  }, []);

  if (!token) {
    return <p className={styles.errorMessage}>No se ha encontrado un token válido en la URL.</p>;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3003/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Contraseña restablecida exitosamente.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setMessage(data.message || 'Error al restablecer la contraseña.');
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.resetPasswordPage}>
        <h2 className={styles.title}>Restablecer contraseña</h2>
        <p classIng={styles.description}>
          Ingresa tu nueva contraseña para restablecerla.
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Nueva contraseña:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={styles.input}
            />
          </div>
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Cargando...' : 'Restablecer contraseña'}
          </button>
        </form>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default ResetPasswordPage;