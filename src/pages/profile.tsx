import { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

const ProfilePage = () => {
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('USER_TOKEN');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decoded: any = jwt_decode(token);
      setUserData(decoded);
    } catch (err) {
      console.error('Error al decodificar el token', err);
    }
  }, []);

  return (
    <div className="profile-page">
      <Header onSearch={() => {}} />

      <main className="profile-container">
        <h1 className="profile-title">Mi perfil</h1>
        <p className="profile-description">Aquí podés ver y editar tu información personal.</p>

        {userData ? (
          <div className="profile-card">
            <div className="profile-info">
              <label>Nombre:</label>
              <span>{userData.firstName || '-'} {userData.lastName || '-'}</span>
            </div>
            <div className="profile-info">
              <label>Email:</label>
              <span>{userData.email}</span>
            </div>
            <div className="profile-info">
              <label>Rol:</label>
              <span>{userData.role}</span>
            </div>
          </div>
        ) : (
          <p className="loading-text">Cargando tus datos...</p>
        )}
      </main>

      <Footer />

      <style jsx>{`
        .profile-page {
          background-color: #fff;
          min-height: 100vh;
        }

        .profile-container {
          max-width: 800px;
          margin: 40px auto;
          padding: 2rem;
          background: #f9f9f9;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .profile-title {
          font-size: 2rem;
          font-weight: bold;
          color: #14b8a6;
          margin-bottom: 1rem;
        }

        .profile-description {
          font-size: 1rem;
          color: #374151;
          margin-bottom: 2rem;
        }

        .profile-card {
          background: white;
          border: 1px solid #ddd;
          padding: 1.5rem;
          border-radius: 8px;
        }

        .profile-info {
          margin-bottom: 1rem;
        }

        .profile-info label {
          font-weight: 600;
          display: block;
          color: #333;
          margin-bottom: 0.25rem;
        }

        .profile-info span {
          color: #555;
        }

        .loading-text {
          color: #666;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
