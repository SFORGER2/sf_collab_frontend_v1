import React from 'react';
import './style/Login.css';

const LoadingSpinner = ({title, message}) => {
  return (
      <div style={{zIndex:99999999999999}} className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
        <div className="loader-container flex flex-col items-center justify-center">
          <span className="loader"></span>
          <p className="text-white mt-4 text-lg font-medium">{title}</p>
          <p className="text-gray-300 mt-2 text-sm">{message}</p>
        </div>
      </div>
  );
};

export default LoadingSpinner;
