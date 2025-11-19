import { useState, useEffect } from "react";
import axios from "axios";

const News = () => {
  const [newsByCategory, setNewsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    const fetchNewsCategories = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/v1/news/categories`);
        console.log("Categories API response:", response.data);
        setCategories(response.data.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchNewsCategories();
  }, []);

  useEffect(() => {
    const fetchNewsByCategories = async () => {
      if (!categories || categories.length === 0) return;

      try {
        setLoading(true);
        const categoryPromises = categories.map(async (category) => {
          try {
            const response = await axios.get(`http://localhost:8000/api/v1/news`, {
              params: {
                category,
                limit: 16 // Fetch more articles to allow "show more" functionality
                
              }
            });
            console.log(`News API response for ${category}:`, response.data);
            return { category, news: response.data.data || [] };
          } catch (error) {
            console.error(`Error fetching news for category ${category}:`, error);
            return { category, news: [] };
          }
        });

        const results = await Promise.all(categoryPromises);
        const newsMap = {};
        results.forEach(({ category, news }) => {
          newsMap[category] = news;
        });

        setNewsByCategory(newsMap);
        setError(null);
      } catch (err) {
        setError("Failed to fetch news");
        console.error("News fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsByCategories();
  }, [categories]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getCategoryColor = (category) => {
    const colors = {
      Politics: 'bg-red-100 text-red-800 border-red-200',
      Technology: 'bg-blue-100 text-blue-800 border-blue-200',
      Sports: 'bg-green-100 text-green-800 border-green-200', 
      Business: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Entertainment: 'bg-purple-100 text-purple-800 border-purple-200',
      Health: 'bg-pink-100 text-pink-800 border-pink-200',
      Science: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      World: 'bg-teal-100 text-teal-800 border-teal-200',
      National: 'bg-orange-100 text-orange-800 border-orange-200',
      Education: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      Environment: 'bg-lime-100 text-lime-800 border-lime-200',
      Crime: 'bg-gray-100 text-gray-800 border-gray-200',
      Weather: 'bg-sky-100 text-sky-800 border-sky-200',
      Lifestyle: 'bg-rose-100 text-rose-800 border-rose-200',
      Opinion: 'bg-violet-100 text-violet-800 border-violet-200',
      'Breaking News': 'bg-red-200 text-red-900 border-red-300'

    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Latest News by Category</h3>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j}>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Latest News by Category</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-6">Latest News by Category</h3>

      <div className="space-y-6 max-h-96 overflow-y-auto">
        {categories && categories.map((category) => {
          const categoryNews = newsByCategory[category] || [];
          const isExpanded = expandedCategories[category] !== false; // Default to expanded

          return (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(category)}`}>
                    {category}
                  </span>
                  <span className="text-sm text-gray-600">
                    {categoryNews.length} articles
                  </span>
                </div>
                <button
                  onClick={() => toggleCategory(category)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  {isExpanded ? 'Collapse' : 'Expand'}
                </button>
              </div>

              {isExpanded && (
                <div className="space-y-3">
                  {categoryNews.slice(0, 3).map((item) => (
                    <div key={item._id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                      <h4 className="font-medium text-sm mb-1">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {item.title}
                        </a>
                      </h4>
                      {item.description && (
                        <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span className="font-medium">{item.source}</span>
                        <span>{formatDate(item.pubDate)}</span>
                      </div>
                    </div>
                  ))}

                  {categoryNews.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-2">
                      No news available in this category
                    </p>
                  )}

                  {categoryNews.length > 3 && (
                    <div className="text-center pt-2">
                      <span className="text-xs text-gray-500">
                        +{categoryNews.length - 3} more articles
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <p className="text-gray-500 text-center py-4">No news categories available</p>
      )}
    </div>
  );
};

export default News;
