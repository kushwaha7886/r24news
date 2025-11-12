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

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true }}>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/articles" element={<Layout><Articles /></Layout>} />
          <Route path="/articles/:id" element={<Layout><ArticleDetail /></Layout>} />
          <Route path="/articles/new" element={<Layout><CreateArticle /></Layout>} />
          <Route path="/edit-article/:id" element={<Layout><EditArticle /></Layout>} />
          <Route path="/categories" element={<Layout><Categories /></Layout>} />
          <Route path="/categories/:categoryId" element={<Layout><Categories /></Layout>} />
          <Route path="/broadcasts" element={<Layout><Broadcasts /></Layout>} />
          <Route path="/journalists" element={<Layout><Journalists /></Layout>} />
          <Route path="/media-assets" element={<Layout><MediaAssets /></Layout>} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
