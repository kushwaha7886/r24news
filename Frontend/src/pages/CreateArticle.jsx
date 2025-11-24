import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AuthContext from '../context/AuthContext.jsx';
import { FaFileAlt, FaTags, FaImage, FaStar, FaArrowLeft, FaPlus, FaTrash, FaVideo, FaUser, FaLink } from 'react-icons/fa';

const CreateArticle = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: '',
    tags: '',
    featured: false
  });
  const [slug, setSlug] = useState('');
  const [manualSlug, setManualSlug] = useState('');
  const [slugMode, setSlugMode] = useState('auto'); // 'auto' or 'manual'
  const [media, setMedia] = useState([{ type: 'Image', file: null, url: '', caption: '' }]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Generate slug from title
    if (formData.title) {
      const generatedSlug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    } else {
      setSlug('');
    }
  }, [formData.title, slugMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleTagsChange = (e) => {
    setFormData({
      ...formData,
      tags: e.target.value
    });
  };

  const handleMediaChange = (index, field, value) => {
    const newMedia = [...media];
    // Clear conflicting fields
    if (field === 'file') {
      newMedia[index].url = '';
    } else if (field === 'url' && newMedia[index].type !== 'YouTube') {
      newMedia[index].file = null;
    }
    newMedia[index][field] = value;
    setMedia(newMedia);
  };

  const addMediaItem = () => {
    setMedia([...media, { type: 'Image', file: null, url: '', caption: '' }]);
  };

  const removeMediaItem = (index) => {
    if (media.length > 1) {
      setMedia(media.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      setLoading(false);
      return;
    }

    try {
      // Prepare data
      const dataToSend = {
        ...formData,
        slug: slugMode === 'auto' ? slug : manualSlug,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      const response = await api.post('/articles', dataToSend);

      if (response.status === 201) {
        const article = response.data.data;

        // Create media assets if any
        const validMedia = media.filter(item =>
          (item.type === 'YouTube' ? item.url.trim() !== '' : item.file && item.caption.trim() !== '')
        );

        if (validMedia.length > 0) {
          try {
            for (const item of validMedia) {
              if (item.type === 'YouTube') {
                // YouTube: send as JSON
                await api.post('/media-assets', {
                  type: 'YouTube',
                  url: item.url.trim(),
                  caption: item.caption.trim(),
                  article: article._id
                });
              } else {
                // Files: send as FormData
                const mediaFormData = new FormData();
                mediaFormData.append('file', item.file);
                mediaFormData.append('type', item.type);
                mediaFormData.append('caption', item.caption.trim());
                mediaFormData.append('article', article._id);

                await api.post('/media-assets', mediaFormData, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                });
              }
            }
          } catch (mediaError) {
            console.error('Error creating media assets:', mediaError);
            setError('Article created but some media assets failed to add');
            setTimeout(() => navigate('/articles'), 2000);
            return;
          }
        }

        navigate('/articles');
      }
    } catch (error) {
      console.error('Error creating article:', error);
      setError(error.response?.data?.error || 'Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Article</h1>
          <p className="text-gray-600">Write and publish your article</p>
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
                Title *
              </label>
              <div className="relative">
                <FaFileAlt className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter article title"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Slug
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSlugMode('auto');
                      setManualSlug('');
                      // Force regenerate slug immediately
                      if (formData.title) {
                        const generatedSlug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                        setSlug(generatedSlug);
                      }
                    }}
                    className={`px-3 py-1 text-xs rounded-md ${
                      slugMode === 'auto'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Auto Generate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSlugMode('manual');
                      if (!manualSlug && slug) {
                        setManualSlug(slug);
                      }
                    }}
                    className={`px-3 py-1 text-xs rounded-md ${
                      slugMode === 'manual'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Manual Edit
                  </button>
                </div>
              </div>
              <div className="relative">
                <FaLink className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={slugMode === 'auto' ? slug : manualSlug}
                  onChange={(e) => {
                    if (slugMode === 'manual') {
                      setManualSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, ''));
                    }
                  }}
                  onPaste={(e) => {
                    if (slugMode === 'auto') {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData('text').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
                      setManualSlug(pastedText);
                      setSlugMode('manual');
                    }
                  }}
                  readOnly={slugMode === 'auto'}
                  className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    slugMode === 'auto' ? 'bg-gray-50 text-gray-700' : 'bg-white'
                  }`}
                  placeholder={slugMode === 'auto' ? 'Slug will be generated from title' : 'Enter custom slug'}
                />
                <div className="mt-1 text-xs text-gray-500">
                  {slugMode === 'auto'
                    ? 'Slug is automatically generated from the title'
                    : 'Use lowercase letters, numbers, and hyphens only'}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Journalist (Auto-assigned)
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  readOnly
                  value={user ? user.fullName || user.email : 'Loading...'}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                  placeholder="Current logged-in user"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                name="content"
                rows={12}
                required
                value={formData.content}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your article content here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary
              </label>
              <textarea
                name="summary"
                rows={4}
                value={formData.summary}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief summary of the article (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              {categoriesLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Loading categories...
                </div>
              ) : (
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category (optional)</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="relative">
                <FaTags className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleTagsChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter tags separated by commas (e.g., tech, news, politics)"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 flex items-center">
                <FaStar className="mr-1 text-yellow-500" />
                Mark as featured article
              </label>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Media Assets (Optional)</h3>
                <button
                  type="button"
                  onClick={addMediaItem}
                  className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                >
                  <FaPlus className="mr-1" />
                  Add Media
                </button>
              </div>
              {media.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">Media {index + 1}</h4>
                    {media.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMediaItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Type
                    </label>
                    <select
                      value={item.type}
                      onChange={(e) => handleMediaChange(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="Image">Image</option>
                      <option value="Video">Video</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Document">Document</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {item.type === 'YouTube' ? 'YouTube URL' : 'Upload File'}
                    </label>
                    {item.type === 'YouTube' ? (
                      <input
                        type="url"
                        value={item.url}
                        onChange={(e) => handleMediaChange(index, 'url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept={
                            item.type === 'Image' ? 'image/*' :
                            item.type === 'Video' ? 'video/*' :
                            '.pdf,.doc,.docx,.txt,.xls,.xlsx'
                          }
                          onChange={(e) => handleMediaChange(index, 'file', e.target.files[0])}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        {item.file && (
                          <div className="text-xs text-green-600">
                            Selected: {item.file.name} ({(item.file.size / 1024 / 1024).toFixed(2)} MB)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Caption (Optional)
                    </label>
                    <input
                      type="text"
                      value={item.caption}
                      onChange={(e) => handleMediaChange(index, 'caption', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Media caption"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating Article...' : 'Create Article'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateArticle;
