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

// Define the expected top-level keys for the static structure (English keys for logic)
const expectedKeys = ['name', 'age', 'background', 'personality', 'relationships', 'language'];

// Map English keys to Chinese display names
const keyToDisplayName: Record<string, string> = {
    name: '姓名',
    age: '年龄',
    background: '背景',
    personality: '性格',
    relationships: '人际关系',
    language: '语言风格'
};


const CharacterForm: React.FC<CharacterFormProps> = ({
  nodeId,
  initialData,
  updateNodeData,
  onClose,
}) => {
  // Initialize formData based on initialData BUT DO NOT SYNC IT CONTINUOUSLY by default
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  // State to track expanded groups - Initialize all as collapsed
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

  // Store the previous nodeId to detect when the actual node selection changes
  const prevNodeIdRef = useRef<string>(nodeId);

  // *** FIX: Reverted useEffect dependency array ***
  useEffect(() => {
    // Check if the nodeId prop has actually changed from the previous render
    if (nodeId !== prevNodeIdRef.current) {
      console.log(`[CharacterForm] Node ID changed from ${prevNodeIdRef.current} to ${nodeId}. Resetting formData and expandedGroups.`);
      setFormData(initialData); // Reset form data to the new node's data
      setExpandedGroups({}); // Reset expanded state for the new node
      prevNodeIdRef.current = nodeId; // Update the ref to the current nodeId
    } else {
      // If only initialData reference changed but nodeId is the same (e.g., after import update)
      // Compare initialData with current formData to see if an update is needed
      // Use stringify for a deep comparison, though this isn't the most performant for large objects
      // Avoid comparing formData with itself which was the previous logic with formData in dependency array
      const currentFormDataString = JSON.stringify(formData);
      const initialDataString = JSON.stringify(initialData);
      if (initialDataString !== currentFormDataString) {
          console.log(`[CharacterForm] Node ID ${nodeId} is the same, but initialData differs. Updating formData ONLY.`);
          setFormData(initialData); // Update formData to reflect parent changes (like import)
          // DO NOT reset expandedGroups here, preserving the open/closed state
      }
    }
  // Depend ONLY on nodeId and initialData. The logic inside handles the different cases.
  }, [nodeId, initialData]); // *** REVERTED DEPENDENCIES ***


  // --- Input Change Handlers ---
  const handleValueChange = (
    path: string[],
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = event.target.value;
    setFormData(prevData => {
        // Deep clone previous data to avoid mutation issues
        const newData = JSON.parse(JSON.stringify(prevData));
        let currentLevel = newData;
        // Traverse the path to find the target object
        for (let i = 0; i < path.length - 1; i++) {
            const key = path[i];
            // Ensure path exists, create if not
            if (typeof currentLevel[key] !== 'object' || currentLevel[key] === null) {
                currentLevel[key] = {};
            }
            currentLevel = currentLevel[key];
        }
        const finalKey = path[path.length - 1];
        // Check if the target property is an object with 'Value' (structured property)
        if (typeof currentLevel[finalKey] === 'object' && currentLevel[finalKey] !== null && 'Value' in currentLevel[finalKey]) {
            currentLevel[finalKey].Value = newValue;
        } else {
            // Otherwise, update the value directly (simple property)
            currentLevel[finalKey] = newValue;
        }
        // Call the update function passed from the parent to update the global node state
        updateNodeData(nodeId, newData);
        // Return the new state for this component
        return newData;
    });
  };


  // --- Import/Export Handlers ---
  const handleExport = useCallback(() => {
    const jsonString = JSON.stringify(formData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' }); // Specify UTF-8
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Try to get a meaningful name, fallback to nodeId
    const characterName = formData?.name?.Value || formData?.name || nodeId;
    a.download = `${characterName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [formData, nodeId]);

  const handleImportClick = () => {
    console.log('[CharacterForm] handleImportClick function entered.');
    if (fileInputRef.current) {
      console.log('[CharacterForm] fileInputRef.current exists. Attempting click...');
      fileInputRef.current.click();
      console.log('[CharacterForm] fileInputRef.current.click() called.');
    } else {
      console.error('[CharacterForm] fileInputRef.current is null or undefined.');
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log('[CharacterForm] handleFileChange triggered.');
    const file = event.target.files?.[0];
    if (file) {
      console.log('[CharacterForm] File selected:', file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          if (importedData && typeof importedData === 'object') {
            console.log('[CharacterForm] JSON parsed successfully. Calling updateNodeData.');
            // Directly call updateNodeData. The useEffect hook handles updating local formData
            // WITHOUT resetting expandedGroups if nodeId hasn't changed.
            updateNodeData(nodeId, importedData);
            console.log('[CharacterForm] updateNodeData called. Expanded groups state should persist if node ID is the same.');
          } else {
            console.error('[CharacterForm] Invalid JSON file format.');
            alert('错误：无效的 JSON 文件格式。 Error: Invalid JSON file format.');
          }
        } catch (error) {
          console.error('[CharacterForm] Error parsing JSON file:', error);
          alert(`解析 JSON 文件出错： ${error instanceof Error ? error.message : '未知错误'} Error parsing JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };
      reader.onerror = (e) => {
          console.error('[CharacterForm] Error reading file:', e);
          alert('读取文件时出错。Error reading file.');
      };
      reader.readAsText(file, 'UTF-8'); // Specify UTF-8 encoding
      // Reset file input value to allow importing the same file again
      event.target.value = '';
    } else {
       console.log('[CharacterForm] No file selected or event target has no files.');
    }
  };

  // Toggle group expansion
  const handleToggle = (groupKey: string, isOpen: boolean) => {
    console.log(`[CharacterForm] Toggling group: ${groupKey}, isOpen: ${isOpen}`);
    setExpandedGroups(prev => ({ ...prev, [groupKey]: isOpen }));
  };

  // --- Recursive Rendering Function ---
  const renderFormGroup = (data: any, path: string[] = []): React.ReactNode => {
    // If data is not an object or is null, display 'no data' message
    if (typeof data !== 'object' || data === null) {
      return <div className="text-xs text-gray-500 italic ml-4 p-1">(无数据)</div>; // Indented slightly more
    }
    // Map over the keys of the data object
    return Object.keys(data).map((key) => {
        const currentPath = [...path, key];
        const value = data[key];
        const isValueObject = typeof value === 'object' && value !== null;

        // Case 1: Structured property { Value: ..., Caption: ... }
        if (isValueObject && 'Value' in value && 'Caption' in value) {
            const caption = value.Caption || key; // Use Caption if available, else key
            const actualValue = value.Value;
            const inputType = typeof actualValue === 'number' ? 'number' : 'text';
            // Make fields read-only if they are not top-level (e.g., inside 'background')
            // Allow editing for 'name' and 'age' even if nested? Let's stick to top-level edit for now.
            const isReadOnly = path.length > 1; // Readonly if nested (path > 1)

            return (
            <div key={currentPath.join('.')} className="flex items-center space-x-2 ml-4 mb-1.5"> {/* Indented */}
                <div className="w-2/5 flex-shrink-0">
                <label className="block text-xs truncate text-gray-400" title={caption}> {/* Lighter gray for label */}
                    {caption}
                </label>
                </div>
                <div className="w-3/5 flex-grow">
                <input
                    type={inputType}
                    value={actualValue ?? ''} // Handle null/undefined value
                    onChange={(e) => { if (!isReadOnly) handleValueChange(currentPath, e); }}
                    readOnly={isReadOnly}
                    className={`p-1 border rounded w-full text-sm ${isReadOnly
                        ? 'border-gray-600 bg-gray-700 text-gray-400 cursor-not-allowed' // Style for readonly
                        : 'border-gray-500 bg-gray-800 text-white focus:border-blue-400 focus:ring-blue-400 focus:ring-opacity-50 focus:outline-none' // Style for editable
                    }`}
                    placeholder="输入值" // Placeholder text
                />
                </div>
            </div>
            );
        }
        // Case 2: Nested object (render recursively as a sub-group)
        else if (isValueObject && !Array.isArray(value)) {
            // Check if the nested object itself contains only Value/Caption pairs or simple values
            const containsOnlySimpleOrStructured = Object.values(value).every(
                v => (typeof v === 'object' && v !== null && 'Value' in v && 'Caption' in v) || typeof v !== 'object' || v === null
            );

            if (containsOnlySimpleOrStructured) {
                 // Render simple nested structure without extra border/label
                 return (
                    <div key={currentPath.join('.')} className="ml-4 mt-1 space-y-1 pl-2 py-1">
                        {renderFormGroup(value, currentPath)}
                    </div>
                 );
            } else {
                // Render as a distinct labeled sub-group if it contains deeper nesting
                return (
                    <div key={currentPath.join('.')} className="ml-4 mt-2 space-y-1 border-l border-gray-600 pl-3 py-1"> {/* Indented + Border */}
                        <label className="block text-xs font-semibold text-gray-300 mb-1"> {/* Sub-group label */}
                        {key}
                        </label>
                        {renderFormGroup(value, currentPath)}
                    </div>
                );
            }
        }
      // Case 3: Array (Placeholder - rendering not implemented)
      else if (Array.isArray(value)) {
         // Display array content as a simple string for now
         return (
            <div key={currentPath.join('.')} className="ml-4 mt-1 space-y-1 pl-2 py-1">
                <span className="text-xs text-gray-400">{key}: [数据...]</span>
            </div>
         );
         // Or keep placeholder:
         // return <div key={currentPath.join('.')} className="text-xs text-gray-500 italic ml-4">(数组类型渲染待实现: {key})</div>;
      }
      // Case 4: Simple value (string, number, boolean, null) - Display as non-editable text
      else {
        return (
           <div key={currentPath.join('.')} className="flex items-center space-x-2 ml-4 mb-1"> {/* Indented */}
               <div className="w-2/5 flex-shrink-0">
                   <label className="block text-xs truncate text-gray-400" title={key}>
                       {key}
                   </label>
               </div>
               <div className="w-3/5 flex-grow">
                   {/* Display value as text, handle null/undefined */}
                   <span className="p-1 w-full text-sm text-gray-300">{String(value ?? '')}</span>
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
        <h3 className="text-lg font-semibold text-white"> {/* Explicit white */}
          编辑角色: {nodeId}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-100 text-2xl leading-none" aria-label="Close">&times;</button>
      </div>

      {/* Import/Export Buttons */}
      <div className="flex space-x-2">
        {/* Hidden file input */}
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".json"
        />
        {/* Import Button */}
        <button
            onClick={handleImportClick}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm transition-colors duration-150" // Blue button
        >
            导入 JSON
        </button>
        {/* Export Button */}
        <button
            onClick={handleExport}
            className="px-3 py-1 bg-gray-600 text-gray-100 rounded hover:bg-gray-500 text-sm transition-colors duration-150" // Gray button
        >
            导出 JSON
        </button>
      </div>

      {/* Static Form Area - Scrollable */}
      <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar"> {/* Added custom-scrollbar class if defined */}
        {/* Render expected keys first */}
        {expectedKeys.map((groupKey) => {
          const isOpen = expandedGroups[groupKey] || false;
          // *** Ensure groupData is an object, even if key doesn't exist in formData ***
          const groupData = formData[groupKey] || {};
          const displayKey = keyToDisplayName[groupKey] || groupKey; // Use Chinese name or fallback to key

          return (
            <details
               key={groupKey}
               open={isOpen}
               onToggle={(e) => handleToggle(groupKey, (e.target as HTMLDetailsElement).open)}
               className="bg-gray-700 rounded border border-gray-600"
             >
              {/* *** FIX: Apply !important for blue text color *** */}
              <summary
                className="flex justify-between items-center px-3 py-2 cursor-pointer list-none !text-blue-400 font-medium" // Apply blue and font-medium here, ADDED !important
              >
                {/* Display Chinese name */}
                <span>{displayKey}</span>
                {/* Arrow inherits color */}
                <span className="text-xs">
                  {isOpen ? '▲' : '▼'}
                </span>
              </summary>
              {/* Content Area */}
              <div className="p-3 border-t border-gray-600 space-y-2">
                {/* Render the form group content */}
                {renderFormGroup(groupData, [groupKey])}
              </div>
            </details>
          );
        })}

         {/* Section for other keys (keys not in expectedKeys) */}
         {Object.keys(formData)
            .filter(key => !expectedKeys.includes(key)) // Filter out expected keys
            .map((otherKey) => {
              const isOpen = expandedGroups[otherKey] || false;
              const groupData = formData[otherKey] || {}; // Ensure object
              return (
                 <details
                     key={otherKey}
                     open={isOpen}
                     onToggle={(e) => handleToggle(otherKey, (e.target as HTMLDetailsElement).open)}
                     className="bg-gray-700 rounded border border-gray-600 opacity-80 hover:opacity-100 transition-opacity" // Slightly faded, less on hover
                 >
                     {/* Summary for other keys - keep gray */}
                     <summary className="flex justify-between items-center px-3 py-2 cursor-pointer list-none text-gray-400">
                         <span>{otherKey} (其他)</span> {/* Label as 'Other' */}
                         <span className="text-xs">{isOpen ? '▲' : '▼'}</span>
                     </summary>
                     {/* Content Area */}
                     <div className="p-3 border-t border-gray-600 space-y-2">
                         {renderFormGroup(groupData, [otherKey])}
                     </div>
                 </details>
              );
         })}
      </div>
    </div>
  );
};

export default CharacterForm;
