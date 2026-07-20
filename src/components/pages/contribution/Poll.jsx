import { contributionAPI } from "@/utils/APIs/contributionAPI";
import { waitlistAPI } from "@/utils/APIs/waitlistAPI";
import { Clock, CheckCircle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function PollCard({ poll, setPolls, isAdmin }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const { access_token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const handleVote = async () => {
    try {
      setLoading(true);
      console.log(selectedOption);
      const response = await contributionAPI.voteInPoll(poll.id, selectedOption, access_token);
      if (!response.success) {
        toast.error(response.message || "Failed to submit vote");
        return;
      }
      toast.success("Vote submitted");
      setPolls((prevPolls) =>
        prevPolls.filter((p) => p.id !== poll.id)
      );
      await waitlistAPI.addPoints({ category: 'custom',points: poll.points }, access_token);
    } catch (err) {
      toast.error("Error submitting vote");
    } finally {
      setLoading(false);
    }
  }
  function getDaysRemaining(createdAt, endsInDays) {
  const msPassed = Date.now() - new Date(createdAt).getTime();
  const daysPassed = msPassed / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(endsInDays - daysPassed));
}
  const daysLeft = getDaysRemaining(poll.createdAt, poll.endsInDays);

    if (loading) {
      return (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 flex items-center justify-center">
          <p className="text-gray-400">Submitting vote...</p>
        </div>
      );
    }
  
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {poll.title}
            </h3>
            <p className="text-sm text-gray-300 mt-1">
              {poll.description}
            </p>
          </div>

          <div className="text-right text-sm">
            <p className="text-purple-400 font-medium">
              +{poll.points} pts
            </p>
              <p className="text-gray-400 flex items-center gap-1 mt-1">
                <Clock className="h-4 w-4" />
                Ends in {daysLeft} days
              </p>
            <p className="text-gray-400">
              {poll.usersVoted.length} {poll.usersVoted.length === 1 ? 'vote' : 'votes'}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {poll.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(index)}
              className={`w-full text-left rounded-xl px-4 py-3 border hover:bg-white/1 transition ${selectedOption === index
                  ? "border-purple-400 bg-purple-400/20"
                  : "border-white/10 hover:border-white/20"}`}
            >
              {option} {isAdmin && (
                <span className="text-xs text-gray-400 ml-2">({poll.votes[index] || 0} votes)</span>
              )}
            </button>
          ))}
        </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleVote}
              disabled={selectedOption === null}
              className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Vote
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
      </div>
    );
  }
