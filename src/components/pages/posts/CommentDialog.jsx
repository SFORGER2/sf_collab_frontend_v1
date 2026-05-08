import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Send
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogPortal,
  DialogOverlay
} from "../../ui/dialog";
import { Textarea } from "../../ui/textarea";
import { ScrollArea } from "../../ui/scroll-area";
import ShinyText from "@/components/ui/ShinyText";
// Comment Dialog Component
export default function CommentDialog({ comments, postAuthor }) {
  const [newComment, setNewComment] = useState("");
  const [commentList, setCommentList] = useState([
    {
      id: 1,
      author: "Alex Chen",
      avatar: "https://i.pravatar.cc/150?img=8",
      text: "This is amazing! Great work!",
      timestamp: "1h ago",
    },
    {
      id: 2,
      author: "Maya Patel",
      avatar: "https://i.pravatar.cc/150?img=9",
      text: "Love the attention to detail here.",
      timestamp: "2h ago",
    },
  ]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setCommentList([
      {
        id: commentList.length + 1,
        author: "You",
        avatar: "https://i.pravatar.cc/150?img=7",
        text: newComment,
        timestamp: "Just now",
      },
      ...commentList,
    ]);
    setNewComment("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
        >
          <MessageCircle size={18} />
          <span className="text-xs font-medium">{comments}</span>
        </Button>
      </DialogTrigger>
     <DialogPortal>
  <DialogOverlay className="fixed inset-0 bg-black/60 z-50" />

  <DialogContent
    className="
      fixed z-50 left-1/2 top-1/2
      -translate-x-1/2 -translate-y-1/2
      w-full max-w-2xl
      max-h-[80vh]
      flex flex-col
      bg-zinc-950 border border-zinc-800 text-white
    "
  >
    <DialogHeader className="shrink-0">
      <DialogTitle>
        <ShinyText className="text-xl">Comments</ShinyText>
      </DialogTitle>
    </DialogHeader>

    {/* SCROLLING COMMENTS */}
    <ScrollArea className="flex-1 pr-4">
      <div className="space-y-4 py-2">
        {commentList.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
          >
            <Avatar className="w-8 h-8 ring-2 ring-blue-500/20">
              <AvatarImage src={comment.avatar} />
              <AvatarFallback>{comment.author[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-zinc-900/50 rounded-xl p-3 border border-zinc-800/50">
                <p className="text-sm font-semibold">{comment.author}</p>
                <p className="text-sm text-zinc-300 mt-1">
                  {comment.text}
                </p>
              </div>
              <p className="text-xs text-zinc-500 mt-1 ml-3">
                {comment.timestamp}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </ScrollArea>

    {/* INPUT FOOTER */}
    <div className="flex gap-2 pt-4 border-t border-zinc-800/50 shrink-0">
      <Textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Write your comment..."
        className="bg-zinc-900/50 border-zinc-800 text-white resize-none"
        rows={2}
      />
      <Button
        onClick={handleAddComment}
        className="bg-blue-600 hover:bg-blue-700 self-end"
        size="icon"
      >
        <Send size={18} />
      </Button>
    </div>
  </DialogContent>
</DialogPortal>

    </Dialog>
  );
};