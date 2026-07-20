import { useState } from "react";
import { ArrowRight, Vote } from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { contributionAPI } from "@/utils/APIs/contributionAPI";

export default function CreatePollSection() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(1);
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [endsInDays, setEndsInDays] = useState(7);
  const { access_token } = useSelector((state) => state.auth);
  const addOption = () => {
    if (options.length >= 6) return;
    setOptions([...options, ""]);
  };

  const updateOption = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const removeOption = (index) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };
  async function handleCreatePoll() {
    try {
      const body = {
        title,
        description,
        options,
        points,
        ends_in_days: endsInDays,
      }
      const response = await contributionAPI.createPoll(body, access_token);
      if (!response.success) {
        toast.error(response.data.message || "Failed to create poll");
        return;
      }

      toast.success("Poll created");
      setTitle("");
      setDescription("");
      setPoints(1);
      setOptions(["", ""]);
      setEndsInDays(7);
    } catch (err) {
    toast.error("Error creating poll");
    }
  };

  const handleSubmit = async () => {
    if (!title || options.some((o) => !o)) {
      toast.error("Please complete all fields");
      return;
    }

    setLoading(true);
    await handleCreatePoll();
    setLoading(false);

  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Vote className="h-5 w-5 text-purple-400" />
        Create New Poll
      </h2>

      <div className="grid gap-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Poll title"
          className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description (optional)"
          rows={3}
          className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 resize-none"
        />

        {/* OPTIONS */}
        <div className="space-y-3">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-purple-500"
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(i)}
                  className="text-xs text-red-400 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          {options.length < 6 && (
            <button
              onClick={addOption}
              className="text-xs text-purple-400 hover:underline"
            >
              + Add option
            </button>
          )}
        </div>

        {/* META */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">Points</span>
            <input
              type="number"
              min={1}
              max={5}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-16 bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-sm outline-none focus:border-purple-500"
            />
          </div>
        </div>
        {/*ENDS IN*/}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">Ends In (days)</span>
          <input
            type="number"
            min={1}
            value={endsInDays}
            onChange={(e) => setEndsInDays(Number(e.target.value))}
            className="w-16 bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-sm outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            disabled={loading}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-500/20 border border-purple-500/30 px-5 py-2 text-sm font-semibold text-purple-300 hover:bg-purple-500/30 transition disabled:opacity-50"
          >
            Create Poll
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
