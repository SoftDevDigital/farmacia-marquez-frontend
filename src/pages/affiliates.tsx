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
  const [affiliateToDelete, setAffiliateToDelete] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [dniError, setDniError] = useState<string | null>(null);
  const [birthDateError, setBirthDateError] = useState<string | null>(null);


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
        const response = await axios.get('https://api.farmaciamarquezcity.com/affiliates', {
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

  const handleEditAffiliate = (affiliateId: string) => {
    const affiliateToEdit = affiliates.find((affiliate) => affiliate._id === affiliateId);
    if (affiliateToEdit) {
      // Asegurar formato YYYY-MM-DD
      const formattedDate = affiliateToEdit.birthDate
        ? new Date(affiliateToEdit.birthDate).toISOString().split('T')[0]
        : '';
  
      setAffiliateData({
        ...affiliateToEdit,
        birthDate: formattedDate,
      });
  
      setEditingAffiliateId(affiliateId);
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
        `https://api.farmaciamarquezcity.com/affiliates/${editingAffiliateId}`,
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
        `https://api.farmaciamarquezcity.com/affiliates/${affiliateId}`,
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
  const handleCreateAffiliate = async (e: React.FormEvent) => {
  e.preventDefault();
  const token = localStorage.getItem('USER_TOKEN');
  if (!token) {
    setError('No estás autenticado');
    return;
  }

  try {
    const response = await axios.post(
      'https://api.farmaciamarquezcity.com/affiliates',
      affiliateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 201 || response.status === 200) {
      alert('Afiliado creado con éxito');
      setAffiliates([...affiliates, response.data]);
      setAffiliateData({  // limpiar formulario
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
      });
    } else {
      alert('Error al crear el afiliado');
    }
 } catch (err: any) {
  console.error(err);

  const backendMessage = err?.response?.data?.message;

  // Limpia errores anteriores
  setDniError(null);
  setBirthDateError(null);

  if (backendMessage?.includes('DNI')) {
    setDniError(backendMessage);
  } else if (backendMessage?.includes('mayor de 18 años')) {
    setBirthDateError(backendMessage);
  } else {
    setError('Hubo un error al crear el afiliado');
  }
}
};

  return (
    <div>
      <Header onSearch={() => {}} />
      <div className="affiliates-page">
        <h1>Afiliados</h1>
        {error && <p>{error}</p>}
        {isAdmin && (
          <div className="create-affiliate-form">
            <h2>{editingAffiliateId ? 'Editar Afiliado' : 'Crear Nuevo Afiliado'}</h2>
            <form onSubmit={editingAffiliateId ? handleUpdateAffiliate : handleCreateAffiliate}>
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
    onChange={(e) => {
      setAffiliateData({ ...affiliateData, dni: e.target.value });
      setDniError(null); // limpia el error al modificar
    }}
    required
  />
  {dniError && <p style={{ color: 'red', marginTop: '4px' }}>{dniError}</p>}
</div>
              <div>
  <label>Fecha de nacimiento</label>
  <input
    type="date"
    value={affiliateData.birthDate}
    onChange={(e) => {
      setAffiliateData({ ...affiliateData, birthDate: e.target.value });
      setBirthDateError(null); // limpia error al escribir
    }}
    required
  />
  {birthDateError && <p style={{ color: 'red', marginTop: '4px' }}>{birthDateError}</p>}
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
              <button className="btn btn-buy" type="submit">
  {editingAffiliateId ? 'Actualizar Afiliado' : 'Crear Afiliado'}
</button>
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
                <button className="btn btn-buy" onClick={() => handleEditAffiliate(affiliate._id)}>Editar</button>
                <button className="btn btn-buy" onClick={() => setAffiliateToDelete(affiliate._id)}>
  Eliminar
</button>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay afiliados disponibles</p>
        )}
      </div>

{affiliateToDelete && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>¿Eliminar afiliado?</h2>
      <p>Esta acción no se puede deshacer.</p>
      <div className="modal-buttons">
        <button
          className="btn btn-delete"
          onClick={async () => {
            const token = localStorage.getItem('USER_TOKEN');
            try {
              const response = await axios.delete(
                `https://api.farmaciamarquezcity.com/affiliates/${affiliateToDelete}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.status === 200) {
                setAffiliates(affiliates.filter((a) => a._id !== affiliateToDelete));
                setShowSuccessMessage(true);
                setTimeout(() => setShowSuccessMessage(false), 3000);
              } else {
                alert('Hubo un problema al eliminar el afiliado');
              }
            } catch (err) {
              console.error(err);
              alert('Error al eliminar el afiliado');
            } finally {
              setAffiliateToDelete(null);
            }
          }}
        >
          Sí, eliminar
        </button>
        <button
          className="btn btn-buy"
          onClick={() => setAffiliateToDelete(null)}
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}

      <Footer />
    </div>
  );
};

export default AffiliatesPage;
