import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../utils/api';
import { FaUser, FaEnvelope, FaCamera, FaSave, FaEdit } from 'react-icons/fa';

const Profile = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        username: user.username || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update profile information
      const response = await api.patch('/users/update-account', {
        fullName: formData.fullName,
        email: formData.email
      });

      // Update avatar if changed
      if (avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', avatarFile);
        await api.patch('/users/avatar', avatarFormData);
      }



      // Update user context
      const updatedUser = { ...user, ...response.data };
      if (avatarFile) {
        // In real app, get updated avatar URL from response
        updatedUser.avatar = previewAvatar;
      }

      login(updatedUser);

      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please login to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative">
            <div className="px-6 py-8 sm:px-8">
              <div className="flex flex-col sm:flex-row items-center">
                {/* Avatar */}
                <div className="relative mb-4 sm:mb-0 sm:mr-6">
                  <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-lg">
                    {(previewAvatar || user.avatar) ? (
                      <img
                        src={previewAvatar || user.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FaUser size={48} />
                      </div>
                    )}
                  </div>
                  {editMode && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                      <FaCamera size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {user.fullName || user.username}
                  </h1>
                  <p className="text-gray-600 mb-4">@{user.username}</p>

                  {/* Edit/Save Button */}
                  <div className="flex justify-center sm:justify-start">
                    {editMode ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSubmit}
                          disabled={loading}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                          <FaSave className="mr-2" />
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={() => {
                            setEditMode(false);
                            setAvatarFile(null);
                            setPreviewAvatar('');
                            setFormData({
                              fullName: user.fullName || '',
                              email: user.email || '',
                              username: user.username || ''
                            });
                          }}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditMode(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                      >
                        <FaEdit className="mr-2" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-6 py-6 sm:px-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user.fullName || 'Not provided'}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <p className="text-gray-900 py-2">@{user.username}</p>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {editMode ? (
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-600 py-2 flex items-center">
                    <FaEnvelope className="mr-2" />
                    {user.email}
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <p className="text-gray-900 py-2 capitalize">
                  {user.role || 'Reader'}
                </p>
              </div>

              {/* Account Created */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member Since
                </label>
                <p className="text-gray-600 py-2">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
