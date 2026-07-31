import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-white">404</h1>
          <h2 className="text-2xl font-semibold text-gray-300">Page Not Found</h2>
          <p className="text-gray-400 max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="space-y-4">
          <Link 
            to="/dashboard" 
            className="inline-block bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Go to Dashboard
          </Link>
          <div className="text-sm text-gray-500">
            <Link to="/dashboard" className="text-gray-300 hover:text-white">Home</Link>
            {" • "}
            <Link to="/ideation" className="text-gray-300 hover:text-white">Visions</Link>
            {" • "}
            <Link to="/discover-startups" className="text-gray-300 hover:text-white">Startups</Link>
            {" • "}
            <Link to="/user-profile" className="text-gray-300 hover:text-white">Profile</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
