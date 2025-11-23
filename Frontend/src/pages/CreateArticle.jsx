 import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';


import api from '../utils/api';
import { FaPlus, FaImage, FaVideo, FaFile } from 'react-icons/fa';

const CreateArticle = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: '',
    tags: '',
    status: user?.userType === 'editor' ? 'Published' : 'Pending Approval',
    journalist: ''
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [youtubeLinks, setYoutubeLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [journalists, setJournalists] = useState([]);

  // Fetch categories and journalists on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, journalistsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/journalists')
        ]);

        setCategories(Array.isArray(categoriesRes.data.data) ? categoriesRes.data.data : []);
        setJournalists(Array.isArray(journalistsRes.data.data) ? journalistsRes.data.data : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMediaFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleYoutubeLinkAdd = () => {
    const link = prompt('Enter YouTube video URL:');
    if (link && link.trim()) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      if (youtubeRegex.test(link.trim())) {
        setYoutubeLinks(prev => [...prev, { url: link.trim(), caption: '' }]);
      } else {
        alert('Please enter a valid YouTube URL.');
      }
    }
  };

  const removeYoutubeLink = (index) => {
    setYoutubeLinks(prev => prev.filter((_, i) => i !== index));
  };

  const updateYoutubeCaption = (index, caption) => {
    setYoutubeLinks(prev => prev.map((link, i) => i === index ? { ...link, caption } : link));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to create an article');
      return;
    }

    setLoading(true);
    try {
      // Create article data - remove status from formData for users, let backend handle it
      const articleData = {
        title: formData.title,
        content: formData.content,
        summary: formData.summary,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        journalist: formData.journalist,
        // Only include status if user is editor
        ...(user?.userType === 'editor' && { status: formData.status })
      };

      console.log('Sending article data:', articleData);

      // Create article first
      const articleResponse = await api.post('/articles', articleData);
      const articleId = articleResponse.data.data._id;

      console.log('Article created:', articleResponse.data);

      // Upload media files if any
      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const mediaFormData = new FormData();
          mediaFormData.append('file', file); // Send the actual file
          mediaFormData.append('caption', file.name);
          mediaFormData.append('article', articleId);

          await api.post('/media-assets', mediaFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      }

      // Upload YouTube links if any
      if (youtubeLinks.length > 0) {
        for (const link of youtubeLinks) {
          const mediaData = {
            type: 'YouTube',
            url: link.url,
            caption: link.caption || link.url,
            article: articleId
          };

          await api.post('/media-assets', mediaData);
        }
      }

      navigate(`/articles/${articleId}`);
    } catch (error) {
      console.error('Error creating article:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create article. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please login to create articles.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <FaPlus className="text-blue-600 text-2xl mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Create New Article</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter article title"
              />
            </div>

            {/* Summary */}
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                Summary
              </label>
              <textarea
                id="summary"
                name="summary"
                rows={3}
                value={formData.summary}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief summary of the article"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                rows={10}
                required
                value={formData.content}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your article content here..."
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tags separated by commas"
              />
            </div>

            {/* Journalist */}
            <div>
              <label htmlFor="journalist" className="block text-sm font-medium text-gray-700 mb-2">
                Journalist *
              </label>
              <select
                id="journalist"
                name="journalist"
                required
                value={formData.journalist}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a journalist</option>
                {journalists.map(journalist => (
                  <option key={journalist._id} value={journalist._id}>
                    {journalist.fullName} {journalist.designation ? `(${journalist.designation})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Status - Only show for editors */}
            {user?.userType === 'editor' && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            )}

            {/* Status display for regular users */}
            {user?.userType !== 'editor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                  Pending Approval
                </div>
                <p className="text-xs text-gray-500 mt-1">Your article will be reviewed by an editor before publication.</p>
              </div>
            )}

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media Files
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <FaImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="flex text-sm text-gray-600 justify-center space-x-4">
                    <label htmlFor="media-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 px-3 py-1">
                      <span>Upload files</span>
                      <input
                        id="media-upload"
                        name="media-upload"
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        onChange={handleMediaUpload}
                        className="sr-only"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleYoutubeLinkAdd}
                      className="bg-red-600 text-white rounded-md font-medium hover:bg-red-700 px-3 py-1"
                    >
                      Add YouTube Link
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF, MP4, PDF, DOC up to 10MB each, or YouTube links</p>
                </div>
              </div>

              {/* Display selected files */}
              {mediaFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center">
                        {file.type.startsWith('image/') && <FaImage className="text-green-500 mr-2" />}
                        {file.type.startsWith('video/') && <FaVideo className="text-blue-500 mr-2" />}
                        {!file.type.startsWith('image/') && !file.type.startsWith('video/') && <FaFile className="text-gray-500 mr-2" />}
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMediaFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Display YouTube links */}
              {youtubeLinks.length > 0 && (
                <div className="mt-4 space-y-2">
                  {youtubeLinks.map((link, index) => (
                    <div key={index} className="flex items-center justify-between bg-red-50 p-3 rounded-md">
                      <div className="flex items-center flex-1">
                        <FaVideo className="text-red-500 mr-2" />
                        <div className="flex-1">
                          <span className="text-sm text-gray-700 block">{link.url}</span>
                          <input
                            type="text"
                            placeholder="Add caption (optional)"
                            value={link.caption}
                            onChange={(e) => updateYoutubeCaption(index, e.target.value)}
                            className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeYoutubeLink(index)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/articles')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Article'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateArticle;
