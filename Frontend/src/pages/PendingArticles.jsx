import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { FaEye, FaCheck, FaTimes, FaCalendarAlt, FaUser, FaVideo } from 'react-icons/fa';

const PendingArticles = () => {
  const { user } = useContext(AuthContext);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const fetchPendingArticles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/articles?status=Pending Approval&page=${currentPage}&limit=12`);
      setArticles(response.data.data.articles || []);
      setTotalPages(response.data.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching pending articles:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    if (user && (user.role === 'editor' || user.role === 'admin' || user.userType === 'editor' || user.userType === 'admin')) {
      fetchPendingArticles();
    }
  }, [currentPage, user, fetchPendingArticles]);

  const handleApprove = async (articleId) => {
    if (!window.confirm('Are you sure you want to approve this article?')) return;

    try {
      await api.put(`/articles/${articleId}/approve`);
      // Refresh the pending articles list to ensure it's updated from server
      fetchPendingArticles();
    } catch (error) {
      console.error('Error approving article:', error);
      alert('Failed to approve article. Please try again.');
    }
  };

  const handleReject = async (articleId) => {
    if (!window.confirm('Are you sure you want to reject this article? It will be moved to Draft status.')) return;

    try {
      await api.put(`/articles/${articleId}/reject`);
      // Refresh the pending articles list to ensure it's updated from server
      fetchPendingArticles();
    } catch (error) {
      console.error('Error rejecting article:', error);
      alert('Failed to reject article. Please try again.');
    }
  };

  if (!user || (user.userType !== 'editor' && user.userType !== 'admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Only editors and admins can access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h1 className="text-xl font-bold text-secondary-900 ">Pending Articles</h1>
        <Link to="/articles" className="btn btn-secondary">
          View All Articles
        </Link>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <FaCheck className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No pending articles</h3>
          <p className="text-secondary-600">All articles have been reviewed.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article key={article._id} className="card group hover:shadow-lg transition-shadow duration-300">
                {article.media && article.media.length > 0 && (
                  article.media[0].type === 'YouTube' ? (
                    <div className="relative w-full h-48 bg-gray-200 rounded-t-lg mb-4 overflow-hidden">
                      <img
                        src={`https://img.youtube.com/vi/${getYouTubeVideoId(article.media[0].url)}/0.jpg`}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FaVideo className="text-red-500 text-3xl bg-white bg-opacity-80 rounded-full p-2" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={article.media[0].url}
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-t-lg mb-4"
                    />
                  )
                )}
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-secondary-500 space-x-4">
                    <span className="flex items-center">
                      <FaCalendarAlt className="h-4 w-4 mr-1" />
                      {new Date(article.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <FaEye className="h-4 w-4 mr-1" />
                      {article.views || 0}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                    <Link to={`/articles/${article._id}`}>{article.title}</Link>
                  </h3>
                  <p className="text-secondary-600 line-clamp-3">
                    {article.summary || article.content.substring(0, 150)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary-500 bg-secondary-100 px-2 py-1 rounded">
                      {article.category?.name || 'Uncategorized'}
                    </span>
                    {article.journalist && (
                      <span className="flex items-center text-sm text-secondary-500">
                        <FaUser className="h-4 w-4 mr-1" />
                        {article.journalist.name}
                      </span>
                    )}
                  </div>

                  {/* Approval Actions */}
                  <div className="flex space-x-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(article._id)}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <FaCheck className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(article._id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                      <FaTimes className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-secondary-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};



export default PendingArticles;
