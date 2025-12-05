
import React, { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ChangeEventHandler, ReactNode } from 'react';

// Refactored FormInputProps to use a discriminated union more effectively and explicitly handle prop types based on the 'as' prop.
// This ensures that onChange and other HTML attributes are compatible with the rendered element, resolving type incompatibility issues.
interface BaseFormInputProps {
  label: string;
  name: string;
  className?: string;
  error?: string; // For displaying validation errors
  // A common onChange type that can handle all three, or it can be omitted and re-added per specific type if needed.
  // For simplicity and typical usage, a union type for event target is effective here.
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  value?: string | number | readonly string[]; // Added value to base to cover all input types
}

type FormInputProps = BaseFormInputProps & (
  | ({ as?: 'input' } & Omit<InputHTMLAttributes<HTMLInputElement>, keyof BaseFormInputProps | 'value' | 'onChange'>)
  | ({ as: 'textarea' } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, keyof BaseFormInputProps | 'value' | 'onChange'>)
  | ({ as: 'select'; children?: React.ReactNode } & Omit<SelectHTMLAttributes<HTMLSelectElement>, keyof BaseFormInputProps | 'value' | 'onChange'>)
);

const FormInput: React.FC<FormInputProps> = ({ as = 'input', label, name, className, error, children, onChange, value, ...props }) => {
  const commonClasses = `mt-1 block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`;

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      {as === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          className={`${commonClasses} min-h-[80px]`}
          onChange={onChange as ChangeEventHandler<HTMLTextAreaElement>}
          value={value as string} // Textarea value is always string
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        >
          {children}
        </textarea>
      ) : as === 'select' ? (
        <select
          id={name}
          name={name}
          className={commonClasses}
          onChange={onChange as ChangeEventHandler<HTMLSelectElement>}
          value={value}
          {...(props as SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {children}
        </select>
      ) : ( // default to 'input'
        <input
          id={name}
          name={name}
          className={commonClasses}
          onChange={onChange as ChangeEventHandler<HTMLInputElement>}
          value={value}
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;
