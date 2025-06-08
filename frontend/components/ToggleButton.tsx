
type ToggleButtonProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

export default function ToggleButton({
  options,
  value,
  onChange,
}: ToggleButtonProps) {
  return (
    <div className="flex w-full rounded overflow-hidden border border-zinc-700">
      {options.map((opt) => (
        <button
          key={opt}
          className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
            value === opt
              ? "bg-zinc-200 text-black dark:bg-white dark:text-black"
              : "bg-zinc-800 text-white hover:bg-zinc-700"
          }`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
