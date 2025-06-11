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
  // Handles changes using the full path of the item being changed
  const handleValueChange = (
    path: string[], // Full path to the item (e.g., ['基本信息', '姓名'] or ['personality', 'CoreTemperament', '乐观度'])
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = event.target.value;
    setFormData(prevData => {
        // Deep copy to avoid direct state mutation
        const newData = JSON.parse(JSON.stringify(prevData));
        let currentLevel = newData;

        // Traverse down the path to the second-to-last level
        for (let i = 0; i < path.length - 1; i++) {
            const key = path[i];
             // Create nested objects if they don't exist
            if (typeof currentLevel[key] !== 'object' || currentLevel[key] === null) {
                currentLevel[key] = {};
            }
            currentLevel = currentLevel[key];
        }

        const finalKey = path[path.length - 1];

        // Check if the target is a structure like { Value: ..., Caption: ... }
        if (typeof currentLevel[finalKey] === 'object' && currentLevel[finalKey] !== null && 'Value' in currentLevel[finalKey]) {
            // Update the 'Value' property within that structure
            currentLevel[finalKey].Value = newValue;
        } else {
            // Otherwise, update the direct value at the final key
            currentLevel[finalKey] = newValue;
        }

        // Update the node data in the main flow state
        updateNodeData(nodeId, newData);
        // Return the updated state for React
        return newData;
    });
  };


  // --- Import/Export Handlers ---
  const handleExport = useCallback(() => {
    const jsonString = JSON.stringify(formData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Use a reliable way to get a name, fallback to nodeId
    const characterName = formData?.['基本信息']?.['姓名']?.Value || formData?.name || nodeId;
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
            // Reset expanded state on import might be good
            setExpandedGroups({});
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
      event.target.value = ''; // Clear input value after selection
    }
  };

  // Toggle group expansion - Syncs React state with <details> open state
  const handleToggle = (groupKey: string, isOpen: boolean) => {
    setExpandedGroups(prev => ({ ...prev, [groupKey]: isOpen }));
  };

  // --- Recursive Rendering Function ---
  const renderFormGroup = (data: any, path: string[] = []): React.ReactNode => {
     // Base case: If data is not an object or is null, render nothing further
    if (typeof data !== 'object' || data === null) {
      return null;
    }

    // Render entries for the current object level
    return Object.keys(data).map((key) => {
      const currentPath = [...path, key];
      const value = data[key];
      const isValueObject = typeof value === 'object' && value !== null;

      // Case 1: Leaf node structured as { Value: ..., Caption: ... }
      if (isValueObject && 'Value' in value && 'Caption' in value) {
        const caption = value.Caption || key;
        const actualValue = value.Value;
        const inputType = typeof actualValue === 'number' ? 'number' : 'text';
        // ReadOnly logic (e.g., disable editing for nested personality traits)
        const isReadOnly = path.length > 1; // Example: only allow editing top-level Value/Caption pairs

        return (
          <div key={currentPath.join('.')} className="flex items-center space-x-2 ml-2">
            <div className="w-2/5 flex-shrink-0">
              <label className="block text-xs truncate" title={caption} style={{ color: '#a1a1aa' }}>
                {caption}
              </label>
            </div>
            <div className="w-3/5 flex-grow">
              <input
                type={inputType}
                value={actualValue ?? ''}
                onChange={(e) => { if (!isReadOnly) handleValueChange(currentPath, e); }}
                readOnly={isReadOnly}
                style={!isReadOnly ? { color: 'white' } : {}}
                className={`p-1 border rounded w-full text-sm ${isReadOnly
                    ? 'border-gray-600 bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'border-gray-500 bg-gray-800 focus:border-blue-400 focus:ring-blue-400 focus:ring-opacity-50 focus:outline-none'
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
            {/* Nested object label */}
            <label className="block text-xs font-semibold" style={{ color: 'white' }}>
              {key}
            </label>
            {/* Recurse for the nested object */}
            {renderFormGroup(value, currentPath)}
          </div>
        );
      }
      // Case 3: Array - Placeholder
      else if (Array.isArray(value)) {
         return <div key={currentPath.join('.')} className="text-xs text-gray-500 italic ml-2">(数组类型渲染待实现: {key})</div>;
      }
      // Case 4: Simple key-value pair (string, number, boolean)
      else {
        const inputType = typeof value === 'number' ? 'number' : 'text';
        // Simple values are directly editable
        const isReadOnly = false;
        return (
          <div key={currentPath.join('.')} className="flex items-center space-x-2">
            <div className="w-2/5 flex-shrink-0">
              <label className="block text-xs truncate" style={{ color: '#a1a1aa' }} title={key}>
                {key}
              </label>
            </div>
            <div className="w-3/5 flex-grow">
              <input
                type={inputType}
                value={value ?? ''}
                onChange={(e) => handleValueChange(currentPath, e)}
                readOnly={isReadOnly} // Typically false for simple values
                style={{ color: 'white' }} // Editable simple values are white
                className="p-1 border border-gray-500 rounded w-full text-sm bg-gray-800 focus:border-blue-400 focus:ring-blue-400 focus:ring-opacity-50 focus:outline-none"
                placeholder="输入值"
              />
            </div>
          </div>
        );
      }
    });
  };


  return (
    <div className="p-4 space-y-4 h-full flex flex-col bg-gray-800 text-gray-100 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-gray-600">
        <h3 className="text-lg font-semibold" style={{ color: 'white' }}>
          编辑角色: {nodeId}
        </h3>
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
        {Object.keys(formData).map((groupKey) => {
          // Determine if the current group should be open based on state
          const isOpen = expandedGroups[groupKey] || false;
          const groupData = formData[groupKey];

          return (
            <details
               key={groupKey}
               open={isOpen} // Control open state via React state
               onToggle={(e) => handleToggle(groupKey, (e.target as HTMLDetailsElement).open)} // Sync state on toggle
               className="bg-gray-700 rounded border border-gray-600"
             >
              {/* Restore summary, ensure it displays groupKey */}
              <summary
                className="flex justify-between items-center px-3 py-2 cursor-pointer list-none" // list-none hides default marker
              >
                {/* Apply Tailwind !important class to the span containing groupKey */}
                <span className="!text-white">{groupKey}</span>
                {/* Apply Tailwind !important class to the span containing the arrow */}
                <span className="text-xs !text-white"> {/* Ensure text-xs is still applied */}
                  {isOpen ? '▲' : '▼'} {/* Use isOpen state for arrow */}
                </span>
              </summary>
              {/* Render content only if data exists and is an object/array */}
              {groupData && typeof groupData === 'object' && (
                <div className="p-3 border-t border-gray-600 space-y-2">
                  {/* Pass the corresponding value and the path starting with groupKey */}
                  {renderFormGroup(groupData, [groupKey])}
                </div>
              )}
            </details>
          );
        })}
      </div>
    </div>
  );
};

export default CharacterForm;
