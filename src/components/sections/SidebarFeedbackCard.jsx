import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Label } from "../ui/label";
import { Send, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { FcAbout } from "react-icons/fc";
import { RiFeedbackLine } from "react-icons/ri";
import { useSelector } from "react-redux";
import axios from "axios";
import { API_BASE_URL } from "@/utils/config";
import { toast } from "react-toastify";

const MIN_FEEDBACK_LENGTH = 20;

const FeedbackPopup = ({
  open,
  onOpenChange,
  trigger = "sidebar", // "sidebar" | "none"
  hideTooltip = false,
  callback = () => { },
  isHovered = false,
}) => {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const { access_token, user } = useSelector((state) => state.auth);

  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

  const isValidFeedback = feedbackContent.trim().length >= MIN_FEEDBACK_LENGTH;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidFeedback) {
      toast.warn(
        `Feedback must be at least ${MIN_FEEDBACK_LENGTH} characters long.`
      );
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/feedback`,
        {
          userId: user.id,
          content: feedbackContent,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (response.status === 201) {
        setFeedbackContent("");
        setIsOpen(false);
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to submit feedback. Please try again later.");
    }
  };

  return (
    <div className="relative z-[9999999]">
      {/* Sidebar trigger */}
      {trigger === "sidebar" && !hideTooltip && (
        <TooltipProvider>
          <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  setIsOpen(true)
                }}
                className={`w-full flex items-center ${isHovered ? "gap-3 px-3 justify-start" : "justify-center px-0"
                  } py-3 rounded-lg transition-colors min-w-0 text-gray-400 hover:bg-[#2A2A2A] hover:text-white group`}
              >
                <div className="flex items-center justify-center w-6 text-white group-hover:text-white transition-colors">
                  <RiFeedbackLine size={20} />
                </div>
                {isHovered && (
                  <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                    Feedback
                  </span>
                )}
              </button>
            </TooltipTrigger>
            {!isHovered && <TooltipContent>Send feedback</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className={cn(
            "sm:max-w-[450px] z-10000000000",
            "bg-gray-900/95 backdrop-blur-xl",
            "border border-gray-700/50",
            "shadow-2xl shadow-black/40 w-full"
          )}
        >
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-white">
                Feedback
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                We'd love to hear your thoughts
              </DialogDescription>
            </DialogHeader>

            {/* Points Info */}
            <div className="mt-4 flex gap-3 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <FcAbout className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-400">
                You can earn 10–50 points for helpful feedback.
              </p>
            </div>

            {/* Warning */}
            <div className="mt-4 flex gap-3 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-400">
                Please provide genuine feedback only. Spam may lead to suspension.
              </p>
            </div>

            {/* Textarea */}
            <div className="mt-4 space-y-2">
              <Label className="text-white text-sm">
                Your feedback
              </Label>
              <textarea
                name="feedback"
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                placeholder="What can we improve?"
                className="w-full min-h-[120px] bg-gray-800/50 border border-gray-700 text-white text-sm rounded-md p-2"
              />
              <p
                className={cn(
                  "text-xs",
                  feedbackContent.length >= MIN_FEEDBACK_LENGTH
                    ? "text-green-400"
                    : "text-gray-500"
                )}
              >
                {feedbackContent.length}/{MIN_FEEDBACK_LENGTH} characters
              </p>
            </div>

            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:bg-white/80 hover:text-black"
                  onClick={() => callback(false)}
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button
                type="submit"
                size="sm"
                disabled={!isValidFeedback}
                className="bg-white text-black hover:bg-white/90 disabled:opacity-50"
              >
                <Send className="w-3 h-3 mr-2" />
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbackPopup;
