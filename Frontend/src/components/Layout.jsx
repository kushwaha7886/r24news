import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FaNewspaper, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: FaNewspaper },
    { name: 'Articles', href: '/articles', icon: FaNewspaper },
    { name: 'Categories', href: '/categories', icon: FaNewspaper },
    // { name: 'Journalists', href: '/journalists', icon: FaUser },
    // { name: 'Broadcasts', href: '/broadcasts', icon: FaNewspaper },
    // { name: 'Media Assets', href: '/media-assets', icon: FaNewspaper },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-red-600 shadow-sm border-b  border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-white h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <img src="/src/assets/sp_20250226-Copy-Copy_360p_12f_20250401_092620.gif" alt="Logo" className="h-20 w-20" />
                <span className="text-xl font-bold text-white">R24TV NEWS BHARAT LIVE</span>
              </Link>
            </div>

            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className=" text-white">Welcome, {user.fullName}</span>
                  <Link to="/dashboard" className="btn btn-secondary">
                    Dashboard
                  </Link>
                  <Link to="/profile" className="btn btn-secondary">
                    <FaUser className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  <button onClick={logout} className="btn btn-secondary">
                    <FaSignOutAlt className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="btn btn-secondary">
                    <FaSignInAlt className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    <FaUserPlus className="h-4 w-4 mr-2" />
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/src/assets/sp_20250226-Copy-Copy_360p_12f_20250401_092620.gif" alt="Logo" className="h-40 w-40" />
                <span className="text-lg font-bold">R24TV NEWS BHARAT LIVE</span>
              </div>
              <p className="text-secondary-300 text-sm">
                Your trusted source for breaking news and in-depth journalism.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Navigation</h3>
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className="text-secondary-300 hover:text-white text-sm">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Categories</h3>
              <ul className="space-y-2">
                <li><Link to="/categories" className="text-secondary-300 hover:text-white text-sm">All Categories</Link></li>
                <li><Link to="/articles?category=politics" className="text-secondary-300 hover:text-white text-sm">Politics</Link></li>
                <li><Link to="/articles?category=technology" className="text-secondary-300 hover:text-white text-sm">Technology</Link></li>
                <li><Link to="/articles?category=sports" className="text-secondary-300 hover:text-white text-sm">Sports</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Contact</h3>
              <p className="text-secondary-300 text-sm">
                Email: info@r24news.com<br />
                Phone: +1 (555) 123-4567
              </p>
            </div>
          </div>
          <div className="border-t border-secondary-700 mt-8 pt-8 text-center">
            <p className="text-secondary-300 text-sm">
              © 2024 R24 News. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
