import { useEffect, useRef, useState } from "react";

type EditableTextProps = {
  value: string;
  onSubmit: (newValue: string) => void;
  className?: string;
  inputClassName?: string;
};

export function EditableText({
  value,
  onSubmit,
  className = "",
  inputClassName = "",
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // When entering edit mode, focus the input and select all text
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Reset edit value when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSubmit = () => {
    if (editValue !== value) {
      onSubmit(editValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSubmit();
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClassName}`}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-accent/50 px-2 py-1 rounded ${className}`}
    >
      {value}
    </span>
  );
}
