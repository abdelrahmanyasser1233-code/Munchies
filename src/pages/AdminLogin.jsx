import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminLogin.css';

const ADMIN_USER = 'adminmunchies';
const ADMIN_PASS = 'admins2121';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem('munchies_admin', 'true');
      navigate('/admins-only/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="admin-login-page">
      <motion.div
        className="admin-login-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      >
        <div className="admin-login-logo-wrapper">
          <img src="/logo.png" alt="Munchies" className="admin-login-logo" />
        </div>
        <h2>Admin Panel</h2>
        <p className="admin-subtitle">Sign in to manage your canteen</p>

        <form className="admin-login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-user">
              Username
            </label>
            <input
              id="admin-user"
              type="text"
              className="form-input"
              placeholder="Enter username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-pass">
              Password
            </label>
            <input
              id="admin-pass"
              type="password"
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              autoComplete="current-password"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="admin-login-error"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="admin-login-submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign In
          </motion.button>
        </form>

        <div className="admin-login-back">
          <Link to="/">← Back to Menu</Link>
        </div>
      </motion.div>
    </div>
  );
}
