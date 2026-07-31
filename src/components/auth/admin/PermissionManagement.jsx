// components/auth/admin/PermissionManagement.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../ui/tabs";
import { permissionsAPI } from "@/utils/APIs/permissionsAPI";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  LayoutGrid,
  BarChart3,
  AlertTriangle,
  KeyRound,
} from "lucide-react";

const CATEGORY_COLORS = {
  'Administration': 'border-purple-500/20 bg-purple-500/10 text-purple-400',
  'Dashboard': 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  'Projects': 'border-green-500/20 bg-green-500/10 text-green-400',
  'Ideation': 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400',
  'Knowledge': 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400',
  'Posts': 'border-pink-500/20 bg-pink-500/10 text-pink-400',
  'Startups': 'border-red-500/20 bg-red-500/10 text-red-400',
  'AI Tools': 'border-teal-500/20 bg-teal-500/10 text-teal-400',
  'Media Tools': 'border-orange-500/20 bg-orange-500/10 text-orange-400',
  'Document Tools': 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
  'Business Tools': 'border-lime-500/20 bg-lime-500/10 text-lime-400',
  'Data Tools': 'border-zinc-500/20 bg-zinc-500/10 text-zinc-400',
  'Communication': 'border-violet-500/20 bg-violet-500/10 text-violet-400',
  'Collaboration': 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  'Learning': 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  'Help': 'border-rose-500/20 bg-rose-500/10 text-rose-400',
  'Settings': 'border-sky-500/20 bg-sky-500/10 text-sky-400',
  'Technical': 'border-stone-500/20 bg-stone-500/10 text-stone-400',
  'Development': 'border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-400',
  'Networking': 'border-slate-500/20 bg-slate-500/10 text-slate-400',
  'Profile': 'border-neutral-500/20 bg-neutral-500/10 text-neutral-400',
  'Saved Items': 'border-zinc-500/20 bg-zinc-500/10 text-zinc-400',
  'Authentication': 'border-stone-500/20 bg-stone-500/10 text-stone-400',
  'Public Pages': 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  'Notifications': 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
};

const TableSkeleton = ({ rows = 6 }) => (
  <div className="divide-y divide-zinc-800/60">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-4">
        <div className="h-3.5 w-8 animate-pulse rounded bg-zinc-800" />
        <div className="h-3.5 w-32 animate-pulse rounded bg-zinc-800" />
        <div className="h-3.5 w-64 animate-pulse rounded bg-zinc-800" />
        <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-800" />
        <div className="h-3.5 w-20 animate-pulse rounded bg-zinc-800" />
        <div className="ml-auto h-7 w-24 animate-pulse rounded-md bg-zinc-800" />
      </div>
    ))}
  </div>
);

