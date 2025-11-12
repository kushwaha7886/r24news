import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { FaTag, FaNewspaper, FaEye, FaCalendar } from 'react-icons/fa';

const Categories = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(Array.isArray(response.data.data) ? response.data.data : []);

        // If categoryId is provided, select that category
        if (categoryId) {
          const category = response.data.data.find(cat => cat._id === categoryId);
          if (category) {
            setSelectedCategory(category);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [categoryId]);

  // Fetch articles when category is selected
  useEffect(() => {
    if (selectedCategory) {
      fetchArticlesByCategory(selectedCategory._id);
    }
  }, [selectedCategory]);

  const fetchArticlesByCategory = async (categoryId) => {
    setArticlesLoading(true);
    try {
      const response = await api.get(`/articles?category=${categoryId}&status=Published`);
      setArticles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
    } finally {
      setArticlesLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    navigate(`/categories/${category._id}`);
  };

  const handleArticleClick = (articleId) => {
    navigate(`/articles/${articleId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Categories</h1>
          <p className="text-lg text-gray-600">
            Explore articles organized by categories
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaTag className="mr-2 text-blue-600" />
                All Categories
              </h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategoryClick(category)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedCategory?._id === category._id
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                      <div className="text-sm text-gray-500 mt-1">
                        {category.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Articles Content */}
          <div className="lg:col-span-3">
            {selectedCategory ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedCategory.name}
                  </h2>
                  {selectedCategory.description && (
                    <p className="text-gray-600">{selectedCategory.description}</p>
                  )}
                </div>

                {articlesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading articles...</p>
                  </div>
                ) : articles.length > 0 ? (
                  <div className="space-y-6">
                    {articles.map((article) => (
                      <article
                        key={article._id}
                        className="border-b border-gray-200 pb-6 last:border-b-0 cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors"
                        onClick={() => handleArticleClick(article._id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                            {article.title}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <FaEye className="mr-1" />
                            {article.views || 0}
                          </div>
                        </div>

                        {article.summary && (
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {article.summary}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <FaCalendar className="mr-1" />
                            {new Date(article.publishDate || article.createdAt).toLocaleDateString()}
                          </div>
                          {article.journalist && (
                            <div className="flex items-center">
                              <FaNewspaper className="mr-1" />
                              By {article.journalist.name || 'Unknown'}
                            </div>
                          )}
                        </div>

                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {article.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                              >
                                <FaTag className="mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaNewspaper className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No articles found
                    </h3>
                    <p className="text-gray-600">
                      There are no published articles in this category yet.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <FaTag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Select a Category
                </h3>
                <p className="text-gray-600">
                  Choose a category from the sidebar to view articles.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
