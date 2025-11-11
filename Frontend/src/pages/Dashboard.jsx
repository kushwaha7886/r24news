import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { FaNewspaper, FaUsers, FaImage, FaBroadcastTower, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    articles: 0,
    users: 0,
    mediaAssets: 0,
    broadcasts: 0
  });
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [articlesRes, usersRes, mediaRes, broadcastsRes] = await Promise.all([
          api.get('/articles'),
          api.get('/users'), // This might need admin access
          api.get('/media-assets'),
          api.get('/broadcasts')
        ]);

        setStats({
          articles: articlesRes.data.total || articlesRes.data.length || 0,
          users: usersRes.data.total || usersRes.data.length || 0,
          mediaAssets: mediaRes.data.total || mediaRes.data.length || 0,
          broadcasts: broadcastsRes.data.total || broadcastsRes.data.length || 0
        });

        // Get recent articles
        const articles = articlesRes.data.data || articlesRes.data;
        setRecentArticles(articles.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default values if API calls fail
        setStats({
          articles: 0,
          users: 0,
          mediaAssets: 0,
          broadcasts: 0
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleCreateArticle = () => {
    navigate('/articles/new');
  };

  const handleEditArticle = (articleId) => {
    navigate(`/edit-article/${articleId}`);
  };

  const handleDeleteArticle = async (articleId) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await api.delete(`/articles/${articleId}`);
        setRecentArticles(prev => prev.filter(article => article._id !== articleId));
        setStats(prev => ({ ...prev, articles: prev.articles - 1 }));
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('Failed to delete article');
      }
    }
  };

  const handleViewArticle = (articleId) => {
    navigate(`/articles/${articleId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please login to access the dashboard.</p>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">
            Welcome back, {user.fullName || user.username}! Here's an overview of your content.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaNewspaper className="text-blue-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Articles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.articles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <FaUsers className="text-green-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <FaImage className="text-purple-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Media Assets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.mediaAssets}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <FaBroadcastTower className="text-orange-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Broadcasts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.broadcasts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleCreateArticle}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <FaPlus className="mr-2" />
              Create Article
            </button>
            <button
              onClick={() => navigate('/articles')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
            >
              <FaNewspaper className="mr-2" />
              View All Articles
            </button>
            <button
              onClick={() => navigate('/media-assets')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
            >
              <FaImage className="mr-2" />
              Manage Media
            </button>
            <button
              onClick={() => navigate('/broadcasts')}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center"
            >
              <FaBroadcastTower className="mr-2" />
              View Broadcasts
            </button>
            <button
              onClick={() => navigate('/categories')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <FaNewspaper className="mr-2" />
              Manage Categories
            </button>
            <button
              onClick={() => navigate('/journalists')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <FaUsers className="mr-2" />
              View Journalists
            </button>
          </div>
        </div>

        {/* Recent Articles */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Articles</h2>
            <button
              onClick={() => navigate('/articles')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </button>
          </div>

          {recentArticles.length > 0 ? (
            <div className="space-y-4">
              {recentArticles.map((article) => (
                <div
                  key={article._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{article.title}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        article.status === 'Published'
                          ? 'bg-green-100 text-green-800'
                          : article.status === 'Draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {article.status}
                      </span>
                      <span className="ml-4">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewArticle(article._id)}
                      className="text-blue-600 hover:text-blue-800 p-2"
                      title="View Article"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEditArticle(article._id)}
                      className="text-green-600 hover:text-green-800 p-2"
                      title="Edit Article"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(article._id)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Delete Article"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaNewspaper className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No articles yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start creating your first article to see it here.
              </p>
              <button
                onClick={handleCreateArticle}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Your First Article
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
