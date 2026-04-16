import React from "react";

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export default function Field({ label, error, children }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1 text-gray-700">
        {label}
      </label>

      <div className="relative">
        {children}
      </div>

      {error && (
        <p className="text-red-500 text-[10px] mt-1">
          {error}
        </p>
      )}
    </div>
  );
}