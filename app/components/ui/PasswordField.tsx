import React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordFieldProps {
  label: string;
  name: string;
  register: any;
  error?: string;
  hint?: string;
  show: boolean;
  toggle: () => void;
  disabled?: boolean;
  inp: (error: boolean) => string;
}

export default function PasswordField({
  label,
  name,
  register,
  error,
  hint,
  show,
  toggle,
  disabled,
  inp,
}: PasswordFieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1 text-gray-700">
        {label}
      </label>

      <div className="relative">
        <Lock className="absolute left-2.5 top-2.5 text-gray-300" size={14} />

        <input
          type={show ? "text" : "password"}
          {...register(name)}
          disabled={disabled}
          className={inp(!!error)}
        />

        <button
          type="button"
          onClick={toggle}
          className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      {hint && (
        <p className="text-[10px] text-gray-400 mt-1">
          {hint}
        </p>
      )}

      {error && (
        <p className="text-red-500 text-[10px] mt-1">
          {error}
        </p>
      )}
    </div>
  );
}