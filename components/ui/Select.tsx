import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "children" | "value"
  > {
  label: string;
  options: SelectOption[];
  error?: string;
  value: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = "",
  id,
  value,
  onValueChange,
  onChange,
  placeholder = "Select an option",
  ...props
}) => {
  const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, "-")}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="w-full">
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={handleChange}
        className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white ${error ? "border-red-500" : ""
          } ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

