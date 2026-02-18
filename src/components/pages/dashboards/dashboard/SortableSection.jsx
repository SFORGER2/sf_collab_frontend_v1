import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react";

const SortableSection = ({ id, children, index, total, onMove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative mb-4 rounded-2xl border border-white/10 bg-white/5"
    >
      {/* Controls */}
      <div className="absolute top-3 left-3 flex gap-1 z-10">
        {/* Move up */}
        <button
          disabled={index === 0}
          onClick={() => onMove(index, index - 1)}
          className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronUp size={16} />
        </button>

        {/* Move down */}
        <button
          disabled={index === total - 1}
          onClick={() => onMove(index, index + 1)}
          className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronDown size={16} />
        </button>

        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab p-1 rounded hover:bg-white/10"
        >
          <GripVertical size={16} />
        </div>
      </div>

      {children}
    </div>
  );
};

export default SortableSection;
