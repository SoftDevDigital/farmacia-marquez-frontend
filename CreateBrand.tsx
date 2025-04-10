import { FC, useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';  // Para verificar el rol
import Header from '../components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

const CreateBrand: FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) {
      router.push('/login'); // Si no hay token, redirigir al login
      return;
    }

    try {
      const decodedToken = jwt_decode(token) as { role: string };
      if (decodedToken.role === 'ADMIN') {
        setIsAdmin(true); // Si el rol es ADMIN, habilitar la creación de marcas
      }
    } catch (err) {
      console.error('Error al verificar el rol', err);
      router.push('/login'); // Si no se puede decodificar el token, redirigir al login
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('USER_TOKEN');
    if (!token) {
      setError('No estás autenticado');
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:3000/brands',
        { name: brandName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.status === 201) {
        alert('Marca creada con éxito');
        router.push('/marcas'); // Redirigir a la lista de marcas
      } else {
        alert('Hubo un problema al crear la marca');
      }
    } catch (error) {
      console.error(error);
      alert('Error al crear la marca');
    }
  };

  if (!isAdmin) {
    return <p>Acceso restringido. Solo los administradores pueden crear marcas.</p>;
  }

  return (
    <div>
      <Header />
      <div className="create-brand-page">
        <h2>Crear Marca</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Nombre de la marca"
            required
          />
          <button type="submit">Crear Marca</button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateBrand;
