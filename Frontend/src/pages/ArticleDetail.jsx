import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { FaEye, FaHeart, FaCalendarAlt, FaUser, FaArrowLeft, FaShare } from 'react-icons/fa';

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    fetchArticle();
    fetchComments();
  }, [id]);

  const fetchArticle = useCallback(async () => {
    try {
      const response = await api.get(`/articles/${id}`);
      setArticle(response.data.data);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await api.get(`/comments?article=${id}`);
      setComments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [id]);

  const handleLike = async () => {
    try {
      await api.post(`/articles/${id}/like`);
      setArticle(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;

    setSubmittingComment(true);
    try {
      await api.post('/comments', {
        article: id,
        text: newComment,
      });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">Article not found</h2>
        <Link to="/articles" className="btn btn-primary">
          Back to Articles
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link to="/articles" className="inline-flex items-center text-primary-600 hover:text-primary-700">
        <FaArrowLeft className="h-4 w-4 mr-2" />
        Back to Articles
      </Link>

      {/* Article Header */}
      <article className="bg-amber-50 rounded-lg shadow-md overflow-hidden">
        {article.media && article.media.length > 0 && (
          <>
            {article.media[0].type === 'YouTube' ? (
              <div className="w-full aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(article.media[0].url)}`}
                  title={article.media[0].caption || article.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <img
                src={article.media[0].url}
                alt={article.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            )}
          </>
        )}

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4 text-sm text-secondary-500">
                <span className="flex items-center">
                  <FaCalendarAlt className="h-4 w-4 mr-1" />
                  {new Date(article.publishDate || article.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <FaEye className="h-4 w-4 mr-1" />
                  {article.views || 0} views
                </span>
                <span className="bg-secondary-100 text-secondary-700 px-2 py-1 rounded text-xs">
                  {article.category?.name || 'Uncategorized'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLike}
                  className="flex items-center space-x-1 text-secondary-600 hover:text-red-600 transition-colors"
                >
                  <FaHeart className="h-4 w-4" />
                  <span>{article.likes || 0}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-1 text-secondary-600 hover:text-primary-600 transition-colors"
                >
                  <FaShare className="h-4 w-4" />
                </button>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-secondary-900">{article.title}</h1>

            {article.summary && (
              <p className="text-xl text-secondary-600 font-medium">{article.summary}</p>
            )}

            {article.journalist && (
              <div className="flex items-center space-x-2 text-secondary-600">
                <FaUser className="h-4 w-4" />
                <span>By {article.journalist.name}</span>
                {article.journalist.designation && (
                  <span className="text-sm">• {article.journalist.designation}</span>
                )}
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <section className="card">
        <h2 className="text-2xl font-bold text-secondary-900 mb-6">Comments ({comments.length})</h2>

        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="input h-24 resize-none"
            required
          />
          <button
            type="submit"
            disabled={submittingComment}
            className="btn btn-primary mt-2 disabled:opacity-50"
          >
            {submittingComment ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="border-b border-secondary-200 pb-6 last:border-b-0">
              <div className="flex items-start space-x-3">
                <div className="shrink-0">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <FaUser className="h-5 w-5 text-primary-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-secondary-900">
                      {comment.user?.fullName || 'Anonymous'}
                    </span>
                    <span className="text-sm text-secondary-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-secondary-700">{comment.text}</p>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-secondary-500 text-center py-8">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ArticleDetail;
