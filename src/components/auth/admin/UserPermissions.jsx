import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { useToast } from "../../hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { permissionsAPI, userPermissionsAPI } from "@/utils/APIs/permissionsAPI";
import { usersAPI } from "@/utils/APIs/userAPI";

const UserPermissions = () => {
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [grantData, setGrantData] = useState({
    user_id: "",
    permission_id: "",
  });
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 1
  });
  const [searchUser, setSearchUser] = useState("");
  const [searchPermission, setSearchPermission] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();

  const fetchUserPermissions = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: pagination.per_page,
        only_active: onlyActive
      };
      
      if (searchUser) {
        params.userId = searchUser;
      }
      
      if (searchPermission) {
        params.permissionId = searchPermission;
      }
      
      const data = await userPermissionsAPI.getAll(params);
      
      if (data.success) {
        setUserPermissions(data.data.user_permissions || []);
        setPagination({
          page: data.data.pagination.page,
          per_page: data.data.pagination.per_page,
          total: data.data.pagination.total,
          pages: data.data.pagination.pages
        });
      }
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      toast({
        title: "Error",
        description: "Failed to load user permissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await usersAPI.getAll({ per_page: 100 });
      if (data.success) {
        setUsers(data.data?.users || data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const data = await permissionsAPI.getAll();
      if (data.success) {
        setPermissions(data.data.permissions || []);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  useEffect(() => {
    fetchUserPermissions();
    fetchUsers();
    fetchPermissions();
  }, []);

  const handleGrantPermission = async () => {
    if (!grantData.user_id || !grantData.permission_id) {
      toast({
        title: "Error",
        description: "Please select both user and permission",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await userPermissionsAPI.create({
        user_id: parseInt(grantData.user_id),
        permission_id: parseInt(grantData.permission_id)
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Permission granted successfully",
        });
        setShowGrantDialog(false);
        setGrantData({ user_id: "", permission_id: "" });
        fetchUserPermissions(pagination.page);
      } else {
        throw new Error(response.message || "Failed to grant permission");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to grant permission",
        variant: "destructive"
      });
    }
  };

  const handleRevokePermission = async () => {
    if (!selectedPermission) return;

    try {
      const response = await userPermissionsAPI.delete(selectedPermission.id);

      if (response.success) {
        toast({
          title: "Success",
          description: "Permission revoked successfully",
        });
        setShowRevokeDialog(false);
        fetchUserPermissions(pagination.page);
      } else {
        throw new Error(response.message || "Failed to revoke permission");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke permission",
        variant: "destructive"
      });
    }
  };

  const handleSearch = () => {
    fetchUserPermissions(1);
  };

  const handleClearFilters = () => {
    setSearchUser("");
    setSearchPermission("");
    fetchUserPermissions(1);
  };

  const handlePageChange = (newPage) => {
    fetchUserPermissions(newPage);
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 border-0">Active</Badge>
    ) : (
      <Badge variant="outline" className="border-white/15">Inactive</Badge>
    );
  };

  if (loading && pagination.page === 1) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-star">User Permissions</h1>
          <p className="text-dim mt-2">
            Manage permissions assigned to users
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => fetchUserPermissions(pagination.page)}
            variant="outline"
            className="border-black text-star hover:bg-white/[0.06]"
          >
            Refresh
          </Button>
          <Button
            onClick={() => setShowGrantDialog(true)}
            className="bg-black text-white hover:bg-gray-800 shadow-[0_4px_14px_0_rgba(255,255,255,0.3)]"
          >
            Grant Permission
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <Card className="border border-white/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-star">Filter by User</label>
              <Select
                value={searchUser}
                onValueChange={setSearchUser}
              >
                <SelectTrigger className="bg-panel border border-white/15">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent position="bottom" className="bg-panel">
                  <SelectItem value="--">All users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.email} ({user.first_name} {user.last_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-star">Filter by Permission</label>
              <Select
                value={searchPermission}
                onValueChange={setSearchPermission}
              >
                <SelectTrigger className="bg-panel border border-white/15">
                  <SelectValue placeholder="All permissions" />
                </SelectTrigger>
                <SelectContent className="bg-panel">
                  <SelectItem value="--">All permissions</SelectItem>
                  {permissions.map((permission) => (
                    <SelectItem key={permission.id} value={permission.id.toString()}>
                      {permission.key} - {permission.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-star">Status Filter</label>
              <Select
                value={onlyActive.toString()}
                onValueChange={(value) => setOnlyActive(value === "true")}
              >
                <SelectTrigger className="bg-panel border border-white/15">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-panel">
                  <SelectItem value="true">Active Only</SelectItem>
                  <SelectItem value="false">All Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button
              onClick={handleSearch}
              className="bg-black text-white hover:bg-gray-800"
            >
              Apply Filters
            </Button>
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="border-white/15 text-dim hover:bg-white/[0.06]"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-white/10 shadow-[0_4px_14px_0_rgba(255,255,255,0.3)]">
        <CardHeader>
          <CardTitle className="text-xl text-star">User Permissions</CardTitle>
          <CardDescription className="text-dim">
            Showing {userPermissions.length} of {pagination.total} permission{pagination.total !== 1 ? 's' : ''}
            {searchUser && ` for selected user`}
            {searchPermission && ` for selected permission`}
            {onlyActive && ` (Active only)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userPermissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No permissions found. Try adjusting your filters.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-star">User</TableHead>
                      <TableHead className="font-semibold text-star">Permission</TableHead>
                      <TableHead className="font-semibold text-star">Status</TableHead>
                      <TableHead className="font-semibold text-star">Granted By</TableHead>
                      <TableHead className="font-semibold text-star">Granted At</TableHead>
                      <TableHead className="font-semibold text-star">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userPermissions.map((up) => (
                      <TableRow key={up.id} className="border-b border-gray-100">
                        <TableCell className="font-medium">
                          {up.user?.email || `User ${up.user_id}`}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-star">{up.permission?.key}</div>
                            <div className="text-sm text-dim">{up.permission?.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(up.is_active)}
                        </TableCell>
                        <TableCell>
                          {up.granted_by === user?.id ? "You" : `User ${up.granted_by}`}
                        </TableCell>
                        <TableCell>
                          {new Date(up.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPermission(up);
                              setShowRevokeDialog(true);
                            }}
                            className="border-red-600 text-red-600 hover:bg-red-50"
                          >
                            Revoke
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-dim">
                    Page {pagination.page} of {pagination.pages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="border-white/15"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={pagination.page === pageNum ? "default" : "outline"}
                            onClick={() => handlePageChange(pageNum)}
                            className={
                              pagination.page === pageNum 
                                ? "bg-black text-white" 
                                : "border-white/15"
                            }
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="border-white/15"
                    >
                      Next
                    </Button>
                  </div>
                  <div className="text-sm text-dim">
                    {pagination.per_page} per page
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Grant Permission Dialog */}
      <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
        <DialogContent className="bg-panel text-star">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Grant Permission</DialogTitle>
            <DialogDescription className="text-dim">
              Grant a permission to a user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-star">User</label>
              <Select
                value={grantData.user_id}
                onValueChange={(value) => setGrantData({...grantData, user_id: value})}
              >
                <SelectTrigger className="bg-panel border border-white/15">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent className="bg-panel">
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.email} ({user.first_name} {user.last_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-star">Permission</label>
              <Select
                value={grantData.permission_id}
                onValueChange={(value) => setGrantData({...grantData, permission_id: value})}
              >
                <SelectTrigger className="bg-panel border border-white/15">
                  <SelectValue placeholder="Select a permission" />
                </SelectTrigger>
                <SelectContent className="bg-panel">
                  {permissions.map((permission) => (
                    <SelectItem key={permission.id} value={permission.id.toString()}>
                      {permission.key} - {permission.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGrantDialog(false)}
              className="border-black text-star hover:bg-white/[0.06]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGrantPermission}
              className="bg-black text-white hover:bg-gray-800"
            >
              Grant Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Permission Dialog */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent className="bg-panel text-star">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Revoke Permission</DialogTitle>
            <DialogDescription className="text-dim">
              Are you sure you want to revoke this permission?
            </DialogDescription>
          </DialogHeader>
          {selectedPermission && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p><span className="font-semibold">User:</span> {selectedPermission.user?.email}</p>
                <p><span className="font-semibold">Permission:</span> {selectedPermission.permission?.key}</p>
                <p><span className="font-semibold">Status:</span> {selectedPermission.is_active ? "Active" : "Inactive"}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRevokeDialog(false)}
              className="border-black text-star hover:bg-white/[0.06]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRevokePermission}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Revoke Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserPermissions;