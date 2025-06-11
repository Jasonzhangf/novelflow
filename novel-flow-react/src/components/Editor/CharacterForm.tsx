import React, { useState, useCallback, useRef, useEffect } from 'react';
// Import ChangeEvent as a type-only import
import type { ChangeEvent } from 'react';
import type { Node } from 'reactflow'; // Ensure Node type is imported if needed, otherwise remove

// Define the props for the CharacterForm
interface CharacterFormProps {
  nodeId: string;
  initialData: Record<string, any>; // The initial characterInfo data from the node
  updateNodeData: (nodeId: string, newData: Record<string, any>) => void; // Function to update the node in the main state
  onClose: () => void; // Function to close the form
}

const CharacterForm: React.FC<CharacterFormProps> = ({
  nodeId,
  initialData,
  updateNodeData,
  onClose,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  // State to track expanded groups - Initialize all as collapsed
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

  // Effect to reset form data when the selected node changes (via key prop)
  useEffect(() => {
    setFormData(initialData);
    setExpandedGroups({}); // Reset expanded state as well
  }, [initialData]); // Depend on initialData which changes when nodeId changes due to the key prop

  // --- Input Change Handlers ---
  // Handles changes for top-level simple values OR first-level nested objects with a 'Value' key
  const handleValueChange = (
    groupKey: string,
    itemKey: string | null, // itemKey is null for direct top-level changes
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = event.target.value;
    let updatedFormData = { ...formData };

    if (itemKey === null) {
      // Direct top-level value change (e.g., language)
      updatedFormData[groupKey] = newValue;
    } else {
      // Nested value change (assuming itemKey exists under groupKey)
      // This handles structures like 基本信息 -> 姓名 -> { Value: ... }
      updatedFormData = {
        ...formData,
        [groupKey]: {
          ...formData[groupKey],
          [itemKey]: {
            // Preserve other potential properties like "Caption", "Description"
            ...(typeof formData[groupKey]?.[itemKey] === 'object' ? formData[groupKey][itemKey] : {}),
            Value: newValue // Only update the Value property
          },
        },
      };
    }

    setFormData(updatedFormData);
    updateNodeData(nodeId, updatedFormData); // Update node data immediately
  };


  // --- Import/Export Handlers ---
  const handleExport = useCallback(() => {
    const jsonString = JSON.stringify(formData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const characterName = formData?.['基本信息']?.['姓名']?.Value || nodeId;
    a.download = `${characterName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [formData, nodeId]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          if (importedData && typeof importedData === 'object') {
            setFormData(importedData);
            updateNodeData(nodeId, importedData);
          } else {
            console.error('Invalid JSON file format.');
            alert('Error: Invalid JSON file format.');
          }
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          alert(`Error parsing JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };
      reader.onerror = (e) => {
          console.error('Error reading file:', e);
          alert('Error reading file.');
      };
      reader.readAsText(file);
      event.target.value = '';
    }
  };

  // Toggle group expansion
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  // --- Recursive Rendering Function ---
  const renderFormGroup = (data: any, path: string[] = []): React.ReactNode => {
    if (typeof data !== 'object' || data === null) {
      return null; // Should not happen at top level, but good for safety
    }

    return Object.keys(data).map((key) => {
      const currentPath = [...path, key];
      const value = data[key];
      const isValueObject = typeof value === 'object' && value !== null;

      // Case 1: Leaf node with { Value: ..., Caption: ... } structure
      if (isValueObject && 'Value' in value && 'Caption' in value) {
        const caption = value.Caption || key;
        const actualValue = value.Value;
        const inputType = typeof actualValue === 'number' ? 'number' : 'text';
        // Determine if this specific field should be readOnly (e.g., deeply nested personality traits for now)
        const isReadOnly = path.length > 1; // Example: make fields under personality->CoreTemperament readOnly

        return (
          <div key={currentPath.join('.')} className="flex items-center space-x-2 ml-2">
            <div className="w-2/5 flex-shrink-0">
              <label className="block text-xs font-medium text-gray-400 truncate" title={caption}>
                {caption}
              </label>
            </div>
            <div className="w-3/5 flex-grow">
              <input
                type={inputType}
                value={actualValue ?? ''}
                onChange={(e) => {
                    if (!isReadOnly) {
                        // Find the top-level group key and the immediate item key for handleValueChange
                        const groupKey = currentPath[0];
                        const itemKey = currentPath.length > 1 ? currentPath[1] : null; // Adjust if structure varies
                        if (itemKey) { // Only call if we have a valid itemKey for the simple handler
                           handleValueChange(groupKey, itemKey, e);
                        } else {
                           console.error("Cannot determine itemKey for update handler", currentPath);
                        }
                    } else {
                        console.warn("Editing disabled for this nested field:", currentPath.join('.'));
                    }
                }}
                readOnly={isReadOnly}
                className={`p-1 border rounded w-full text-sm ${isReadOnly
                    ? 'border-gray-600 bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'border-gray-500 bg-gray-800 text-gray-200 focus:border-blue-400 focus:ring-blue-400 focus:ring-opacity-50 focus:outline-none'
                }`}
                placeholder="输入值"
              />
            </div>
          </div>
        );
      }
      // Case 2: Nested Object (render sub-header and recurse)
      else if (isValueObject && !Array.isArray(value)) {
        return (
          <div key={currentPath.join('.')} className="ml-2 mt-2 space-y-1 border-l border-gray-600 pl-2 py-1">
            <label className="block text-xs font-semibold text-gray-300">{key}</label>
            {renderFormGroup(value, currentPath)} {/* Recurse */}
          </div>
        );
      }
      // Case 3: Array - Placeholder
      else if (Array.isArray(value)) {
         return <div key={currentPath.join('.')} className="text-xs text-gray-500 italic ml-2">(数组类型渲染待实现: {key})</div>;
      }
      // Case 4: Simple key-value pair at this level (e.g., 'language: "chinese"')
      else {
        return (
          <div key={currentPath.join('.')} className="flex items-center space-x-2">
            <div className="w-2/5 flex-shrink-0">
              <label className="block text-xs font-medium text-gray-400 truncate">{key}</label>
            </div>
            <div className="w-3/5 flex-grow">
              <input
                type="text"
                value={value ?? ''}
                onChange={(e) => handleValueChange(currentPath[0], null, e)} // Top-level change
                className="p-1 border border-gray-500 rounded w-full text-sm bg-gray-800 text-gray-200 focus:border-blue-400 focus:ring-blue-400 focus:ring-opacity-50 focus:outline-none"
                placeholder="输入值"
              />
            </div>
          </div>
        );
      }
    });
  };


  return (
    // Apply dark theme styles: bg-gray-800 text-gray-200 and add font-sans
    <div className="p-4 space-y-4 h-full flex flex-col bg-gray-800 text-gray-200 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-gray-600">
        <h3 className="text-lg font-semibold text-gray-100">编辑角色: {nodeId}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-100" aria-label="Close">&times;</button>
      </div>

      {/* Import/Export Buttons */}
      <div className="flex space-x-2">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".json" />
        <button onClick={handleImportClick} className="px-3 py-1 bg-gray-600 text-gray-100 rounded hover:bg-gray-500 text-sm">导入 JSON</button>
        <button onClick={handleExport} className="px-3 py-1 bg-gray-700 text-gray-100 rounded hover:bg-gray-600 text-sm">导出 JSON</button>
      </div>

      {/* Dynamic Form Area */}
      <div className="flex-grow overflow-y-auto space-y-3 pr-2">
        {Object.keys(formData).map((groupKey) => (
          <details key={groupKey} open={expandedGroups[groupKey] || false} className="bg-gray-700 rounded border border-gray-600">
            <summary
              onClick={(e) => { e.preventDefault(); toggleGroup(groupKey); }}
              className="px-3 py-2 font-medium cursor-pointer list-none flex justify-between items-center text-gray-100 hover:bg-gray-600"
            >
              {groupKey}
              <span className="text-xs">{expandedGroups[groupKey] ? '▲' : '▼'}</span>
            </summary>
            <div className="p-3 border-t border-gray-600 space-y-2">
              {renderFormGroup(formData[groupKey], [groupKey])} {/* Start recursion */}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

export default CharacterForm;
