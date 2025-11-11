import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FaImage, FaVideo, FaFile, FaDownload, FaEye, FaTrash } from 'react-icons/fa';

const MediaAssets = () => {
  const [mediaAssets, setMediaAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Fetch media assets
  useEffect(() => {
    const fetchMediaAssets = async () => {
      try {
        const response = await api.get('/media-assets');
        setMediaAssets(response.data.data || []);
      } catch (error) {
        console.error('Error fetching media assets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMediaAssets();
  }, []);

  const filteredMedia = mediaAssets.filter(asset => {
    if (filter === 'All') return true;
    return asset.type === filter;
  });

  const handleViewMedia = (media) => {
    setSelectedMedia(media);
  };

  const closeModal = () => {
    setSelectedMedia(null);
  };

  const handleDeleteMedia = async (mediaId) => {
    if (window.confirm('Are you sure you want to delete this media asset?')) {
      try {
        await api.delete(`/media-assets/${mediaId}`);
        setMediaAssets(prev => prev.filter(asset => asset._id !== mediaId));
        if (selectedMedia && selectedMedia._id === mediaId) {
          setSelectedMedia(null);
        }
      } catch (error) {
        console.error('Error deleting media:', error);
        alert('Failed to delete media asset');
      }
    }
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case 'Image':
        return <FaImage className="text-green-500 text-2xl" />;
      case 'Video':
        return <FaVideo className="text-blue-500 text-2xl" />;
      default:
        return <FaFile className="text-gray-500 text-2xl" />;
    }
  };

  const renderMediaPreview = (asset) => {
    if (asset.type === 'Image') {
      return (
        <img
          src={asset.url}
          alt={asset.caption || 'Media asset'}
          className="w-full h-48 object-cover rounded-lg"
        />
      );
    } else if (asset.type === 'Video') {
      return (
        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
          <FaVideo className="text-blue-500 text-4xl" />
        </div>
      );
    } else {
      return (
        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
          <FaFile className="text-gray-500 text-4xl" />
        </div>
      );
    }
  };

  if (loading) {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Media Assets</h1>
          <p className="text-lg text-gray-600">
            Browse and manage all media files associated with articles
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['All', 'Image', 'Video', 'Document'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {filteredMedia.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedia.map((asset) => (
              <div
                key={asset._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Media Preview */}
                <div className="relative">
                  {renderMediaPreview(asset)}
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      onClick={() => handleViewMedia(asset)}
                      className="bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
                      title="View details"
                    >
                      <FaEye className="text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleDeleteMedia(asset._id)}
                      className="bg-red-500 bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
                      title="Delete media"
                    >
                      <FaTrash className="text-white" />
                    </button>
                  </div>
                </div>

                {/* Media Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {getMediaIcon(asset.type)}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {asset.type}
                      </span>
                    </div>
                    {asset.article && (
                      <span className="text-xs text-gray-500">
                        Article: {asset.article.title?.substring(0, 20)}...
                      </span>
                    )}
                  </div>

                  {asset.caption && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {asset.caption}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </span>
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <FaDownload className="mr-1" />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaFile className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No media assets found
            </h3>
            <p className="text-gray-600">
              {filter === 'All'
                ? 'There are no media assets uploaded yet.'
                : `There are no ${filter.toLowerCase()} assets uploaded yet.`
              }
            </p>
          </div>
        )}

        {/* Media Detail Modal */}
        {selectedMedia && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Media Details
                    </h2>
                    <div className="flex items-center text-gray-600">
                      {getMediaIcon(selectedMedia.type)}
                      <span className="ml-2">{selectedMedia.type}</span>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Media Display */}
                <div className="mb-6">
                  {selectedMedia.type === 'Image' ? (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.caption || 'Media asset'}
                      className="w-full max-h-96 object-contain rounded-lg"
                    />
                  ) : selectedMedia.type === 'Video' ? (
                    <video
                      src={selectedMedia.url}
                      controls
                      className="w-full max-h-96 rounded-lg"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <FaFile className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <p className="text-gray-600">Document file</p>
                        <a
                          href={selectedMedia.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
                        >
                          Download File
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Media Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">File Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <span className="ml-2 text-gray-600">{selectedMedia.type}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Uploaded:</span>
                        <span className="ml-2 text-gray-600">
                          {new Date(selectedMedia.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {selectedMedia.caption && (
                        <div>
                          <span className="font-medium text-gray-700">Caption:</span>
                          <p className="ml-2 text-gray-600 mt-1">{selectedMedia.caption}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedMedia.article && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Associated Article</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {selectedMedia.article.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Status: {selectedMedia.article.status}
                        </p>
                        <p className="text-sm text-gray-600">
                          Published: {selectedMedia.article.publishDate
                            ? new Date(selectedMedia.article.publishDate).toLocaleDateString()
                            : 'Not published'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                  <a
                    href={selectedMedia.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <FaDownload className="mr-2" />
                    Download
                  </a>
                  <button
                    onClick={() => handleDeleteMedia(selectedMedia._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                  >
                    <FaTrash className="mr-2" />
                    Delete
                  </button>
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
