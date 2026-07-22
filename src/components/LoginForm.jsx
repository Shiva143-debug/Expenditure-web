import React, { useState, useRef } from 'react';
import { loginUser, registerUser } from '../apiService';
import './LoginForm.css';
import { useAuth } from '../context/AuthContext';
import { Toast } from 'primereact/toast';

const LoginForm = ({ onClose }) => {
  const { login } = useAuth();
  const toast = useRef(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    mobileNo: '',
    address: ''
  });
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
        const response = await loginUser({ loginEmail: formData.email, password: formData.password });
        if (response && (response.result.id)) {
          const userData = {
            id: response.result.id,
            name: response.result.fullName,
            email: response.result.email
          };
          const token = response.token || response.result?.token || null;
          login(userData, token);
          onClose();
        } else {
          setError('Login failed. Please check your credentials.');
        }
      } else {
        const { fullName, email, mobileNo, address } = formData;
        const response = await registerUser({ fullName, email, mobileNo, address });
        if (response) {
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Registration successful! Please login.', life: 3000 });
            setIsLoginView(true);
            setFormData({ fullName: '', email: '', password: '', mobileNo: '', address: '' });
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
        <form onSubmit={handleSubmit}>
          {isLoginView ? (
            <>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Enter your password"
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label>Mobile No</label>
                <input 
                  type="text" 
                  name="mobileNo" 
                  value={formData.mobileNo} 
                  onChange={handleInputChange} 
                  required 
                  maxLength="10"
                  placeholder="Enter your mobile number"
                />
              </div>
              <div className="form-group">
                <label>Address (Optional)</label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  placeholder="Enter your address"
                />
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
