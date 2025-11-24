import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AuthContext from '../context/AuthContext.jsx';
import { FaImage, FaVideo, FaFile, FaLink, FaEdit, FaTrash, FaPlus, FaEye, FaFilter } from 'react-icons/fa';

const MediaAssets = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Debug logging
  console.log('🔍 MediaAssets Debug:', {
    user: user,
    userType: user?.userType,
    userRole: user?.role,
    isLoggedIn: !!user,
    isAdmin: user?.userType === 'admin',
    isEditor: user?.userType === 'editor'
  });
  const [mediaAssets, setMediaAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    type: '',
    article: ''
  });
  const [articles, setArticles] = useState([]);
  

  // Fetch media assets
  useEffect(() => {
    const fetchMediaAssets = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '12'
        });

        if (filters.type) params.append('type', filters.type);
        if (filters.article) params.append('article', filters.article);

        const response = await api.get(`/media-assets?${params}`);
        setMediaAssets(response.data.data || []);
        setTotal(response.data.total || 0);
        setTotalPages(Math.ceil((response.data.total || 0) / 12));
      } catch (error) {
        console.error('Error fetching media assets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMediaAssets();
  }, [page, filters]);

  // Fetch articles for filter dropdown
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await api.get('/articles');
        setArticles(response.data.data || []);
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };

    fetchArticles();
  }, []);

  const handleAssetClick = (asset) => {
    setSelectedAsset(asset);
  };

  const closeModal = () => {
    setSelectedAsset(null);
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm('Are you sure you want to delete this media asset?')) return;

    try {
      await api.delete(`/media-assets/${assetId}`);
      setMediaAssets(prev => prev.filter(asset => asset._id !== assetId));
      setTotal(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting media asset:', error);
      alert('Failed to delete media asset');
    }
  };

  const handleEditAsset = (asset) => {
    // Navigate to edit page or open edit modal
    navigate('/add-media-asset', { state: { asset } });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // Reset to first page when filtering
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Image':
        return <FaImage className="text-green-500 text-2xl" />;
      case 'Video':
        return <FaVideo className="text-blue-500 text-2xl" />;
      case 'Document':
        return <FaFile className="text-gray-500 text-2xl" />;
      case 'YouTube':
        return <FaLink className="text-red-500 text-2xl" />;
      default:
        return <FaFile className="text-gray-500 text-2xl" />;
    }
  };

  const renderAssetPreview = (asset) => {
    switch (asset.type) {
      case 'Image':
        return (
          <img
            src={asset.url}
            alt={asset.caption || 'Media asset'}
            className="w-full h-full object-cover"
          />
        );
      case 'Video':
        return (
          <video
            src={asset.url}
            className="w-full h-full object-cover"
            controls={false}
          />
        );
      case 'YouTube': {
        const videoId = asset.url.split('v=')[1]?.split('&')[0];
        return (
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={asset.caption || 'YouTube video'}
            className="w-full h-full object-cover"
          />
        );
      }
      default:
        return (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <FaFile className="text-gray-400 text-4xl" />
          </div>
        );
    }
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading media assets...</p>
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
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Media Assets</h1>
              <p className="text-lg text-gray-600">
                Manage images, videos, documents, and YouTube links
              </p>
            </div>
            {user && (user.role === 'editor' || user.role === 'admin') && (
              <button
                onClick={() => navigate('/add-media-asset')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <FaPlus className="mr-2" />
                Add Media Asset
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <FaFilter className="text-gray-500" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="Image">Image</option>
                <option value="Video">Video</option>
                <option value="Document">Document</option>
                <option value="YouTube">YouTube</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Article</label>
              <select
                name="article"
                value={filters.article}
                onChange={handleFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Articles</option>
                {articles.map((article) => (
                  <option key={article._id} value={article._id}>
                    {article.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {mediaAssets.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mediaAssets.map((asset) => (
                <div
                  key={asset._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Asset Preview */}
                  <div className="h-48 bg-gray-100 relative">
                    {renderAssetPreview(asset)}
                    <div className="absolute top-2 left-2">
                      {getTypeIcon(asset.type)}
                    </div>
                  </div>

                  {/* Asset Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {asset.caption || `${asset.type} Asset`}
                      </h3>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => handleAssetClick(asset)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        {user && (user.role === 'admin' || user.role === 'editor') && (
                          <>
                            <button
                              onClick={() => handleEditAsset(asset)}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Edit Asset"
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAsset(asset._id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Delete Asset"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      Type: {asset.type}
                    </p>

                    {asset.article && (
                      <p className="text-sm text-gray-600">
                        Article: {asset.article.title}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 border rounded-md ${
                        page === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 text-center text-gray-600">
              Showing {mediaAssets.length} of {total} media assets
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <FaImage className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No media assets found
            </h3>
            <p className="text-gray-600">
              {filters.type || filters.article ? 'Try adjusting your filters.' : 'There are no media assets uploaded yet.'}
            </p>
          </div>
        )}

        {/* Asset Detail Modal */}
        {selectedAsset && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedAsset.caption || `${selectedAsset.type} Asset`}
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

                <div className="space-y-6">
                  {/* Asset Preview */}
                  <div className="bg-gray-100 rounded-lg overflow-hidden">
                    {selectedAsset.type === 'Image' && (
                      <img
                        src={selectedAsset.url}
                        alt={selectedAsset.caption || 'Media asset'}
                        className="w-full max-h-96 object-contain"
                      />
                    )}
                    {selectedAsset.type === 'Video' && (
                      <video
                        src={selectedAsset.url}
                        controls
                        className="w-full max-h-96"
                      />
                    )}
                    {selectedAsset.type === 'YouTube' && (
                      <iframe
                        src={`https://www.youtube.com/embed/${selectedAsset.url.split('v=')[1]?.split('&')[0]}`}
                        title={selectedAsset.caption || 'YouTube video'}
                        className="w-full h-96"
                        allowFullScreen
                      />
                    )}
                    {selectedAsset.type === 'Document' && (
                      <div className="p-8 text-center">
                        <FaFile className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">Document Preview</p>
                        <a
                          href={selectedAsset.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Open Document
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Asset Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          {getTypeIcon(selectedAsset.type)}
                          <span className="ml-3 text-gray-700">Type: {selectedAsset.type}</span>
                        </div>
                        <div className="flex items-center">
                          <FaLink className="text-gray-400 mr-3" />
                          <a
                            href={selectedAsset.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 truncate"
                          >
                            {selectedAsset.url}
                          </a>
                        </div>
                        {selectedAsset.article && (
                          <div className="flex items-center">
                            <FaFile className="text-gray-400 mr-3" />
                            <span className="text-gray-700">Article: {selectedAsset.article.title}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <span>Created: {new Date(selectedAsset.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <span>Updated: {new Date(selectedAsset.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {user && (user.role === 'admin' || user.role === 'editor') && (
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => {
                          closeModal();
                          handleEditAsset(selectedAsset);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Edit Asset
                      </button>
                      <button
                        onClick={() => {
                          closeModal();
                          handleDeleteAsset(selectedAsset._id);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Delete Asset
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaAssets;
