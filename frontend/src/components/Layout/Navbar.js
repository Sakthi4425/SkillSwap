import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../utils/api'; 

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return; 
    try {
      const countResponse = await api.get('/notifications/unread_count/');
      setUnreadCount(countResponse.data.unread_count);
      
      const listResponse = await api.get('/notifications/');
      
      // --- THIS IS THE CORRECTED LOGIC ---
      const data = listResponse.data;
      if (Array.isArray(data)) {
        // Handle non-paginated response (just a list)
        setNotifications(data);
      } else if (data && data.results) {
        // Handle DRF paginated response
        setNotifications(data.results);
      } else {
        // Handle unexpected response
        setNotifications([]);
      }
      // --- END OF CORRECTION ---

    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications(); 
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]); 

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleNotificationClick = async () => {
    setShowNotifications(!showNotifications);
    
    if (!showNotifications && unreadCount > 0) {
      try {
        await api.post('/notifications/mark_all_read/');
        setUnreadCount(0); 
        
        // Update local state to remove "bold" style immediately
        setNotifications(currentNotifications => 
          currentNotifications.map(n => ({ ...n, is_read: true }))
        );
      } catch (error) {
        console.error('Failed to mark notifications as read:', error);
      }
    }
  };

  const handleSessionClick = (notification) => {
    setShowNotifications(false); 
    navigate('/dashboard'); 
  };

  // Logged-out navbar (no changes)
  if (!user) {
    return (
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              SkillSwap
            </Link>
            <div className="space-x-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
                Home
              </Link>
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">
                Login
              </Link>
              <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Logged-in navbar
  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
            SkillSwap
          </Link>
          <div className="flex items-center space-x-6">
            <span className="text-gray-700 font-medium hidden sm:inline">
              Welcome, <span className="text-blue-600 font-semibold">{user.username}</span>
            </span>
            <Link to="/matches" className="text-gray-700 hover:text-blue-600 font-medium">
              Find Matches
            </Link>
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
              Dashboard
            </Link>
            <Link to="/profile" className="text-gray-700 hover:text-blue-600 font-medium">
              Profile
            </Link>
            
            <div className="relative">
              <button 
                onClick={handleNotificationClick} 
                className="relative text-gray-700 hover:text-blue-600"
                aria-label="Notifications"
              >
                <span className="text-2xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-5 w-5 -mt-1 -mr-2 text-xs bg-red-600 text-white rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border">
                  <div className="p-3 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-xl font-bold text-gray-500">&times;</button>
                  </div>
                  <ul className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <li className="p-4 text-gray-500 text-sm">No new notifications.</li>
                    ) : (
                      notifications.map((notif) => (
                        <li 
                          key={notif.id} 
                          onClick={() => handleSessionClick(notif)}
                          className="border-b p-3 hover:bg-gray-50 cursor-pointer"
                        >
                          <p className={`text-sm ${!notif.is_read ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notif.created_at).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                          </p>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;