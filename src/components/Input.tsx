import React from "react";

export default function Input({
  type,
  placeholder,
  name,
  register,
  errors,
  rules,
  label,
  className,
  labelClassName,
  onClick,
  disabled = false,
  ...rest
}: {
  type: string;
  placeholder: string;
  name: string;
  register: any;
  errors: any;
  rules?: any;
  className?: string;
  labelClassName?: string;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <div>
      {label && (
        <label className={`${labelClassName}`}>
          {label} {rules?.required && <span className="text-red-600">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={`${errors[name] && "input-invalid"} ${className} `}
        disabled={disabled}
        onClick={onClick}
        {...register(name, rules)}
        {...rest}
      />
      {errors[name] && (
        <small className="mt-1.5 text-red-600 block">
          {errors[name].message || "This field is required"}
        </small>
      )}
    </div>
  );
}
