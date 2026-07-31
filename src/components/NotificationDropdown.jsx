/**
 * NotificationDropdown Component
 * Dropdown panel showing notification list
 */

import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationItem from '@/components/notifications/NotificationItem';
import { CheckCheck, Trash2, Filter, RefreshCw } from 'lucide-react';
import './NotificationDropdown.css';

const NotificationDropdown = ({ onClose }) => {
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    markAllAsRead,
    deleteAllRead,
    loadMore,
    applyFilters,
    refresh,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread', filter: { is_read: false } },
    { value: 'success', label: 'Success', filter: { type: 'success' } },
    { value: 'info', label: 'Info', filter: { type: 'info' } },
    { value: 'warning', label: 'Warning', filter: { type: 'warning' } },
    { value: 'error', label: 'Error', filter: { type: 'error' } },
  ];

  const handleFilterChange = (filterValue) => {
    setActiveFilter(filterValue);
    const filter = filterOptions.find((f) => f.value === filterValue);
    applyFilters(filter?.filter || {});
    setShowFilters(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteAllRead = async () => {
    if (window.confirm('Delete all read notifications?')) {
      try {
        await deleteAllRead();
      } catch (error) {
        console.error('Failed to delete read notifications:', error);
      }
    }
  };

  const handleRefresh = () => {
    refresh();
  };

  const handleLoadMore = () => {
    loadMore();
  };

  return (
    <div className="notification-dropdown">
      {/* Header */}
      <div className="notification-dropdown-header">
        <div className="notification-dropdown-title">
          <h3>Notifications</h3>
          {unreadCount > 0 && (
            <span className="unread-count-badge">{unreadCount} new</span>
          )}
        </div>

        <div className="notification-dropdown-actions">
          <button
            className="icon-button"
            onClick={handleRefresh}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>

          <button
            className="icon-button"
            onClick={() => setShowFilters(!showFilters)}
            title="Filter"
          >
            <Filter size={16} />
          </button>

          {unreadCount > 0 && (
            <button
              className="icon-button"
              onClick={handleMarkAllAsRead}
              title="Mark all as read"
            >
              <CheckCheck size={16} />
            </button>
          )}

          <button
            className="icon-button"
            onClick={handleDeleteAllRead}
            title="Delete all read"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="notification-filters">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              className={`filter-button ${
                activeFilter === option.value ? 'active' : ''
              }`}
              onClick={() => handleFilterChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Notification List */}
      <div className="notification-list">
        {loading && notifications.length === 0 ? (
          <div className="notification-loading">
            <div className="spinner" />
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty">
            <p>No notifications yet</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <button
                className="load-more-button"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="notification-dropdown-footer">
        <a href="/notifications" onClick={onClose}>
          View all notifications
        </a>
      </div>
    </div>
  );
};

export default NotificationDropdown;