import React from 'react';
import './SplashScreen.css';

const SplashScreen = () => {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="splash-logo">
          <div className="avatar">
            <div className="avatar-circle"></div>
            <div className="avatar-circle"></div>
            <div className="avatar-circle"></div>
          </div>
        </div>
        <h1 className="splash-title">Expenditure</h1>
        <p className="splash-subtitle">Your Personal Expense Manager</p>
      </div>
    </div>
  );
};

export default SplashScreen;
