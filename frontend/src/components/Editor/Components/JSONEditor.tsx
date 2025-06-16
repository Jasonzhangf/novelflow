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
  const [isExpanded, setIsExpanded] = useState(false);

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

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(jsonString);
      const minified = JSON.stringify(parsed);
      setJsonString(minified);
      setError(null);
    } catch (err) {
      setError('JSON 格式错误，无法压缩');
    }
  };

  return (
    <div className="border border-gray-300 rounded-md">
      <div className="flex justify-between items-center bg-gray-50 px-3 py-2 border-b border-gray-300">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">JSON 编辑器</span>
          {error && (
            <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
              {error}
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={formatJSON}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={readOnly || !!error}
          >
            格式化
          </button>
          <button
            onClick={minifyJSON}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
            disabled={readOnly || !!error}
          >
            压缩
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            {isExpanded ? '收起' : '展开'}
          </button>
        </div>
      </div>
      
      <textarea
        value={jsonString}
        onChange={(e) => handleChange(e.target.value)}
        readOnly={readOnly}
        className={`w-full p-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
        } ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
        style={{ 
          height: isExpanded ? '500px' : height,
          transition: 'height 0.2s ease-in-out'
        }}
        placeholder="在此输入或编辑 JSON 数据..."
        spellCheck={false}
      />
    </div>
  );
};