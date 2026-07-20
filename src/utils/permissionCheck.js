// utils/permissionCheck.js
export const hasPermission = (user, permissionKey) => {
  if (!user || !user.permissions) return false;
  if (user?.role === 'admin') return true;
    return user.permissions.some(perm => perm.permission.key === permissionKey);
  };
  
  export const hasAnyPermission = (user, permissionKeys) => {
    if (!user || !user.permissions) return false;
    return permissionKeys.some(key => 
      user.permissions.some(perm => perm.permission.key === key)
    );
  };
  
  export const hasAllPermissions = (user, permissionKeys) => {
    if (!user || !user.permissions) return false;
    return permissionKeys.every(key => 
      user.permissions.some(perm => perm.permission.key === key)
    );
  };