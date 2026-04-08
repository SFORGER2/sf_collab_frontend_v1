import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Badge } from "../../ui/badge";
import { Textarea } from "../../ui/textarea";
import { useToast } from "../../hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AccessRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/access-requests?status=pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.data.access_requests || []);
      }
    } catch (error) {
      console.error("Error fetching access requests:", error);
      toast({
        title: "Error",
        description: "Failed to load access requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/access-requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Access request approved successfully",
        });
        setShowApproveDialog(false);
        fetchRequests();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to approve request");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve request",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (requestId) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/access-requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rejection_reason: rejectionReason
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Access request rejected successfully",
        });
        setShowRejectDialog(false);
        setRejectionReason("");
        fetchRequests();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to reject request");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject request",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    return (
      <Badge className={`${variants[status]} border-0`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

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
          <h1 className="text-3xl font-bold text-black">Access Requests</h1>
          <p className="text-gray-600 mt-2">
            Review and manage permission access requests from users
          </p>
        </div>
        <Button
          onClick={fetchRequests}
          variant="outline"
          className="border-black text-black hover:bg-gray-100"
        >
          Refresh
        </Button>
      </div>

      <Card className="border border-gray-200 shadow-[0_4px_14px_0_rgba(255,255,255,0.3)]">
        <CardHeader>
          <CardTitle className="text-xl text-black">Pending Requests</CardTitle>
          <CardDescription className="text-gray-600">
            {requests.length} pending request{requests.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending access requests
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-black">User</TableHead>
                    <TableHead className="font-semibold text-black">Permission</TableHead>
                    <TableHead className="font-semibold text-black">Reason</TableHead>
                    <TableHead className="font-semibold text-black">Requested</TableHead>
                    <TableHead className="font-semibold text-black">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id} className="border-b border-gray-100">
                      <TableCell >
                        <div>
                          <div className="font-medium text-black">{request.user?.first_name || `User ${request.user_id}`} {request.user?.last_name || `User ${request.user_id}`}</div>
                          <div className="text-sm text-gray-600">{request.user?.email || `User ${request.user_id}`}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-black">{request.permission?.key}</div>
                          <div className="text-sm text-gray-600">{request.permission?.description}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate" title={request.reason}>
                          {request.reason}
                        </p>
                      </TableCell>
                      <TableCell>
                        {new Date(request.requested_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowApproveDialog(true);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRejectDialog(true);
                            }}
                            className="border-red-600 text-red-600 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Approve Access Request</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to approve this access request?
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p><span className="font-semibold">User:</span> {selectedRequest.user?.email}</p>
                <p><span className="font-semibold">Permission:</span> {selectedRequest.permission?.key}</p>
                <p><span className="font-semibold">Reason:</span> {selectedRequest.reason}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              className="border-black text-black hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleApprove(selectedRequest?.id)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Reject Access Request</DialogTitle>
            <DialogDescription className="text-gray-600">
              Please provide a reason for rejecting this request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p><span className="font-semibold">User:</span> {selectedRequest.user?.email}</p>
                <p><span className="font-semibold">Permission:</span> {selectedRequest.permission?.key}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-black">Rejection Reason</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="min-h-[100px] bg-white border border-gray-300"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
              }}
              className="border-black text-black hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleReject(selectedRequest?.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccessRequests;