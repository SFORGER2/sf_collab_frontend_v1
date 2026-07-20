import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from '../ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"; 
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Send, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { FcAbout } from "react-icons/fc";
import { useSelector } from 'react-redux';
import { waitlistAPI } from '../../utils/APIs/waitlistAPI';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/config';

const CompactFeedbackCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState('');
  const { access_token, user } = useSelector((state) => state.auth);
  
  const MIN_FEEDBACK_LENGTH = 5;
  const MAX_FEEDBACK_LENGTH = 600;
  const isValidFeedback = feedbackContent.trim().length >= MIN_FEEDBACK_LENGTH && feedbackContent.length <= MAX_FEEDBACK_LENGTH;

  const handleFeedbackChange = (e) => {
    const value = e.target.value;
    // Only update if under max length
    if (value.length <= MAX_FEEDBACK_LENGTH) {
      setFeedbackContent(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValidFeedback) {
      if (feedbackContent.trim().length < MIN_FEEDBACK_LENGTH) {
        toast.warn(`Feedback must be at least ${MIN_FEEDBACK_LENGTH} characters long.`);
      } else if (feedbackContent.length > MAX_FEEDBACK_LENGTH) {
        toast.warn(`Feedback must not exceed ${MAX_FEEDBACK_LENGTH} characters.`);
      }
      return;
    }

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const response = await axios.post(`${API_BASE_URL}/feedback`, {
      userId: user.id,
      content: data.feedback,
    }, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    console.log(response);
    if (response.status === 201) {
      toast.success('Thank you for your feedback!');
      setFeedbackContent('');
      e.target.reset();
      setIsOpen(false);
    } else {
      toast.error('Failed to submit feedback. Please try again later.');
      return;
    }
  };

  const handleDialogOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      setTooltipOpen(false);
    }
  };

  return (
    <div style={{zIndex: 999999999999}} className="fixed bottom-7 left-32 z-50 option-a option">
      <TooltipProvider>
        <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
          <TooltipTrigger asChild>
            <div 
              className="cursor-pointer"
              onMouseEnter={() => !isOpen && setTooltipOpen(true)}
              onMouseLeave={() => setTooltipOpen(false)}
            >
              <div 
                style={{background: 'white'}} 
                className="w-13 h-13 group transition-all duration-700 hover:shadow-[0px_0px_10px_#FFFFFF] rounded-full flex items-center justify-center hover:scale-110"
              >
                <FcAbout size={25}/>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent 
            arrowColor="bg-gray-800 fill-gray-800" 
            className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white p-4"
            onMouseEnter={() => setTooltipOpen(true)}
            onMouseLeave={() => setTooltipOpen(false)}
          >
            <h4 className="font-medium relative text-white text-center mb-2 flex items-center justify-center">
              <img loading="lazy" 
                src="/feedback.jpg" 
                className='p-2 h-12 w-12 absolute left-0 mt-1 group-hover:scale-105 transition-all duration-1000' 
                alt="" 
              /> 
              <span>Feedback</span>
            </h4>
            <p className="text-xs text-gray-400 text-center mb-4">
              Help us improve and earn more points.
            </p>
            
            <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button 
                  size="sm"
                  className={cn(
                    "w-full mb-2 cursor-pointer",
                    "transition-all duration-700",
                    "bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600",
                    "border-none",
                    "text-white text-sm"
                  )}
                  onClick={() => {
                    setIsOpen(true);
                    setTooltipOpen(false);
                  }}
                >
                  Share Thoughts
                </Button>
              </DialogTrigger>
            </Dialog>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className={cn(
            "sm:max-w-[450px]",
            "bg-gray-900/95 backdrop-blur-xl",
            "border border-gray-700/50",
            "shadow-2xl shadow-black/40"
          )}
          onMouseEnter={() => setTooltipOpen(false)}
        >
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-white">Feedback</DialogTitle>
              <DialogDescription className="text-gray-400">
                We'd love to hear your thoughts
              </DialogDescription>
            </DialogHeader>

            {/* Warning Banner */}
            <div className="mt-4 flex items-start gap-3 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-400">
                Please provide genuine feedback only. Spam or nonsense suggestions may result in account suspension or ban.
              </p>
            </div>
 
            <div className="mt-4 space-y-3">
              <Label className="text-white text-sm">Your feedback</Label>
              <Textarea 
                name="feedback"
                placeholder="What can we improve?"
                // Added 'break-all' and fixed the height management
                className={cn(
                  "min-h-[120px] max-h-[180px] bg-gray-800/50 border-gray-700 text-white text-sm",
                  "resize-none overflow-y-auto break-all whitespace-pre-wrap"
                )}
                value={feedbackContent}
                onChange={handleFeedbackChange}
                maxLength={MAX_FEEDBACK_LENGTH} // This prevents typing more than 600
                required
              />
              <div className="flex justify-between items-center">
                <p className={cn(
                  "text-xs",
                  feedbackContent.length >= MIN_FEEDBACK_LENGTH && feedbackContent.length <= MAX_FEEDBACK_LENGTH 
                    ? "text-green-400" 
                    : "text-gray-500"
                )}>
                  {feedbackContent.length}/{MAX_FEEDBACK_LENGTH} characters
                </p>
                {feedbackContent.length < MIN_FEEDBACK_LENGTH && feedbackContent.length > 0 && (
                  <span className="text-xs text-red-400">Min. {MIN_FEEDBACK_LENGTH} characters required</span>
                )}
              </div>
            </div>

            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-400 hover:bg-white/70 cursor-pointer hover:text-black"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                type="submit"
                size="sm"
                disabled={!isValidFeedback}
                className="bg-white text-black hover:bg-white/90 cursor-pointer hover:scale-102 hover:shadow-[0px_0px_10px_white] disabled:opacity-50 disabled:cursor-not-allowed"
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

export default CompactFeedbackCard;