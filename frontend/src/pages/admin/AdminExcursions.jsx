// pages/admin/AdminExcursions.jsx
import { useState, useEffect } from 'react';
import { excursionAPI } from '../../services/api';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function AdminExcursions() {
  const [excursions, setExcursions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExcursions();
  }, []);

  const fetchExcursions = async () => {
    try {
      const res = await excursionAPI.getAll({ limit: 100 }); // tous
      setExcursions(res.data.excursions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette excursion ?')) {
      try {
        await excursionAPI.delete(id);
        fetchExcursions();
      } catch (error) {
        alert('Erreur');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-light">Excursions</h1>
        <Link to="/admin/excursions/nouveau" className="btn-gold flex items-center gap-2">
          <FiPlus /> Nouvelle excursion
        </Link>
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : (
        <table className="w-full bg-dark-2 border border-white/5">
          <thead>
            <tr className="border-b border-white/5">
              <th className="p-4 text-left">Nom</th>
              <th className="p-4 text-left">Destination</th>
              <th className="p-4 text-left">Prix</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {excursions.map((e) => (
              <tr key={e._id} className="border-b border-white/5">
                <td className="p-4">{e.name}</td>
                <td className="p-4">{e.destination}</td>
                <td className="p-4">{e.pricePerPerson} TND</td>
                <td className="p-4">
                  <Link to={`/admin/excursions/${e._id}`} className="text-gold hover:underline mr-4">
                    <FiEdit2 className="inline" />
                  </Link>
                  <button onClick={() => handleDelete(e._id)} className="text-red-400">
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}