// src/utils/erpConfig.js

export const ERP_MODULES = {
  founder: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/erp', group: 'workspace' },
    { id: 'attendance', label: 'Attendance', icon: 'CalendarClock', path: '/erp/attendance', group: 'people' },
    { id: 'tasks', label: 'Tasks', icon: 'ClipboardList', path: '/erp/tasks', group: 'work' },
    { id: 'updates', label: 'Daily Updates', icon: 'FileStack', path: '/erp/updates', group: 'work' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3', path: '/erp/analytics', group: 'insights' },
    { id: 'documents', label: 'Documents', icon: 'FileText', path: '/erp/documents', group: 'resources' },
    { id: 'alerts', label: 'Alerts', icon: 'Bell', path: '/erp/alerts', group: 'administration' },
    { id: 'workspace', label: 'Workspace', icon: 'Building2', path: '/erp/workspace', group: 'administration' },
    { id: 'settings', label: 'Settings', icon: 'Settings', path: '/erp/settings', group: 'administration' },
  ],
  builder: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/erp', group: 'workspace' },
    { id: 'attendance', label: 'Attendance', icon: 'CalendarClock', path: '/erp/attendance', group: 'people' },
    { id: 'tasks', label: 'Tasks', icon: 'ClipboardList', path: '/erp/tasks', group: 'work' },
    { id: 'updates', label: 'Daily Updates', icon: 'FileStack', path: '/erp/updates', group: 'work' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3', path: '/erp/analytics', group: 'insights' },
    { id: 'documents', label: 'Documents', icon: 'FileText', path: '/erp/documents', group: 'resources' },
    { id: 'alerts', label: 'Alerts', icon: 'Bell', path: '/erp/alerts', group: 'administration' },
  ],
  influencer: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/erp', group: 'workspace' },
    { id: 'tasks', label: 'Tasks', icon: 'ClipboardList', path: '/erp/tasks', group: 'work' },
    { id: 'updates', label: 'Daily Updates', icon: 'FileStack', path: '/erp/updates', group: 'work' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3', path: '/erp/analytics', group: 'insights' },
    { id: 'documents', label: 'Documents', icon: 'FileText', path: '/erp/documents', group: 'resources' },
    { id: 'alerts', label: 'Alerts', icon: 'Bell', path: '/erp/alerts', group: 'administration' },
  ],
  investor: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/erp', group: 'workspace' },
    { id: 'analytics', label: 'Investment Analytics', icon: 'BarChart2', path: '/erp/analytics', group: 'insights' },
    { id: 'documents', label: 'Documents', icon: 'FileText', path: '/erp/documents', group: 'resources' },
    { id: 'workspace', label: 'Workspace Overview', icon: 'Building2', path: '/erp/workspace', group: 'administration' },
    { id: 'alerts', label: 'Alerts', icon: 'Bell', path: '/erp/alerts', group: 'administration' },
  ],
};

export const GROUP_LABELS = {
  workspace: 'Workspace',
  people: 'People',
  work: 'Work',
  insights: 'Insights',
  resources: 'Resources',
  administration: 'Administration',
};