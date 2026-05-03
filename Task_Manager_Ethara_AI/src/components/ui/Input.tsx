/**
 * Input Component - Reusable form input with label and error state
 */

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-100
            placeholder:text-gray-500 bg-gray-900
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
            disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed
            transition-colors duration-150
            ${error ? 'border-red-600 bg-red-950' : 'border-gray-700 hover:border-gray-600'}
            ${className}
          `}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1 text-xs text-gray-500">{hint}</p>
        )}
        {error && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
