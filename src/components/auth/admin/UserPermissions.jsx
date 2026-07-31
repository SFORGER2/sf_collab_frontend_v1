import React, { useState, useEffect, useMemo } from "react";
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
import {
  ShieldPlus,
  ShieldOff,
  ShieldCheck,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Users,
  KeyRound,
  X,
} from "lucide-react";

const StatusBadge = ({ isActive }) =>
  isActive ? (
    <Badge className="gap-1.5 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 font-medium">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      Active
    </Badge>
  ) : (
    <Badge className="gap-1.5 border border-zinc-600/40 bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/10 font-medium">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
      Inactive
    </Badge>
  );

const SortHeader = ({ label, sortKey, sortConfig, onSort }) => {
  const isActive = sortConfig.key === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400 hover:text-zinc-200 transition-colors"
    >
      {label}
      {isActive ? (
        sortConfig.direction === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5 text-indigo-400" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5 text-indigo-400" />
        )
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 text-zinc-600" />
      )}
    </button>
  );
};

const TableSkeleton = ({ rows = 6 }) => (
  <div className="divide-y divide-zinc-800/60">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-4">
        <div className="h-3.5 w-40 animate-pulse rounded bg-zinc-800" />
        <div className="h-3.5 w-56 animate-pulse rounded bg-zinc-800" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-800" />
        <div className="h-3.5 w-24 animate-pulse rounded bg-zinc-800" />
        <div className="h-3.5 w-20 animate-pulse rounded bg-zinc-800" />
        <div className="ml-auto h-7 w-16 animate-pulse rounded-md bg-zinc-800" />
      </div>
    ))}
  </div>
);

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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();

  const fetchUserPermissions = async (page = 1, perPageOverride = null) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: perPageOverride || pagination.per_page,
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

  const handlePerPageChange = (value) => {
    const newPerPage = parseInt(value);
    fetchUserPermissions(1, newPerPage);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedUserPermissions = useMemo(() => {
    if (!sortConfig.key) return userPermissions;
    const getValue = (row) => {
      switch (sortConfig.key) {
        case "user":
          return row.user?.email || "";
        case "permission":
          return row.permission?.key || "";
        case "status":
          return row.is_active ? 1 : 0;
        case "granted_at":
          return new Date(row.created_at).getTime();
        default:
          return "";
      }
    };
    const sorted = [...userPermissions].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (va < vb) return sortConfig.direction === "asc" ? -1 : 1;
      if (va > vb) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [userPermissions, sortConfig]);

  const hasActiveFilters = Boolean(searchUser || searchPermission || !onlyActive);

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">User Permissions</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage permissions assigned to users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => fetchUserPermissions(pagination.page)}
            variant="outline"
            className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowGrantDialog(true)}
            className="bg-indigo-600 text-white hover:bg-indigo-500"
          >
            <ShieldPlus className="mr-2 h-4 w-4" />
            Grant Permission
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-zinc-800 bg-zinc-900/60 rounded-2xl">
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Filter className="h-4 w-4 text-zinc-500" />
            Filters
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Filter by User</label>
              <Select value={searchUser} onValueChange={setSearchUser}>
                <SelectTrigger className="border border-zinc-700 bg-zinc-950 text-zinc-200 focus:ring-indigo-500">
                  <Users className="mr-2 h-4 w-4 text-zinc-500" />
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent position="bottom" className="border border-zinc-800 bg-zinc-900 text-zinc-200">
                  <SelectItem value="--">All users</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.email} ({u.first_name} {u.last_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Filter by Permission</label>
              <Select value={searchPermission} onValueChange={setSearchPermission}>
                <SelectTrigger className="border border-zinc-700 bg-zinc-950 text-zinc-200 focus:ring-indigo-500">
                  <KeyRound className="mr-2 h-4 w-4 text-zinc-500" />
                  <SelectValue placeholder="All permissions" />
                </SelectTrigger>
                <SelectContent className="border border-zinc-800 bg-zinc-900 text-zinc-200">
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
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Status Filter</label>
              <Select
                value={onlyActive.toString()}
                onValueChange={(value) => setOnlyActive(value === "true")}
              >
                <SelectTrigger className="border border-zinc-700 bg-zinc-950 text-zinc-200 focus:ring-indigo-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border border-zinc-800 bg-zinc-900 text-zinc-200">
                  <SelectItem value="true">Active Only</SelectItem>
                  <SelectItem value="false">All Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              onClick={handleSearch}
              className="bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Apply Filters
            </Button>
            <Button
              onClick={handleClearFilters}
              variant="outline"
              disabled={!hasActiveFilters}
              className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-40"
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-zinc-800 bg-zinc-900/60 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-zinc-800/80">
          <CardTitle className="text-lg text-zinc-50">User Permissions</CardTitle>
          <CardDescription className="text-zinc-400">
            Showing {userPermissions.length} of {pagination.total} permission{pagination.total !== 1 ? 's' : ''}
            {searchUser && searchUser !== "--" && ` · filtered by user`}
            {searchPermission && searchPermission !== "--" && ` · filtered by permission`}
            {onlyActive && ` · active only`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton />
          ) : userPermissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/80">
                <ShieldOff className="h-6 w-6 text-zinc-500" />
              </div>
              <div>
                <p className="font-medium text-zinc-200">No permissions found</p>
                <p className="mt-1 text-sm text-zinc-500">Try adjusting your filters or grant a new permission.</p>
              </div>
              {hasActiveFilters && (
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="mt-2 border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur hover:bg-zinc-900/95">
                      <TableHead className="py-3">
                        <SortHeader label="User" sortKey="user" sortConfig={sortConfig} onSort={handleSort} />
                      </TableHead>
                      <TableHead className="py-3">
                        <SortHeader label="Permission" sortKey="permission" sortConfig={sortConfig} onSort={handleSort} />
                      </TableHead>
                      <TableHead className="py-3">
                        <SortHeader label="Status" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />
                      </TableHead>
                      <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        Granted By
                      </TableHead>
                      <TableHead className="py-3">
                        <SortHeader label="Granted At" sortKey="granted_at" sortConfig={sortConfig} onSort={handleSort} />
                      </TableHead>
                      <TableHead className="py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedUserPermissions.map((up, idx) => (
                      <TableRow
                        key={up.id}
                        className={`border-b border-zinc-800/60 transition-colors hover:bg-zinc-800/40 ${
                          idx % 2 === 1 ? "bg-zinc-900/30" : ""
                        }`}
                      >
                        <TableCell className="py-3.5 font-medium text-zinc-200">
                          {up.user?.email || `User ${up.user_id}`}
                        </TableCell>
                        <TableCell className="py-3.5">
                          <div>
                            <div className="font-medium text-zinc-200">{up.permission?.key}</div>
                            <div className="text-sm text-zinc-500">{up.permission?.description}</div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <StatusBadge isActive={up.is_active} />
                        </TableCell>
                        <TableCell className="py-3.5 text-zinc-400">
                          {up.granted_by === user?.id ? "You" : `User ${up.granted_by}`}
                        </TableCell>
                        <TableCell className="py-3.5 text-zinc-400">
                          {new Date(up.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="py-3.5 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPermission(up);
                              setShowRevokeDialog(true);
                            }}
                            className="border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          >
                            <ShieldOff className="mr-1.5 h-3.5 w-3.5" />
                            Revoke
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-800/80 px-4 py-4 sm:flex-row">
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <span>Rows per page</span>
                  <Select value={pagination.per_page.toString()} onValueChange={handlePerPageChange}>
                    <SelectTrigger className="h-8 w-[72px] border border-zinc-700 bg-zinc-950 text-zinc-200 focus:ring-indigo-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border border-zinc-800 bg-zinc-900 text-zinc-200">
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {pagination.pages > 1 && (
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="h-8 w-8 border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
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
                          size="icon"
                          variant="outline"
                          onClick={() => handlePageChange(pageNum)}
                          className={`h-8 w-8 border-zinc-700 ${
                            pagination.page === pageNum
                              ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500"
                              : "bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="h-8 w-8 border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="text-sm text-zinc-500">
                  Page {pagination.page} of {pagination.pages}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Grant Permission Dialog */}
      <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
        <DialogContent className="border border-zinc-800 bg-zinc-900 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-zinc-50">
              <ShieldPlus className="h-5 w-5 text-indigo-400" />
              Grant Permission
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Grant a permission to a user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">User</label>
              <Select
                value={grantData.user_id}
                onValueChange={(value) => setGrantData({ ...grantData, user_id: value })}
              >
                <SelectTrigger className="border border-zinc-700 bg-zinc-950 text-zinc-200 focus:ring-indigo-500">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent className="border border-zinc-800 bg-zinc-900 text-zinc-200">
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.email} ({u.first_name} {u.last_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Permission</label>
              <Select
                value={grantData.permission_id}
                onValueChange={(value) => setGrantData({ ...grantData, permission_id: value })}
              >
                <SelectTrigger className="border border-zinc-700 bg-zinc-950 text-zinc-200 focus:ring-indigo-500">
                  <SelectValue placeholder="Select a permission" />
                </SelectTrigger>
                <SelectContent className="border border-zinc-800 bg-zinc-900 text-zinc-200">
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
              className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGrantPermission}
              className="bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Grant Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Permission Dialog */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent className="border border-zinc-800 bg-zinc-900 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-zinc-50">
              <ShieldOff className="h-5 w-5 text-red-400" />
              Revoke Permission
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to revoke this permission?
            </DialogDescription>
          </DialogHeader>
          {selectedPermission && (
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-sm">
              <p className="flex justify-between gap-4">
                <span className="text-zinc-500">User</span>
                <span className="font-medium text-zinc-200">{selectedPermission.user?.email}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-zinc-500">Permission</span>
                <span className="font-medium text-zinc-200">{selectedPermission.permission?.key}</span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span className="text-zinc-500">Status</span>
                <StatusBadge isActive={selectedPermission.is_active} />
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRevokeDialog(false)}
              className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRevokePermission}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              <ShieldCheck className="mr-1.5 h-4 w-4" />
              Revoke Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserPermissions;
