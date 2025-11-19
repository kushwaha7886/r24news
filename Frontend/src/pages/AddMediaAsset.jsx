import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FaImage, FaVideo, FaFile, FaLink, FaArrowLeft, FaFileAlt } from 'react-icons/fa';

const AddMediaAsset = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'Image',
    url: '',
    caption: '',
    article: ''
  });
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Remove empty article field to avoid ObjectId validation error
      const submitData = { ...formData };
      if (!submitData.article || submitData.article === '') {
        delete submitData.article;
      }

      const response = await api.post('/media-assets', submitData);
      if (response.status === 201) {
        navigate('/media-assets');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add media asset');
    } finally {
      setLoading(false);
    }
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
        return <FaVideo className="text-red-500 text-2xl" />;
      default:
        return <FaFile className="text-gray-500 text-2xl" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/media-assets')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Media Assets
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Media Asset</h1>
          <p className="text-gray-600">Upload or link a new media file to associate with articles</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media Type *
              </label>
              <div className="relative">
                <select
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Image">Image</option>
                  <option value="Video">Video</option>
                  <option value="Document">Document</option>
                  <option value="YouTube">YouTube</option>
                </select>
                <div className="absolute left-3 top-3">
                  {getTypeIcon(formData.type)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL *
              </label>
              <div className="relative">
                <FaLink className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="url"
                  name="url"
                  required
                  value={formData.url}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter media URL"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caption
              </label>
              <div className="relative">
                <FaFileAlt className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  name="caption"
                  rows={3}
                  value={formData.caption}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter media caption (optional)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Associated Article (Optional)
              </label>
              <select
                name="article"
                value={formData.article}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an article (optional)</option>
                {articles.map((article) => (
                  <option key={article._id} value={article._id}>
                    {article.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/media-assets')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding Media Asset...' : 'Add Media Asset'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMediaAsset;
