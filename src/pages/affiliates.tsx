import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AffiliatesPage = () => {
  const [affiliates, setAffiliates] = useState<any[]>([]); // Estado para almacenar los afiliados
  const [error, setError] = useState<string>(''); // Para manejar errores
  const [affiliateData, setAffiliateData] = useState<any>({
    firstName: '',
    lastName: '',
    dni: '',
    birthDate: '',
    gender: '',
    phoneNumber: '',
    email: '',
    address: {
      street: '',
      streetNumber: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      apartment: '',
    },
    healthInsurance: {
      name: '',
      affiliateNumber: '',
      plan: '',
    },
  }); // Datos para actualizar un afiliado
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [editingAffiliateId, setEditingAffiliateId] = useState<string | null>(null); // ID del afiliado que estamos editando
  const router = useRouter();

  useEffect(() => {
    const fetchAffiliates = async () => {
      const token = localStorage.getItem('USER_TOKEN');
      if (!token) {
        setError('No estás autenticado');
        router.push('/login');
        return;
      }

      try {
        // Verificar si el rol del usuario es ADMIN
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        if (decodedToken.role !== 'ADMIN') {
          setError('No tienes permisos para acceder a esta página');
          router.push('/');
          return;
        }
        setIsAdmin(true);

        // Realizamos la solicitud para obtener los afiliados
        const response = await axios.get('http://localhost:3000/affiliates', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setAffiliates(response.data); // Guardar los afiliados
        } else {
          setError('Error al obtener los afiliados');
        }
      } catch (err) {
        setError('Hubo un error al obtener los afiliados');
        console.error(err);
      }
    };

    fetchAffiliates();
  }, [router]);

  // Función para manejar la selección de un afiliado para editar
  const handleEditAffiliate = (affiliateId: string) => {
    const affiliateToEdit = affiliates.find((affiliate) => affiliate._id === affiliateId);
    if (affiliateToEdit) {
      setAffiliateData(affiliateToEdit);
      setEditingAffiliateId(affiliateId); // Establecer el ID del afiliado a editar
    }
  };

  // Función para manejar el envío del formulario de actualización de afiliado
  const handleUpdateAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('USER_TOKEN');
    if (!token) {
      setError('No estás autenticado');
      return;
    }

    if (!editingAffiliateId) {
      setError('No se ha seleccionado un afiliado para editar');
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:3000/affiliates/${editingAffiliateId}`,
        affiliateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        alert('Afiliado actualizado con éxito');
        setAffiliates(
          affiliates.map((affiliate) =>
            affiliate._id === editingAffiliateId ? response.data : affiliate
          )
        );
        setAffiliateData({
          firstName: '',
          lastName: '',
          dni: '',
          birthDate: '',
          gender: '',
          phoneNumber: '',
          email: '',
          address: {
            street: '',
            streetNumber: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
            apartment: '',
          },
          healthInsurance: {
            name: '',
            affiliateNumber: '',
            plan: '',
          },
        }); // Limpiar el formulario después de actualizar el afiliado
        setEditingAffiliateId(null); // Limpiar el ID del afiliado a editar
      } else {
        alert('Hubo un problema al actualizar el afiliado');
      }
    } catch (err) {
      console.error(err);
      setError('Error al actualizar el afiliado');
    }
  };

  const handleDeleteAffiliate = async (affiliateId: string) => {
    const token = localStorage.getItem('USER_TOKEN');
    if (!token) {
      setError('No estás autenticado');
      return;
    }
  
    try {
      const response = await axios.delete(
        `http://localhost:3000/affiliates/${affiliateId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 200) {
        alert('Afiliado eliminado con éxito');
        setAffiliates(affiliates.filter((affiliate) => affiliate._id !== affiliateId));
      } else {
        alert('Hubo un problema al eliminar el afiliado');
      }
    } catch (err) {
      console.error(err);
      setError('Error al eliminar el afiliado');
    }
  };

  return (
    <div>
      <Header />
      <div className="affiliates-page">
        <h1>Afiliados</h1>
        {error && <p>{error}</p>}
        {isAdmin && (
          <div className="create-affiliate-form">
            <h2>{editingAffiliateId ? 'Editar Afiliado' : 'Crear Nuevo Afiliado'}</h2>
            <form onSubmit={handleUpdateAffiliate}>
              <div>
                <label>Nombre</label>
                <input
                  type="text"
                  value={affiliateData.firstName}
                  onChange={(e) =>
                    setAffiliateData({ ...affiliateData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Apellido</label>
                <input
                  type="text"
                  value={affiliateData.lastName}
                  onChange={(e) =>
                    setAffiliateData({ ...affiliateData, lastName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>DNI</label>
                <input
                  type="text"
                  value={affiliateData.dni}
                  onChange={(e) =>
                    setAffiliateData({ ...affiliateData, dni: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Fecha de nacimiento</label>
                <input
                  type="date"
                  value={affiliateData.birthDate}
                  onChange={(e) =>
                    setAffiliateData({ ...affiliateData, birthDate: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Género</label>
                <input
                  type="text"
                  value={affiliateData.gender}
                  onChange={(e) =>
                    setAffiliateData({ ...affiliateData, gender: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Teléfono</label>
                <input
                  type="text"
                  value={affiliateData.phoneNumber}
                  onChange={(e) =>
                    setAffiliateData({ ...affiliateData, phoneNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Correo electrónico</label>
                <input
                  type="email"
                  value={affiliateData.email}
                  onChange={(e) =>
                    setAffiliateData({ ...affiliateData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Dirección</label>
                <input
                  type="text"
                  value={affiliateData.address.street}
                  onChange={(e) =>
                    setAffiliateData({
                      ...affiliateData,
                      address: { ...affiliateData.address, street: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div>
                <label>Número de calle</label>
                <input
                  type="text"
                  value={affiliateData.address.streetNumber}
                  onChange={(e) =>
                    setAffiliateData({
                      ...affiliateData,
                      address: { ...affiliateData.address, streetNumber: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div>
                <label>Ciudad</label>
                <input
                  type="text"
                  value={affiliateData.address.city}
                  onChange={(e) =>
                    setAffiliateData({
                      ...affiliateData,
                      address: { ...affiliateData.address, city: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div>
                <label>Estado</label>
                <input
                  type="text"
                  value={affiliateData.address.state}
                  onChange={(e) =>
                    setAffiliateData({
                      ...affiliateData,
                      address: { ...affiliateData.address, state: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div>
                <label>Código postal</label>
                <input
                  type="text"
                  value={affiliateData.address.postalCode}
                  onChange={(e) =>
                    setAffiliateData({
                      ...affiliateData,
                      address: { ...affiliateData.address, postalCode: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div>
                <label>País</label>
                <input
                  type="text"
                  value={affiliateData.address.country}
                  onChange={(e) =>
                    setAffiliateData({
                      ...affiliateData,
                      address: { ...affiliateData.address, country: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div>
                <label>Seguro de Salud</label>
                <input
                  type="text"
                  value={affiliateData.healthInsurance.name}
                  onChange={(e) =>
                    setAffiliateData({
                      ...affiliateData,
                      healthInsurance: { ...affiliateData.healthInsurance, name: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div>
                <label>Número de afiliado</label>
                <input
                  type="text"
                  value={affiliateData.healthInsurance.affiliateNumber}
                  onChange={(e) =>
                    setAffiliateData({
                      ...affiliateData,
                      healthInsurance: { ...affiliateData.healthInsurance, affiliateNumber: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <button type="submit">Actualizar Afiliado</button>
            </form>
          </div>
        )}

        {affiliates.length > 0 ? (
          <div className="affiliates-list">
            {affiliates.map((affiliate) => (
              <div key={affiliate._id} className="affiliate-card">
                <h3>{affiliate.firstName} {affiliate.lastName}</h3>
                <p>Email: {affiliate.email}</p>
                <p>Teléfono: {affiliate.phoneNumber}</p>
                <p>Dirección: {affiliate.address.street}, {affiliate.address.city}</p>
                <button onClick={() => handleEditAffiliate(affiliate._id)}>Editar</button>
                <button onClick={() => handleDeleteAffiliate(affiliate._id)}>Eliminar</button>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay afiliados disponibles</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AffiliatesPage;
