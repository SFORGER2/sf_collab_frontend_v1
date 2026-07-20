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
    const colors = {
      'Administration': 'bg-purple-100 text-purple-800',
      'Dashboard': 'bg-blue-100 text-blue-800',
      'Projects': 'bg-green-100 text-green-800',
      'Ideation': 'bg-yellow-100 text-yellow-800',
      'Knowledge': 'bg-indigo-100 text-indigo-800',
      'Posts': 'bg-pink-100 text-pink-800',
      'Startups': 'bg-red-100 text-red-800',
      'AI Tools': 'bg-teal-100 text-teal-800',
      'Media Tools': 'bg-orange-100 text-orange-800',
      'Document Tools': 'bg-cyan-100 text-cyan-800',
      'Business Tools': 'bg-lime-100 text-lime-800',
      'Data Tools': 'bg-gray-100 text-gray-800',
      'Communication': 'bg-violet-100 text-violet-800',
      'Collaboration': 'bg-amber-100 text-amber-800',
      'Learning': 'bg-emerald-100 text-emerald-800',
      'Help': 'bg-rose-100 text-rose-800',
      'Settings': 'bg-sky-100 text-sky-800',
      'Technical': 'bg-stone-100 text-stone-800',
      'Development': 'bg-fuchsia-100 text-fuchsia-800',
      'Networking': 'bg-slate-100 text-slate-800',
      'Profile': 'bg-neutral-100 text-neutral-800',
      'Saved Items': 'bg-zinc-100 text-zinc-800',
      'Authentication': 'bg-stone-100 text-stone-800',
      'Public Pages': 'bg-amber-100 text-amber-800',
      'Notifications': 'bg-cyan-100 text-cyan-800'
    };
    
    return (
      <Badge className={`${colors[category] || 'bg-gray-100 text-gray-800'} border-0`}>
        {category || 'General'}
      </Badge>
    );
  };

  const filteredPermissions = selectedCategory === "all" 
    ? permissions 
    : permissions.filter(p => p.category === selectedCategory);

  if (loading) {
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
          <h1 className="text-3xl font-bold text-black">Permission Management</h1>
          <p className="text-gray-600 mt-2">
            Manage system permissions and access controls
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-black text-white hover:bg-gray-800 shadow-[0_4px_14px_0_rgba(255,255,255,0.3)]"
        >
          Create Permission
        </Button>
      </div>

      <Card className="border border-gray-200 shadow-[0_4px_14px_0_rgba(255,255,255,0.3)]">
        <CardHeader>
          <CardTitle className="text-xl text-black">Filters</CardTitle>
          <CardDescription className="text-gray-600">
            Filter permissions by category or search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search permissions by key or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white border border-gray-300"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] bg-white border border-gray-300">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-white">
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
        <TabsList className="bg-gray-100">
          <TabsTrigger value="list" className="data-[state=active]:bg-white">
            List View
          </TabsTrigger>
          <TabsTrigger value="byCategory" className="data-[state=active]:bg-white">
            By Category
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-white">
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card className="border border-gray-200 shadow-[0_4px_14px_0_rgba(255,255,255,0.3)]">
            <CardHeader>
              <CardTitle className="text-xl text-black">All Permissions</CardTitle>
              <CardDescription className="text-gray-600">
                {filteredPermissions.length} permission{filteredPermissions.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-black">ID</TableHead>
                      <TableHead className="font-semibold text-black">Key</TableHead>
                      <TableHead className="font-semibold text-black">Description</TableHead>
                      <TableHead className="font-semibold text-black">Category</TableHead>
                      <TableHead className="font-semibold text-black">Created</TableHead>
                      <TableHead className="font-semibold text-black">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPermissions.map((permission) => (
                      <TableRow key={permission.id} className="border-b border-gray-100">
                        <TableCell className="font-medium">{permission.id}</TableCell>
                        <TableCell>
                          <div className="font-medium text-black">{permission.key}</div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate" title={permission.description}>
                            {permission.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          {getCategoryBadge(permission.category)}
                        </TableCell>
                        <TableCell>
                          {new Date(permission.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
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
                              className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPermission(permission);
                                setShowDeleteDialog(true);
                              }}
                              className="border-red-600 text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Showing {filteredPermissions.length} of {pagination.total} permissions
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => fetchPermissions(pagination.page - 1)}
                    className="border-black text-black hover:bg-gray-100"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => fetchPermissions(pagination.page + 1)}
                    className="border-black text-black hover:bg-gray-100"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="byCategory" className="space-y-4">
          {categories.filter(c => c !== 'all').map(category => {
            const categoryPermissions = permissions.filter(p => p.category === category);
            return (
              <Card key={category} className="border border-gray-200 shadow-[0_4px_14px_0_rgba(255,255,255,0.3)]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getCategoryBadge(category)}
                      <CardTitle className="text-lg text-black">
                        {category} ({categoryPermissions.length})
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categoryPermissions.map(permission => (
                      <div key={permission.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <div className="font-medium text-black">{permission.key}</div>
                          <div className="text-sm text-gray-600">{permission.description}</div>
                        </div>
                        <div className="flex space-x-2">
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
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="stats">
          <Card className="border border-gray-200 shadow-[0_4px_14px_0_rgba(255,255,255,0.3)]">
            <CardHeader>
              <CardTitle className="text-xl text-black">Permission Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Total Permissions</div>
                  <div className="text-2xl font-bold text-black">{pagination.total}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Categories</div>
                  <div className="text-2xl font-bold text-black">{categories.length - 1}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Average per Category</div>
                  <div className="text-2xl font-bold text-black">
                    {Math.round(pagination.total / (categories.length - 1))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-black mb-4">Permissions by Category</h3>
                <div className="space-y-3">
                  {categories.filter(c => c !== 'all').map(category => {
                    const count = permissions.filter(p => p.category === category).length;
                    const percentage = Math.round((count / pagination.total) * 100);
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">{category}</span>
                          <span className="font-medium text-black">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-black rounded-full"
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
        <DialogContent className="bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create New Permission</DialogTitle>
            <DialogDescription className="text-gray-600">
              Add a new permission to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-black">Permission Key *</label>
              <Input
                value={formData.key}
                onChange={(e) => setFormData({...formData, key: e.target.value})}
                placeholder="e.g., admin.access"
                className="bg-white border border-gray-300"
              />
              <p className="text-xs text-gray-500">Unique identifier for the permission</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-black">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what this permission allows..."
                className="min-h-[100px] bg-white border border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-black">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger className="bg-white border border-gray-300">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
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
              className="border-black text-black hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePermission}
              className="bg-black text-white hover:bg-gray-800"
            >
              Create Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permission Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Permission</DialogTitle>
            <DialogDescription className="text-gray-600">
              Update permission details
            </DialogDescription>
          </DialogHeader>
          {selectedPermission && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-black">Permission Key *</label>
                <Input
                  value={formData.key}
                  onChange={(e) => setFormData({...formData, key: e.target.value})}
                  className="bg-white border border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-black">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="min-h-[100px] bg-white border border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-black">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger className="bg-white border border-gray-300">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
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
              className="border-black text-black hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePermission}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Update Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Permission Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Delete Permission</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this permission? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedPermission && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p><span className="font-semibold">Key:</span> {selectedPermission.key}</p>
                <p><span className="font-semibold">Description:</span> {selectedPermission.description}</p>
                <p><span className="font-semibold">Category:</span> {selectedPermission.category}</p>
                <p className="text-red-600 text-sm mt-4">
                  ⚠️ Warning: Deleting a permission may affect users who currently have this permission.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-black text-black hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeletePermission}
              className="bg-red-600 hover:bg-red-700 text-white"
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