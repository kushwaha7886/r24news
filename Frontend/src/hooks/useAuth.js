/**
 * Custom hook to access the AuthContext value.
 * Must be used within an AuthProvider component.
 *
 * @returns {object} Auth context value containing user, loading, and auth methods
 * @throws {Error} If used outside of AuthProvider
 */
import { useContext } from 'react';

import AuthContext from '../context/AuthContext.jsx';

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;
