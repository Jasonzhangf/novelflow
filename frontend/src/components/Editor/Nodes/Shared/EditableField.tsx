import React from 'react';

export const EditableField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'textarea';
}> = ({ label, value, onChange, type = 'text' }) => (
  <div className="grid grid-cols-[65px,1fr] items-center gap-x-2">
    <label className="text-xs text-gray-500 font-medium justify-self-start">
      {label}
    </label>
    {type === 'textarea' ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="nodrag text-xs text-gray-800 w-full bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none resize-none text-right"
        placeholder="未设置"
        rows={2}
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="nodrag text-xs text-gray-800 w-full bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-right"
        placeholder="未设置"
      />
    )}
  </div>
); 