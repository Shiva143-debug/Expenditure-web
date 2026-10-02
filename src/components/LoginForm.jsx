import React, { useState, useRef } from 'react';
import { loginUser, registerUser } from '../apiService';
import './LoginForm.css';
import { useAuth } from '../context/AuthContext';
import { Toast } from 'primereact/toast';
import { Eye, EyeOff } from 'lucide-react';

const LoginForm = ({ onClose, showToast }) => {
  const { login } = useAuth();
  const toast = useRef(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', mobileNo: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobileNo' && value !== '' && !/^\d{0,10}$/.test(value)) {
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLoginView) {
        const res = await loginUser({ loginEmail: formData.email, password: formData.password });

        const extractUser = (obj) => {
          const src = obj?.result || obj?.data?.result || obj?.user || obj?.data?.user || obj?.data || obj || {};
          return {
            id: src.id,
            name: src.fullName || src.name || src.username ||
              `${src.firstName || ''} ${src.lastName || ''}`.trim() || src.email || '',
            email: src.email
          };
        };

        let userData = null;
        let token = null;

        if (res?.status === true && res.data) {
          userData = extractUser(res.data);
          token = res.data.token || res.data?.result?.token || null;
        } else if (res?.result) {
          userData = extractUser(res);
          token = res.token || res?.result?.token || null;
        } else if (res?.data && (res.data.result || res.data.token || res.data.id)) {
          userData = extractUser(res.data);
          token = res.data.token || res.data?.result?.token || null;
        }

        if (userData && userData.id) {
          login(userData, token);
          showToast?.({ severity: 'success', summary: 'Success', detail: res?.message || 'Login successful', life: 3000 });
          setFormData({ fullName: '', email: '', password: '', mobileNo: '', address: '' });
          setError('');
          setShowPassword(false);
          window.scrollTo(0, 0);
          onClose();
        } else {
          setError(res?.message || 'Login failed. Please check your credentials.');
        }
      } else {
        const { fullName, email, mobileNo, address } = formData;
        const res = await registerUser({ fullName, email, mobileNo, address });
        if (res?.status) {
          toast.current.show({ severity: 'success', summary: 'Success', detail: res.message || 'Registration successful! Please login.', life: 3000 });
          setFormData({ fullName: '', email, password: '', mobileNo: '', address: '' });
          setIsLoginView(true);
        } else {
          toast.current.show({ severity: 'error', summary: 'Error', detail: res?.message || 'Registration failed. Please try again.', life: 3000 });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-overlay">
      <Toast ref={toast} position="top-right" />
      <div className="login-card">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{isLoginView ? 'Login to Expenditure' : 'Create an Account'}</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          {isLoginView ? (
            <>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required
                  autoComplete="off" placeholder="Enter your email" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                    onChange={handleInputChange} required autoComplete="new-password" placeholder="Enter your password" />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required
                  placeholder="Enter your full name" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required
                  autoComplete="off" placeholder="Enter your email" />
              </div>
              <div className="form-group">
                <label>Mobile No</label>
                <input type="text" name="mobileNo" value={formData.mobileNo} onChange={handleInputChange} required
                  maxLength="10" placeholder="Enter your mobile number" />
              </div>
              <div className="form-group">
                <label>Address (Optional)</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange}
                  placeholder="Enter your address" />
              </div>
            </>
          )}
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (isLoginView ? 'Logging...' : 'Registering...') : (isLoginView ? 'Login' : 'Register')}
          </button>
        </form>
        <p className="toggle-view">
          {isLoginView ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLoginView(!isLoginView)}>
            {isLoginView ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
