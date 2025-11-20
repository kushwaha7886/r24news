                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from './components/Layout';
import Home from './pages/Home';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import CreateArticle from './pages/CreateArticle';
import EditArticle from './pages/EditArticle';
import Categories from './pages/Categories';
import Broadcasts from './pages/Broadcasts';
import Journalists from './pages/Journalists';                                                                                                                      
import MediaAssets from './pages/MediaAssets';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AddJournalist from './pages/AddJournalist';
import AddCategory from './pages/AddCategory';
import AddMediaAsset from './pages/AddMediaAsset';
import PendingArticles from './pages/PendingArticles';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/articles" element={<Layout><Articles /></Layout>} />
          <Route path="/articles/:id" element={<Layout><ArticleDetail /></Layout>} />
          <Route path="/categories" element={<Layout><Categories /></Layout>} />
          <Route path="/categories/:categoryId" element={<Layout><Categories /></Layout>} />
          <Route path="/broadcasts" element={<Layout><Broadcasts /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          } />

          {/* Journalist Routes */}
          <Route path="/articles/new" element={
            <ProtectedRoute allowedRoles={['journalist', 'editor', 'admin']}>
              <Layout><CreateArticle /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/edit-article/:id" element={
            <ProtectedRoute allowedRoles={['journalist', 'editor', 'admin']}>
              <Layout><EditArticle /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/pending-articles" element={
            <ProtectedRoute allowedRoles={['journalist', 'editor', 'admin']}>
              <Layout><PendingArticles /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/media-assets" element={
            <ProtectedRoute allowedRoles={['journalist', 'editor', 'admin']}>
              <Layout><MediaAssets /></Layout>
            </ProtectedRoute>
          } />

          {/* Editor Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['editor', 'admin']}>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/journalists" element={
            <ProtectedRoute allowedRoles={['editor', 'admin']}>
              <Layout><Journalists /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/add-category" element={
            <ProtectedRoute allowedRoles={['editor', 'admin']}>
              <Layout><AddCategory /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/add-media-asset" element={
            <ProtectedRoute allowedRoles={['editor', 'admin']}>
              <Layout><AddMediaAsset /></Layout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/add-journalist" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AddJournalist /></Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
