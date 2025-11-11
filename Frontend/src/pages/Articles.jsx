import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { FaEye, FaHeart, FaCalendarAlt, FaUser, FaSearch, FaFilter } from 'react-icons/fa';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, [searchParams, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(searchParams);
      params.set('page', currentPage.toString());
      params.set('limit', '12');

      const response = await api.get(`/articles?${params}`);
      setArticles(response.data.data.articles || []);
      setTotalPages(response.data.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    params.delete('page');
    setSearchParams(params);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (categoryId) => {
    const params = new URLSearchParams(searchParams);
    if (categoryId) {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    params.delete('page');
    setSearchParams(params);
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSearchParams(new URLSearchParams());
    setCurrentPage(1);
  };

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
        <h1 className="text-3xl font-bold text-secondary-900">Articles</h1>
        <Link to="/articles/new" className="btn btn-primary">
          Write New Article
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </form>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="input md:w-48"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <button onClick={clearFilters} className="btn btn-secondary">
            <FaFilter className="h-4 w-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <FaSearch className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No articles found</h3>
          <p className="text-secondary-600">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article key={article._id} className="card group hover:shadow-lg transition-shadow duration-300">
                {article.media && article.media.length > 0 && (
                  <img
                    src={article.media[0].url}
                    alt={article.title}
                    className="w-full h-48 object-cover rounded-t-lg mb-4"
                  />
                )}
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-secondary-500 space-x-4">
                    <span className="flex items-center">
                      <FaCalendarAlt className="h-4 w-4 mr-1" />
                      {new Date(article.publishDate || article.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <FaEye className="h-4 w-4 mr-1" />
                      {article.views || 0}
                    </span>
                    <span className="flex items-center">
                      <FaHeart className="h-4 w-4 mr-1" />
                      {article.likes || 0}
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

export default Articles;