const PermissionManagement = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, per_page: 20, total: 0, pages: 0 });
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [formData, setFormData] = useState({
    key: "",
    description: "",
    category: "General"
  });
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();

  const fetchPermissions = async (page = 1) => {
    setLoading(true);

    try {
      const data = await permissionsAPI.getAll({
        page,
        per_page: pagination.per_page,
        search: search || undefined
      });

      if (data.success) {
        setPermissions(data.data.permissions || []);
        setPagination(data.data.pagination);

        // Extract unique categories
        const uniqueCategories = [...new Set(data.data.permissions.map(p => p.category || 'General'))];
        setCategories(['all', ...uniqueCategories]);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [search]);

  const handleCreatePermission = async () => {
    if (!formData.key.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await permissionsAPI.create(formData);

      if (response.success) {
        toast({
          title: "Success",
          description: "Permission created successfully",
        });
        setShowCreateDialog(false);
        setFormData({ key: "", description: "", category: "General" });
        fetchPermissions(pagination.page);
      } else {
        throw new Error(response.message || "Failed to create permission");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create permission",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePermission = async () => {
    if (!selectedPermission || !formData.key.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await permissionsAPI.update(selectedPermission.id, formData);

      if (response.success) {
        toast({
          title: "Success",
          description: "Permission updated successfully",
        });
        setShowEditDialog(false);
        fetchPermissions(pagination.page);
      } else {
        throw new Error(response.message || "Failed to update permission");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update permission",
        variant: "destructive"
      });
    }
  };

  const handleDeletePermission = async () => {
    if (!selectedPermission) return;

    try {
      const response = await permissionsAPI.delete(selectedPermission.id);

      if (response.success) {
        toast({
          title: "Success",
          description: "Permission deleted successfully",
        });
        setShowDeleteDialog(false);
        fetchPermissions(pagination.page);
      } else {
        throw new Error(response.message || "Failed to delete permission");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete permission",
        variant: "destructive"
      });
    }
  };

  const getCategoryBadge = (category) => {
    const className = CATEGORY_COLORS[category] || 'border-zinc-500/20 bg-zinc-500/10 text-zinc-400';
    return (
      <Badge className={`${className} border font-medium hover:bg-transparent`}>
        {category || 'General'}
      </Badge>
    );
  };

  const filteredPermissions = selectedCategory === "all"
    ? permissions
    : permissions.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Permission Management</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage system permissions and access controls
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-indigo-600 text-white hover:bg-indigo-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Permission
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-zinc-800 bg-zinc-900/60 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base text-zinc-100">
            <ListFilter className="h-4 w-4 text-zinc-500" />
            Filters
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Filter permissions by category or search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                placeholder="Search permissions by key or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-zinc-700 bg-zinc-950 pl-9 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-indigo-500"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full border border-zinc-700 bg-zinc-950 text-zinc-200 focus:ring-indigo-500 md:w-[200px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="border border-zinc-800 bg-zinc-900 text-zinc-200">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.filter(c => c !== 'all').map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="border border-zinc-800 bg-zinc-900/60">
          <TabsTrigger value="list" className="gap-1.5 text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">
            <KeyRound className="h-3.5 w-3.5" />
            List View
          </TabsTrigger>
          <TabsTrigger value="byCategory" className="gap-1.5 text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">
            <LayoutGrid className="h-3.5 w-3.5" />
            By Category
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5 text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">
            <BarChart3 className="h-3.5 w-3.5" />
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          <Card className="border border-zinc-800 bg-zinc-900/60 rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-zinc-800/80">
              <CardTitle className="text-lg text-zinc-50">All Permissions</CardTitle>
              <CardDescription className="text-zinc-400">
                {filteredPermissions.length} permission{filteredPermissions.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <TableSkeleton />
              ) : filteredPermissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/80">
                    <KeyRound className="h-6 w-6 text-zinc-500" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-200">No permissions found</p>
                    <p className="mt-1 text-sm text-zinc-500">Try a different search term or category, or create a new permission.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur hover:bg-zinc-900/95">
                          <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">ID</TableHead>
                          <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Key</TableHead>
                          <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Description</TableHead>
                          <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Category</TableHead>
                          <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Created</TableHead>
                          <TableHead className="py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPermissions.map((permission, idx) => (
                          <TableRow
                            key={permission.id}
                            className={`border-b border-zinc-800/60 transition-colors hover:bg-zinc-800/40 ${
                              idx % 2 === 1 ? "bg-zinc-900/30" : ""
                            }`}
                          >
                            <TableCell className="py-3.5 font-mono text-sm text-zinc-500">{permission.id}</TableCell>
                            <TableCell className="py-3.5">
                              <div className="font-medium text-zinc-200">{permission.key}</div>
                            </TableCell>
                            <TableCell className="max-w-xs py-3.5">
                              <p className="truncate text-zinc-400" title={permission.description}>
                                {permission.description}
                              </p>
                            </TableCell>
                            <TableCell className="py-3.5">
                              {getCategoryBadge(permission.category)}
                            </TableCell>
                            <TableCell className="py-3.5 text-zinc-400">
                              {new Date(permission.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="py-3.5 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPermission(permission);
                                    setFormData({
                                      key: permission.key,
                                      description: permission.description,
                                      category: permission.category || "General"
                                    });
                                    setShowEditDialog(true);
                                  }}
                                  className="border-blue-500/30 bg-transparent text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                                >
                                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPermission(permission);
                                    setShowDeleteDialog(true);
                                  }}
                                  className="border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                >
                                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-800/80 px-4 py-4">
                    <div className="text-sm text-zinc-500">
                      Showing {filteredPermissions.length} of {pagination.total} permissions
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        disabled={pagination.page === 1}
                        onClick={() => fetchPermissions(pagination.page - 1)}
                        className="h-8 w-8 border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="px-2 text-sm text-zinc-500">
                        Page {pagination.page} of {pagination.pages}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        disabled={pagination.page === pagination.pages}
                        onClick={() => fetchPermissions(pagination.page + 1)}
                        className="h-8 w-8 border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Category */}
        <TabsContent value="byCategory" className="space-y-4">
          {loading ? (
            <Card className="border border-zinc-800 bg-zinc-900/60 rounded-2xl">
              <CardContent className="p-0">
                <TableSkeleton rows={4} />
              </CardContent>
            </Card>
          ) : (
            categories.filter(c => c !== 'all').map(category => {
              const categoryPermissions = permissions.filter(p => p.category === category);
              return (
                <Card key={category} className="border border-zinc-800 bg-zinc-900/60 rounded-2xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      {getCategoryBadge(category)}
                      <CardTitle className="text-base text-zinc-100">
                        {category} <span className="text-zinc-500 font-normal">({categoryPermissions.length})</span>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categoryPermissions.map(permission => (
                        <div
                          key={permission.id}
                          className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 transition-colors hover:bg-zinc-800/40"
                        >
                          <div>
                            <div className="font-medium text-zinc-200">{permission.key}</div>
                            <div className="text-sm text-zinc-500">{permission.description}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPermission(permission);
                              setFormData({
                                key: permission.key,
                                description: permission.description,
                                category: permission.category || "General"
                              });
                              setShowEditDialog(true);
                            }}
                            className="border-blue-500/30 bg-transparent text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                          >
                            <Pencil className="mr-1.5 h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Statistics */}
        <TabsContent value="stats">
          <Card className="border border-zinc-800 bg-zinc-900/60 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg text-zinc-50">Permission Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <div className="text-sm text-zinc-500">Total Permissions</div>
                  <div className="mt-1 text-2xl font-bold text-zinc-50">{pagination.total}</div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <div className="text-sm text-zinc-500">Categories</div>
                  <div className="mt-1 text-2xl font-bold text-zinc-50">{categories.length - 1}</div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <div className="text-sm text-zinc-500">Average per Category</div>
                  <div className="mt-1 text-2xl font-bold text-zinc-50">
                    {Math.round(pagination.total / (categories.length - 1))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">Permissions by Category</h3>
                <div className="space-y-3">
                  {categories.filter(c => c !== 'all').map(category => {
                    const count = permissions.filter(p => p.category === category).length;
                    const percentage = Math.round((count / pagination.total) * 100);
                    return (
                      <div key={category} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-300">{category}</span>
                          <span className="font-medium text-zinc-100">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Permission Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="border border-zinc-800 bg-zinc-900 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-zinc-50">
              <Plus className="h-5 w-5 text-indigo-400" />
              Create New Permission
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Add a new permission to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Permission Key *</label>
              <Input
                value={formData.key}
                onChange={(e) => setFormData({...formData, key: e.target.value})}
                placeholder="e.g., admin.access"
                className="border border-zinc-700 bg-zinc-950 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-indigo-500"
              />
              <p className="text-xs text-zinc-500">Unique identifier for the permission</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what this permission allows..."
                className="min-h-[100px] border border-zinc-700 bg-zinc-950 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger className="border border-zinc-700 bg-zinc-950 text-zinc-200 focus:ring-indigo-500">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="border border-zinc-800 bg-zinc-900 text-zinc-200">
                  {categories.filter(c => c !== 'all').map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePermission}
              className="bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Create Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permission Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="border border-zinc-800 bg-zinc-900 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-zinc-50">
              <Pencil className="h-5 w-5 text-blue-400" />
              Edit Permission
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update permission details
            </DialogDescription>
          </DialogHeader>
          {selectedPermission && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Permission Key *</label>
                <Input
                  value={formData.key}
                  onChange={(e) => setFormData({...formData, key: e.target.value})}
                  className="border border-zinc-700 bg-zinc-950 text-zinc-200 focus-visible:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="min-h-[100px] border border-zinc-700 bg-zinc-950 text-zinc-200 focus-visible:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger className="border border-zinc-700 bg-zinc-950 text-zinc-200 focus:ring-indigo-500">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="border border-zinc-800 bg-zinc-900 text-zinc-200">
                    {categories.filter(c => c !== 'all').map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePermission}
              className="bg-blue-600 text-white hover:bg-blue-500"
            >
              Update Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Permission Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="border border-zinc-800 bg-zinc-900 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-zinc-50">
              <Trash2 className="h-5 w-5 text-red-400" />
              Delete Permission
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete this permission? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedPermission && (
            <div className="space-y-3 py-2">
              <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-sm">
                <p className="flex justify-between gap-4">
                  <span className="text-zinc-500">Key</span>
                  <span className="font-medium text-zinc-200">{selectedPermission.key}</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span className="text-zinc-500">Description</span>
                  <span className="max-w-[240px] text-right font-medium text-zinc-200">{selectedPermission.description}</span>
                </p>
                <p className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">Category</span>
                  {getCategoryBadge(selectedPermission.category)}
                </p>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <p className="text-sm text-amber-300">
                  Deleting a permission may affect users who currently have this permission.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeletePermission}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              Delete Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PermissionManagement;
