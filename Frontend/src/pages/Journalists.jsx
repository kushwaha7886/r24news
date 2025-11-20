import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaBriefcase, FaFileAlt, FaCalendar, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const Journalists = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [journalists, setJournalists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJournalist, setSelectedJournalist] = useState(null);

  // Fetch journalists
  useEffect(() => {
    const fetchJournalists = async () => {
      try {
        const response = await api.get('/journalists');
        setJournalists(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error('Error fetching journalists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJournalists();
  }, []);

  const handleJournalistClick = (journalist) => {
    setSelectedJournalist(journalist);
  };

  const closeModal = () => {
    setSelectedJournalist(null);
  };

  const handleDeleteJournalist = async (journalistId) => {
    try {
      await api.delete(`/journalists/${journalistId}`);
      setJournalists(prev => prev.filter(journalist => journalist._id !== journalistId));
    } catch (error) {
      console.error('Error deleting journalist:', error);
      alert('Failed to delete journalist');
    }
  };

  const handleRoleChange = async (journalistId, newRole) => {
    try {
      await api.patch(`/users/${journalistId}/role`, { role: newRole });
      setJournalists(prev => prev.map(journalist =>
        journalist._id === journalistId ? { ...journalist, role: newRole } : journalist
      ));
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading journalists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Journalists</h1>
              <p className="text-lg text-gray-600">
                Meet the talented writers and reporters behind our stories
              </p>
            </div>
            {user && (user.userType === 'editor' || user.userType === 'admin') && (
              <button
                onClick={() => navigate('/add-journalist')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <FaPlus className="mr-2" />
                Add Journalist
              </button>
            )}
          </div>
        </div>

        {journalists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journalists.map((journalist) => (
              <div
                key={journalist._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleJournalistClick(journalist)}
              >
                {/* Profile Image */}
                <div className="h-48 bg-linera-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {journalist.profileImage ? (
                    <img
                      src={journalist.profileImage}
                      alt={journalist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-white text-6xl" />
                  )}
                </div>

                {/* Journalist Info */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {journalist.name}
                    </h3>
                    {user && user.userType === 'editor' && (
                      <div className="flex space-x-1">
                        <select
                          onChange={(e) => handleRoleChange(journalist._id, e.target.value)}
                          value={journalist.role}
                          className="text-xs border rounded px-1 py-0.5 mr-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="reader">Reader</option>
                          <option value="journalist">Journalist</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle edit journalist
                            navigate('/add-journalist', { state: { journalist } });
                          }}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Edit Journalist"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this journalist?')) {
                              // Handle delete journalist
                              handleDeleteJournalist(journalist._id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete Journalist"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {journalist.designation && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <FaBriefcase className="mr-2 text-blue-600" />
                      <span className="text-sm">{journalist.designation}</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-600 mb-3">
                    <FaEnvelope className="mr-2 text-blue-600" />
                    <span className="text-sm">{journalist.email}</span>
                  </div>

                  {journalist.bio && (
                    <p className="text-gray-700 text-sm line-clamp-3">
                      {journalist.bio}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaUser className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No journalists found
            </h3>
            <p className="text-gray-600">
              There are no journalists registered yet.
            </p>
          </div>
        )}

        {/* Journalist Detail Modal */}
        {selectedJournalist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedJournalist.name}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Profile Image */}
                  <div className="md:w-1/3">
                    <div className="w-full h-64 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      {selectedJournalist.profileImage ? (
                        <img
                          src={selectedJournalist.profileImage}
                          alt={selectedJournalist.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FaUser className="text-white text-8xl" />
                      )}
                    </div>
                  </div>

                  {/* Journalist Details */}
                  <div className="md:w-2/3 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <FaEnvelope className="mr-3 text-blue-600" />
                          <span>{selectedJournalist.email}</span>
                        </div>
                        {selectedJournalist.designation && (
                          <div className="flex items-center text-gray-600">
                            <FaBriefcase className="mr-3 text-blue-600" />
                            <span>{selectedJournalist.designation}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedJournalist.bio && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Biography</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {selectedJournalist.bio}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaCalendar className="mr-2" />
                        <span>Joined {new Date(selectedJournalist.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Journalists;
