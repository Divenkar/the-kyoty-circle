import React from 'react';

/* ───── Input ───── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1.5">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`
          w-full px-3.5 py-2.5 text-sm text-neutral-900
          bg-white border border-neutral-200 rounded-lg
          placeholder:text-neutral-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
          transition-colors duration-150
          ${error ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : ''}
          ${className}
        `.trim()}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
        </div>
    );
}

/* ───── Select ───── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options?: { value: string; label: string }[];
    placeholder?: string;
    children?: React.ReactNode;
}

export function Select({ label, error, options, placeholder, className = '', id, children, ...props }: SelectProps) {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={selectId} className="block text-sm font-medium text-neutral-700 mb-1.5">
                    {label}
                </label>
            )}
            <select
                id={selectId}
                className={`
          w-full px-3.5 py-2.5 text-sm text-neutral-900
          bg-white border border-neutral-200 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
          transition-colors duration-150
          ${error ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : ''}
          ${className}
        `.trim()}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {children
                    ? children
                    : options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
            </select>
            {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
        </div>
    );
}

/* ───── Textarea ───── */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={textareaId} className="block text-sm font-medium text-neutral-700 mb-1.5">
                    {label}
                </label>
            )}
            <textarea
                id={textareaId}
                className={`
          w-full px-3.5 py-2.5 text-sm text-neutral-900
          bg-white border border-neutral-200 rounded-lg
          placeholder:text-neutral-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
          transition-colors duration-150 resize-y min-h-[100px]
          ${error ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : ''}
          ${className}
        `.trim()}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
        </div>
    );
}
