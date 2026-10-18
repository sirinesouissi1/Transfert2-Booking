// pages/admin/AdminVehicules.jsx
import { useState, useEffect } from 'react';
import { vehicleAPI } from '../../services/api'; // à créer
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

export default function AdminVehicules() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await vehicleAPI.getAll();
      setVehicles(res.data.vehicles || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce véhicule ?')) {
      try {
        await vehicleAPI.delete(id);
        fetchVehicles();
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const openModal = (vehicle = null) => {
    setEditing(vehicle);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-light">Véhicules</h1>
        <button onClick={() => openModal()} className="btn-gold flex items-center gap-2">
          <FiPlus /> Nouveau véhicule
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <div key={v._id} className="bg-dark-2 border border-white/5 p-4">
              <img src={v.image} alt={v.name} className="h-32 w-full object-contain mb-4" />
              <h3 className="font-serif text-xl">{v.name}</h3>
              <p className="text-muted text-sm mb-2">{v.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-gold font-bold">{v.price}€</span>
                <div className="flex gap-2">
                  <button onClick={() => openModal(v)} className="p-2 text-muted hover:text-gold">
                    <FiEdit2 />
                  </button>
                  <button onClick={() => handleDelete(v._id)} className="p-2 text-muted hover:text-red-400">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal pour ajouter/éditer (à implémenter selon vos besoins) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-dark-2 p-6 w-full max-w-md">
            <h2 className="text-xl mb-4">{editing ? 'Éditer' : 'Ajouter'} un véhicule</h2>
            {/* Formulaire */}
            <button onClick={() => setShowModal(false)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}