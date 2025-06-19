import React, { useState, useEffect } from 'react';

interface JSONEditorProps {
  data: any;
  onChange: (newData: any) => void;
  height?: string;
  readOnly?: boolean;
}

export const JSONEditor: React.FC<JSONEditorProps> = ({ 
  data, 
  onChange, 
  height = '300px',
  readOnly = false 
}) => {
  const [jsonString, setJsonString] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setJsonString(JSON.stringify(data, null, 2));
      setError(null);
    } catch (err) {
      setError('数据格式错误');
    }
  }, [data]);

  const handleChange = (value: string) => {
    setJsonString(value);
    
    try {
      const parsed = JSON.parse(value);
      setError(null);
      onChange(parsed);
    } catch (err) {
      setError('JSON 格式错误');
    }
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonString(formatted);
      setError(null);
    } catch (err) {
      setError('JSON 格式错误，无法格式化');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-dark-text-secondary">完整 JSON 数据</label>
        <div className="flex items-center space-x-2">
          <button 
            onClick={formatJSON} 
            className="px-2 py-1 text-xs rounded bg-dark-input text-dark-text-primary hover:bg-dark-hover"
            disabled={readOnly || !!error}
          >
            格式化
          </button>
        </div>
      </div>
      <div 
        className={`border border-dark-border rounded-md overflow-hidden transition-all duration-300 ${error ? 'border-red-500' : ''}`}
      >
        <textarea
          value={jsonString}
          onChange={(e) => handleChange(e.target.value)}
          readOnly={readOnly}
          className={`w-full p-3 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-dark-accent
            bg-dark-input text-dark-text-primary
            ${readOnly ? 'cursor-not-allowed' : ''}
            ${error ? 'text-red-400' : ''}`
          }
          style={{ height }}
          placeholder="在此输入或编辑 JSON 数据..."
          spellCheck={false}
        />
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
};