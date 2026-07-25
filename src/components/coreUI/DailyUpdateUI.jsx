import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export const DailyUpdateUI = () => {
  // State to hold the form inputs
  const [updateForm, setUpdateForm] = useState({
    done: "",
    next: "",
    blockers: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here is where you would normally send the data to your backend!
    console.log("Submitting Update:", updateForm);

    // Show a success state temporarily
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setUpdateForm({ done: "", next: "", blockers: "" });
    }, 3000);
  };

  return (
    <div className="h-full bg-[#0d0f17] border border-slate-800 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.2)]">
      <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
        <Send className="w-5 h-5 text-cyan-400" /> Submit Daily Update
      </h2>

      {isSubmitted ? (
        <div className="flex flex-col items-center justify-center h-48 space-y-3 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-emerald-400 font-medium">
            Update submitted successfully!
          </p>
          <p className="text-xs text-slate-500">Your team has been notified.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              What did you get done today?
            </label>
            <textarea
              required
              value={updateForm.done}
              onChange={(e) =>
                setUpdateForm({ ...updateForm, done: e.target.value })
              }
              className="w-full bg-[#0a0b10] border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none min-h-[80px]"
              placeholder="List your completed tasks..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              What are your next steps?
            </label>
            <textarea
              required
              value={updateForm.next}
              onChange={(e) =>
                setUpdateForm({ ...updateForm, next: e.target.value })
              }
              className="w-full bg-[#0a0b10] border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none min-h-[80px]"
              placeholder="What will you work on tomorrow?"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Any blockers?
            </label>
            <textarea
              value={updateForm.blockers}
              onChange={(e) =>
                setUpdateForm({ ...updateForm, blockers: e.target.value })
              }
              className="w-full bg-[#0a0b10] border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none min-h-[60px]"
              placeholder="Are you stuck on anything? (Optional)"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-2 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-400 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Submit End of Day Update
          </button>
        </form>
      )}
    </div>
  );
};
