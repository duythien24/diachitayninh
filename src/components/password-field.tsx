"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

type PasswordFieldProps = {
  label: string;
  name: string;
  autoComplete?: string;
  placeholder?: string;
  minLength?: number;
  required?: boolean;
  className?: string;
};

export function PasswordField({
  label,
  name,
  autoComplete,
  placeholder,
  minLength,
  required = true,
  className
}: PasswordFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <label className={className || "grid gap-2 text-sm font-semibold text-ink"} htmlFor={id}>
      {label}
      <span className="relative block">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          minLength={minLength}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full rounded border border-ink/12 px-3 py-3 pr-12 font-normal outline-none transition focus:border-palm"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded text-ink/55 transition hover:bg-paper hover:text-palm focus:outline-none focus:ring-2 focus:ring-palm/25"
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          title={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </span>
    </label>
  );
}
