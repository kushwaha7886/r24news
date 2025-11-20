import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FaEye, FaEyeSlash, FaUpload } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  });
  const role = 'user'; // Only 'user' allowed
  const [avatar, setAvatar] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === 'avatar') {
      setAvatar(file);
    } else {
      // Handle other file types if needed
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Handle registration for user
    const submitData = new FormData();
    if (role === 'user') {
      submitData.append('username', formData.username);
    }
    submitData.append('email', formData.email);
    submitData.append('fullName', formData.fullName);
    submitData.append('password', formData.password);
    submitData.append('role', role);

    if (avatar) {
      submitData.append('avatar', avatar);
    }

    const result = await register(submitData);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center w-full h-full">
            <img src="/src/assets/sp_20250226-Copy-Copy_360p_12f_20250401_092620.gif" alt="Logo" className="h-25 w-40" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-secondary-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="input"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-secondary-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="input"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input pr-10"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4 text-secondary-400" />
                  ) : (
                    <FaEye className="h-4 w-4 text-secondary-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input pr-10"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-4 w-4 text-secondary-400" />
                  ) : (
                    <FaEye className="h-4 w-4 text-secondary-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Profile Picture (Optional)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'avatar')}
                  className="hidden"
                  id="avatar"
                />
                <label
                  htmlFor="avatar"
                  className="flex items-center px-4 py-2 border border-secondary-300 rounded-md cursor-pointer hover:bg-secondary-50"
                >
                  <FaUpload className="h-4 w-4 mr-2" />
                  Choose Avatar
                </label>
                {avatar && <span className="text-sm text-secondary-600">{avatar.name}</span>}
              </div>
            </div>

            {role === 'editor' && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Profile Picture (Optional)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'avatar')}
                    className="hidden"
                    id="avatar"
                  />
                  <label
                    htmlFor="avatar"
                    className="flex items-center px-4 py-2 border border-secondary-300 rounded-md cursor-pointer hover:bg-secondary-50"
                  >
                    <FaUpload className="h-4 w-4 mr-2" />
                    Choose Avatar
                  </label>
                  {avatar && <span className="text-sm text-secondary-600">{avatar.name}</span>}
                </div>
              </div>
            )}

          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
