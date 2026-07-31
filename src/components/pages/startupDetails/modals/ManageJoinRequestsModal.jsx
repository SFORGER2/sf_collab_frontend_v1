import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../ui/dialog';
import { Card, CardContent } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { CheckCircle2Icon, XIcon, Sparkles, ClipboardList, ShieldCheck, Linkedin, Globe, Github } from 'lucide-react';
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
      <DialogContent className="mt-4 max-w-2xl border border-zinc-800 bg-zinc-900 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-zinc-50">
            <ClipboardList className="h-5 w-5 text-indigo-400" />
            Manage Join Requests
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {startupName && (
              <span className="mb-2 block font-semibold text-zinc-300">
                For: <span className="text-indigo-400">{startupName}</span>
              </span>
            )}
            Review and respond to requests from people who want to join your team
          </DialogDescription>
        </DialogHeader>

        {/* Info Box showing who is making decisions */}
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-3">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
          <p className="text-xs text-indigo-300">
            <span className="font-semibold text-zinc-100">{founderName}</span> (Founder) — you are reviewing and can accept or reject requests
          </p>
        </div>

        <div className="max-h-[400px] space-y-4 overflow-y-auto pr-2">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-32 animate-pulse rounded bg-zinc-800" />
                      <div className="h-3 w-20 animate-pulse rounded bg-zinc-800" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !hasRequests ? (
            <div className="py-12 text-center">
              <div className="mb-3 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/80">
                  <ClipboardList className="h-6 w-6 text-zinc-500" />
                </div>
              </div>
              <p className="mb-1 text-sm font-medium text-zinc-200">No pending requests</p>
              <p className="text-xs text-zinc-500">When someone requests to join, they'll appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
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
                  <Card key={request.id || request.request_id} className="border border-zinc-800 bg-zinc-900/60 transition-colors hover:border-zinc-700">
                    <CardContent className="px-4 py-3">
                      {/* Requester Info */}
                      <div className="mb-3 flex items-center justify-between gap-1">
                        <div className="flex flex-1 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                            {requesterName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-zinc-100">{requesterName}</p>
                            <Badge className="mt-1 border border-amber-500/20 bg-amber-500/10 text-xs font-medium text-amber-400 hover:bg-amber-500/10">
                              {requestedRole}
                            </Badge>
                          </div>
                        </div>

                        {/* Inline Action Buttons */}
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500/30 bg-transparent px-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            onClick={() => onReject?.(request)}
                            disabled={!onReject}
                          >
                            <XIcon className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-emerald-600 px-2.5 text-white hover:bg-emerald-500"
                            onClick={() => onAccept?.(request)}
                            disabled={!onAccept}
                          >
                            <CheckCircle2Icon className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {message !== 'No message provided' && (
                        <p className="mb-2 rounded bg-zinc-950/50 px-2 py-1.5 text-xs italic text-zinc-400">
                          "{message}"
                        </p>
                      )}

                      {/* AI Explanation Section */}
                      {getAiExplanation(request) && (
                        <div className="mb-3 flex items-start gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-2.5 text-xs">
                          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
                          <div>
                            <span className="mr-1 font-semibold text-indigo-300">AI Fit Analysis:</span>
                            <span className="leading-relaxed text-zinc-400">{getAiExplanation(request)}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>Requested: {createdDate ? new Date(createdDate).toLocaleDateString() : 'N/A'}</span>
                        {request.mediaLinks && (request.mediaLinks.linkedin || request.mediaLinks.portfolio || request.mediaLinks.github) && (
                          <div className="flex gap-3">
                            {request.mediaLinks.linkedin && (
                              <a href={request.mediaLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
                                <Linkedin className="h-3 w-3" />
                                LinkedIn
                              </a>
                            )}
                            {request.mediaLinks.portfolio && (
                              <a href={request.mediaLinks.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
                                <Globe className="h-3 w-3" />
                                Portfolio
                              </a>
                            )}
                            {request.mediaLinks.github && (
                              <a href={request.mediaLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
                                <Github className="h-3 w-3" />
                                GitHub
                              </a>
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

        <DialogFooter className="border-t border-zinc-800 pt-4">
          <Button variant="ghost" onClick={onClose} className="text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
export default ManageJoinRequestsModal;
