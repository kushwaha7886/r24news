import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FaEye, FaHeart, FaCalendarAlt, FaUser, FaVideo } from 'react-icons/fa';



const getYouTubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const Home = () => {
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        api.get('/articles?limit=6&sort=-publishDate'),
        api.get('/categories')
      ]);

      setFeaturedArticles(articlesRes.data.data.articles || []);
      setCategories(Array.isArray(categoriesRes.data.data) ? categoriesRes.data.data : []);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-secondary-900 mb-4">
          Welcome to <span className="text-red-600">R24TV NEWS BHARAT LIVE</span>
        </h1>
        <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
          Stay informed with the latest breaking news, in-depth analysis, and comprehensive coverage from around the world.
        </p>
      </section>

      {/* Featured Articles */}
      <section>
        <h2 className="text-3xl font-bold text-secondary-900 mb-8">Latest News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredArticles.map((article) => (
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
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-red-700 transition-colors">
                  <Link to={`/articles/${article._id}`}>{article.title}</Link>
                </h3>
                <p className="text-secondary-600 line-clamp-3">{article.summary || article.content.substring(0, 150)}...</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-500">
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
        <div className="text-center mt-8">
          <Link to="/articles" className="btn btn-primary">
            View All Articles
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-3xl font-bold text-secondary-900 mb-8">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/articles?category=${category._id}`}
              className="card text-center hover:shadow-lg transition-shadow duration-300 group"
            >
              <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-secondary-600 text-sm mt-2">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>


      {/* Stats Section */}
      <section className="bg-primary-600 text-white rounded-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold mb-2">{featuredArticles.length}+</div>
            <div className="text-primary-100">Articles Published</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">{categories.length}</div>
            <div className="text-primary-100">News Categories</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">24/7</div>
            <div className="text-primary-100">News Coverage</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
