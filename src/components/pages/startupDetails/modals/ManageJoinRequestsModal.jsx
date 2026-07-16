import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../ui/dialog';
import { Card, CardContent } from '../../../ui/card';
import { CheckCircle2Icon, XIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getAiExplanation = (item) => {
  if (!item) return null;
  const val = 
    item.explanation || 
    item.aiExplanation || 
    item.ai_explanation || 
    item.recommendationReason || 
    item.recommendation_reason || 
    item.fallbackReason || 
    item.fallback_reason || 
    item.reason || 
    (Array.isArray(item.reasons) ? item.reasons.join(', ') : item.reasons);
  
  if (typeof val === 'string' && val.trim() !== '') {
    return val.trim();
  }
  return null;
};

const ManageJoinRequestsModal = ({
  isOpen,
  onClose,
  joinRequests = [],
  loading = false,
  onAccept,
  onReject,
  founderName = 'You',
  startupName = '',
}) => {
  const requests = Array.isArray(joinRequests) ? joinRequests : [];
  const pendingRequests = requests.filter(r => r.status === 'pending' || !r.status);
  const hasRequests = pendingRequests.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-800 border border-white/10 mt-4">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">📋 Manage Join Requests</DialogTitle>
          <DialogDescription className="text-gray-400">
            {startupName && <span className="block font-semibold text-white/80 mb-2">For: <span className="text-blue-400">{startupName}</span></span>}
            Review and respond to requests from people who want to join your team
          </DialogDescription>
        </DialogHeader>

        {/* Info Box showing who is making decisions */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-300">
            ✓ <span className="font-semibold text-white">{founderName}</span> (Founder) - You are reviewing and can accept/reject requests
          </p>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {loading ? (
            <div className="text-center py-20 text-sm text-gray-400">
              Loading join requests…
            </div>
          ) : !hasRequests ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-sm mb-2">✨ No pending requests</div>
              <p className="text-xs text-gray-500">When someone requests to join, they'll appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 font-semibold px-1">
                {pendingRequests.length} Request{pendingRequests.length !== 1 ? 's' : ''} Pending
              </p>
              {requests.map((request) => {
                // Handle both camelCase (backend) and snake_case field names
                const requesterName = request.full_name || 
                  `${request.firstName || request.first_name || ''} ${request.lastName || request.last_name || ''}`.trim() || 
                  'Anonymous Builder';
                const requestedRole = request.role || 'Team Member';
                const message = request.message || 'No message provided';
                const createdDate = request.createdAt || request.created_at;
                
                return (
                  <Card key={request.id || request.request_id} className="bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                    <CardContent className="py-1 px-4">
                      {/* Requester Info */}
                        <div className="flex items-center justify-between gap-1 mb-3">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm">
                              {requesterName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white truncate">{requesterName}</p>
                              <p className="text-xs text-gray-400">
                                <span className="text-yellow-400 font-semibold">{requestedRole}</span>
                              </p>
                            </div>
                          </div>
                          
                          {/* Inline Action Buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs px-2.5"
                              onClick={() => onReject?.(request)}
                              disabled={!onReject}
                            >
                              <XIcon className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              className="text-xs px-2.5 bg-green-600 hover:bg-green-700"
                              onClick={() => onAccept?.(request)}
                              disabled={!onAccept}
                            >
                              <CheckCircle2Icon className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        
                        {message !== 'No message provided' && (
                          <p className="text-xs text-gray-300 italic bg-white/5 rounded px-2 py-1.5 mb-2">
                            "{message}"
                          </p>
                        )}
                        
                        {/* AI Explanation Section */}
                        {getAiExplanation(request) && (
                          <div className="p-2.5 rounded-lg border border-blue-500/20 bg-blue-500/5 flex items-start gap-2 text-xs mb-3">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-blue-300 mr-1">AI Fit Analysis:</span>
                              <span className="text-gray-300 leading-relaxed">{getAiExplanation(request)}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Requested: {createdDate ? new Date(createdDate).toLocaleDateString() : 'N/A'}</span>
                          {request.mediaLinks && (request.mediaLinks.linkedin || request.mediaLinks.portfolio || request.mediaLinks.github) && (
                            <div className="flex gap-2">
                              {request.mediaLinks.linkedin && (
                                <a href={request.mediaLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">LinkedIn</a>
                              )}
                              {request.mediaLinks.portfolio && (
                                <a href={request.mediaLinks.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Portfolio</a>
                              )}
                              {request.mediaLinks.github && (
                                <a href={request.mediaLinks.github} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">GitHub</a>
                              )}
                            </div>
                          )}
                        </div>

                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t border-white/5">
          <Button variant="ghost" onClick={onClose} className="text-sm text-gray-300">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
export default ManageJoinRequestsModal;