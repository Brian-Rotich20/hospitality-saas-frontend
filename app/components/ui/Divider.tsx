interface DividerProps {
  label?: string;
}

export default function Divider({ label }: DividerProps) {
  return (
    <div className="flex items-center my-4">
      <div className="flex-1 h-px bg-gray-200" />

      {label && (
        <span className="px-2 text-[10px] text-gray-400 uppercase">
          {label}
        </span>
      )}

      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}