import React, { useState, useEffect, useRef } from 'react';
import {
  Field,
  FormRenderProps,
  FlowNodeJSON,
} from '@flowgram.ai/free-layout-editor'; 
import { FlowNodeEntity, FlowNodeFormData, FormModelV2 } from '@flowgram.ai/free-layout-editor';
import defaultCharacterTemplateJson from '../../../Templates/default-character-template.json';

import { FormHeader, FormContent } from '../../form-components'; 

// Define an interface for the character template structure
interface CharacterFullTemplate {
  name?: string;
  age?: number | null;
  background?: {
    origin?: string;
    occupation?: string;
    history?: string;
  };
  personality?: Record<string, any>; 
  relationships?: Array<Record<string, any>>;
  language?: string;
  // Ensure all top-level keys from default-character-template.json are listed here
}

// Cast the imported JSON to our interface
const defaultCharacterTemplate = defaultCharacterTemplateJson as CharacterFullTemplate;

interface CharacterNodeDataProperties {
  characterName: string;
  characterFilePath: string;
  characterJSON: Record<string, any>;
  loadError?: string; 
}

interface CharacterNodeData extends FlowNodeJSON {
  data: FlowNodeJSON['data'] & {
    properties: CharacterNodeDataProperties;
    title?: string; 
  };
}

// Deep merge utility
const isObject = (item: any): item is Record<string, any> => {
  return (item && typeof item === 'object' && !Array.isArray(item));
};

const deepMerge = <T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key] as Record<string, any>, source[key] as Record<string, any>);
      } else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
        // Simple array merge: concatenate and remove duplicates if necessary, or replace.
        // For this use case, replacing arrays from the source (or template) is often desired.
        // If specific array merging logic is needed (e.g. merging objects within arrays by ID),
        // this function would need to be more complex.
        // Here, we'll replace the target array with the source array if the source array is not empty.
        // If template has a default array, and loaded data has its own, loaded data takes precedence.
        Object.assign(target, { [key]: source[key] });
      }
      else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return deepMerge(target, ...sources);
};

export const renderCharacterForm = ({ form }: FormRenderProps<CharacterNodeData>) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayedFileName, setDisplayedFileName] = useState<string>(() => {
    return form.getValueIn<string>('data.properties.characterFilePath') || '';
  });
  const [formContentKey, setFormContentKey] = useState(0);

  useEffect(() => {
    const currentPathInForm = form.getValueIn<string>('data.properties.characterFilePath') || '';
    setDisplayedFileName(currentPathInForm);
  }, [form]);

  // Effect to initialize characterJSON with defaults
  useEffect(() => {
    const currentJson = form.getValueIn<Record<string, any>>('data.properties.characterJSON');
    if (!currentJson || Object.keys(currentJson).length === 0 || !currentJson.personality) {
      console.log("Initializing characterJSON with default template.");
      const templateCopy = JSON.parse(JSON.stringify(defaultCharacterTemplate)) as CharacterFullTemplate;
      const initialCharacterData: CharacterFullTemplate = {
        name: templateCopy.name || "新角色",
        age: templateCopy.age !== undefined ? templateCopy.age : null,
        background: templateCopy.background ? { ...templateCopy.background } : {
            origin: "",
            occupation: "",
            history: ""
        },
        // Spread other properties from the template (personality, relationships, etc.)
        personality: templateCopy.personality ? { ...templateCopy.personality } : {},
        relationships: templateCopy.relationships ? [ ...templateCopy.relationships ] : [],
        language: templateCopy.language || "chinese",
      };
      
      const mergedData = deepMerge({} as CharacterFullTemplate, initialCharacterData, currentJson || {});
      form.setValueIn('data.properties.characterJSON', mergedData);
      
      if (!form.getValueIn('data.properties.characterName') && mergedData.name) {
        form.setValueIn('data.properties.characterName', mergedData.name);
      }
      if (!form.getValueIn('data.title') && mergedData.name) {
         form.setValueIn('data.title', mergedData.name);
      }
    }
  }, [form]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setDisplayedFileName(file.name);
      form.setValueIn('data.properties.characterFilePath', file.name);

      console.log(`Attempting to load character data from selected file: ${file.name}`);
      try {
        const fileContentString = await file.text();
        const jsonDataFromFile = JSON.parse(fileContentString) as Partial<CharacterFullTemplate>; // Cast loaded data

        const templateCopy = JSON.parse(JSON.stringify(defaultCharacterTemplate)) as CharacterFullTemplate;
        
        // Start with a full structure from the template copy
        let baseStructure = JSON.parse(JSON.stringify(templateCopy)) as CharacterFullTemplate;

        // Explicitly set name, age, background from file or defaults if not in file
        baseStructure.name = jsonDataFromFile.name || templateCopy.name || "新角色";
        baseStructure.age = jsonDataFromFile.age !== undefined ? jsonDataFromFile.age : (templateCopy.age !== undefined ? templateCopy.age : null);
        baseStructure.background = deepMerge(
            {}, 
            templateCopy.background || { origin: "", occupation: "", history: "" }, 
            jsonDataFromFile.background || {}
        );
        // Ensure other parts from template are present if not in file (deepMerge handles this further down)

        const mergedJsonData = deepMerge(baseStructure, jsonDataFromFile);

        form.setValueIn('data.properties.characterJSON', mergedJsonData);
        form.setValueIn('data.properties.characterName', mergedJsonData.name || '未知角色');
        form.setValueIn('data.properties.loadError', ''); 

        if (mergedJsonData.name) {
          form.setValueIn('data.title', mergedJsonData.name);
        }
        console.log('Character data loaded from file, merged with defaults, and form updated.');
        setFormContentKey(prevKey => prevKey + 1);
      } catch (error: any) {
        console.error('Failed to load or parse character JSON from file:', error);
        form.setValueIn('data.properties.loadError', error.message || 'Failed to load data.');
        form.setValueIn('data.properties.characterJSON', {}); 
        form.setValueIn('data.properties.characterName', '');
        setFormContentKey(prevKey => prevKey + 1);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerDownload = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (!displayedFileName) {
      alert("没有加载文件，无法保存。请先使用 '导出' 或加载文件。");
      return;
    }
    const characterJSON = form.getValueIn('data.properties.characterJSON');
    if (!characterJSON) {
      alert("没有数据可保存。");
      return;
    }
    triggerDownload(JSON.stringify(characterJSON, null, 2), displayedFileName);
  };

  const handleExport = () => {
    const characterJSON = form.getValueIn('data.properties.characterJSON');
    if (!characterJSON || Object.keys(characterJSON).length === 0) {
      alert("没有数据可导出。");
      // Or trigger download with empty JSON object
      // triggerDownload(JSON.stringify({}, null, 2), 'empty-character.json');
      return;
    }
    const characterName = form.getValueIn<string>('data.properties.characterName');
    const fileName = characterName ? `${characterName.replace(/[^a-z0-9_\-\s\u4e00-\u9fa5]/gi, '_')}.json` : 'character-export.json';
    triggerDownload(JSON.stringify(characterJSON, null, 2), fileName);
  };

  const commonInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
    marginTop: '5px',
  };

  const commonLabelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '2px', // Reduced margin for tighter spacing with input
    fontWeight: 'normal', // Changed from bold to normal for sub-properties
    fontSize: '0.95em', // Slightly smaller for sub-labels
  };
  
  const fieldContainerStyle: React.CSSProperties = {
    marginBottom: '15px', // Increased margin for more separation between fields
    padding: '0 10px',
  };

  const getRemainingJson = (fullJson: Record<string, any> | undefined): Record<string, any> => {
    if (!fullJson) return {};
    const { name, age, background, ...remaining } = fullJson;
    return remaining;
  };

  // Helper function to get Chinese names for known group keys
  const getChineseGroupName = (key: string): string => {
    const map: Record<string, string> = {
      personality: "性格",
      relationships: "关系",
      language: "语言",
      // Add more mappings as needed from your JSON structure
      coretemperament: "核心气质",
      internalvalues: "内在价值观",
      thinkingstyle: "思维风格",
      internalmotivation: "内在动机",
      selfperception: "自我认知",
    };
    return map[key.toLowerCase()] || key.charAt(0).toUpperCase() + key.slice(1); // Fallback to capitalized key
  };

  // Helper function to update nested properties using a dot-separated path
  const updatePropertyByPath = (obj: Record<string, any>, path: string, value: any): Record<string, any> => {
    const pathParts = path.split('.');
    const newObj = JSON.parse(JSON.stringify(obj)); // Deep clone the object it's supposed to modify

    let currentLevel = newObj;
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (currentLevel[part] === undefined || typeof currentLevel[part] !== 'object' || currentLevel[part] === null) {
        currentLevel[part] = {}; 
      }
      currentLevel = currentLevel[part];
    }
    
    const lastPart = pathParts[pathParts.length - 1];
    if (value === undefined || value === null || value === '') { // Allow unsetting or setting to empty
      // Check if parent is an array or object to decide on delete vs set to null/empty
      // For simplicity here, we'll set to undefined which might remove the key upon stringification if it's standard JSON behavior
      // or set to null if that's preferred. Let's use undefined to effectively delete.
      // However, directly deleting might be better: delete currentLevel[lastPart];
      // For form consistency, often setting to null or empty string is better than deleting.
      // Let's choose null for objects/numbers that become empty, and empty string for strings.
      if (typeof currentLevel[lastPart] === 'string') currentLevel[lastPart] = '';
      else if (typeof currentLevel[lastPart] === 'number') currentLevel[lastPart] = null; // Or undefined if you want to remove the key
      else currentLevel[lastPart] = null; 
    } else {
      currentLevel[lastPart] = value;
    }
    return newObj;
  };

  // Recursive component to render individual properties or nested structures
  const RenderPropertyField: React.FC<{
    propKey: string; // The key of the current property/object/array
    propValue: any;
    currentPath: string; // Dot-separated path from the root of remainingJson, e.g., "personality.CoreTemperament.OptimismLevel"
    form: FormRenderProps<CharacterNodeData>['form'];
    commonInputStyle: React.CSSProperties;
    commonLabelStyle: React.CSSProperties;
    fieldContainerStyle: React.CSSProperties;
    depth?: number; // For indentation
    isInsidePersonalityGroup?: boolean; // Flag to indicate if we are rendering items within a personality subgroup
  }> = ({ propKey, propValue, currentPath, form, commonInputStyle, commonLabelStyle, fieldContainerStyle, depth = 0, isInsidePersonalityGroup = false }) => {

    const handleChange = (newValue: any, valuePathSuffix?: string) => {
      const fullCharacterJson = form.getValueIn<Record<string, any>>('data.properties.characterJSON') || {};
      const { name, age, background, ...currentRemaining } = fullCharacterJson;
      
      const pathToUpdate = valuePathSuffix ? `${currentPath}.${valuePathSuffix}` : currentPath;
      const updatedRemaining = updatePropertyByPath(currentRemaining, pathToUpdate, newValue);

      const newFullJson = {
        name,
        age,
        background,
        ...(Object.keys(updatedRemaining).length > 0 ? updatedRemaining : {}),
      };
      form.setValueIn('data.properties.characterJSON', newFullJson);
      setFormContentKey(prevKey => prevKey + 1);
    };

    const currentIndent = depth * 15; // Indentation in pixels

    // Case 1: Object with "Value" and "Caption"
    if (typeof propValue === 'object' && propValue !== null && 'Value' in propValue && 'Caption' in propValue && Object.keys(propValue).length <= 3) {
      return (
        <div style={{ ...fieldContainerStyle, marginLeft: `${currentIndent}px` }} key={currentPath}>
          <label style={commonLabelStyle}>{propValue.Caption || propKey}:</label>
          <input
            type={typeof propValue.Value === 'number' ? 'number' : 'text'}
            style={commonInputStyle}
            value={propValue.Value ?? ''}
            onChange={(e) => {
              const rawValue = e.target.value;
              let newSubValue: string | number | undefined = rawValue;
              if (typeof propValue.Value === 'number') {
                newSubValue = parseInt(rawValue, 10);
                if (isNaN(newSubValue as number)) newSubValue = undefined;
              }
              handleChange({ ...propValue, Value: newSubValue });
            }}
          />
        </div>
      );
    }

    // Case 1.5: Object representing a personality subgroup (e.g., CoreTemperament)
    // This will render its children (the actual traits) in a table.
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('.'));
    const isPersonalitySubGroup = parentPath === 'personality' && typeof propValue === 'object' && propValue !== null && !Array.isArray(propValue) && Object.values(propValue).every(v => isObject(v) && 'Value' in v && 'Caption' in v);

    if (isPersonalitySubGroup) {
      return (
        <div key={currentPath} style={{ ...fieldContainerStyle, marginLeft: `${depth * 15}px`, marginBottom: '15px' }}>
          <h5 style={{ marginTop: '10px', marginBottom: '10px', fontSize: '1em', fontWeight: 'bold' }}>{getChineseGroupName(propKey)}:</h5>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {Object.entries(propValue).map(([traitKey, traitObject]) => {
                if (isObject(traitObject) && 'Value' in traitObject && 'Caption' in traitObject) {
                  const valuePath = `${traitKey}.Value`; // Path relative to the current subgroup
                  return (
                    <tr key={traitKey} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px 4px', textAlign: 'left', minWidth: '100px' }}>{(traitObject as any).Caption}:</td>
                      <td style={{ padding: '8px 4px' }}>
                        <input
                          type="number"
                          style={{ ...commonInputStyle, marginTop: 0, width: '100%' }} // Adjusted width and margin
                          value={(traitObject as any).Value ?? ''}
                          onChange={(e) => {
                            const rawValue = e.target.value;
                            let numValue: number | null = parseInt(rawValue, 10);
                            if (isNaN(numValue)) numValue = null; // Allow clearing or invalid to be null
                            handleChange(numValue, valuePath); // Pass numValue and the path to the Value field
                          }}
                        />
                      </td>
                    </tr>
                  );
                }
                return null;
              })}
            </tbody>
          </table>
        </div>
      );
    }

    // Case 2: Array
    else if (Array.isArray(propValue)) {
      // Special handling for the 'relationships' array
      if (currentPath === 'relationships') {
        return (
          <div key={currentPath} style={{ marginBottom: '10px', marginLeft: `${currentIndent}px` }}>
            {/* Title for relationships is handled by the parent RenderPropertyField call for the group */}
            {propValue.map((item: any, index: number) => (
              <div key={`${currentPath}.${index}`} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0', backgroundColor: '#fdfdfd', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{fontSize: '0.95em'}}>关系 #{index + 1}</strong>
                  <button 
                    onClick={() => {
                      const newRelationships = [...propValue];
                      newRelationships.splice(index, 1);
                      handleChange(newRelationships);
                    }} 
                    style={{ padding: '3px 8px', fontSize: '0.85em', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                  >
                    删除
                  </button>
                </div>
                {(Object.keys(item || {}) as Array<keyof typeof item>).map(itemKey => (
                  <div style={{ ...fieldContainerStyle, marginLeft: '0px', marginBottom: '8px' }} key={`${currentPath}.${index}.${String(itemKey)}`}>
                    <label style={{...commonLabelStyle, textTransform: 'capitalize'}}>{getChineseGroupName(String(itemKey))} ({String(itemKey)}):</label>
                    <input
                      type="text"
                      style={commonInputStyle}
                      value={item[itemKey] || ''}
                      onChange={(e) => {
                        const newItem = { ...item, [itemKey]: e.target.value };
                        const newRelationships = [...propValue];
                        newRelationships[index] = newItem;
                        handleChange(newRelationships);
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
            <button 
              onClick={() => {
                const newRelationship = { character: "", type: "", description: "" }; // Default new relationship
                handleChange([...propValue, newRelationship]);
              }}
              style={{ marginTop: '10px', padding: '8px 12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              添加关系
            </button>
          </div>
        );
      }
      // Generic array rendering (for arrays other than relationships)
      return (
        <div key={currentPath} style={{ marginBottom: '10px', marginLeft: `${currentIndent}px`, borderLeft: depth > 0 ? '2px solid #f0f0f0' : 'none', paddingLeft: depth > 0 ? '10px' : '0' }}>
          <strong style={{ ...commonLabelStyle, marginTop: '10px', display: 'block', fontSize: '1em' }}>{getChineseGroupName(propKey)} ({propKey} - 列表):</strong>
          {propValue.length > 0 && propValue.every(item => typeof item !== 'object' && !Array.isArray(item)) ? (
             <textarea // Simple array of strings/numbers
              style={{ ...commonInputStyle, minHeight: '60px', fontFamily: 'inherit', fontSize: '0.95em' }}
              value={propValue.join('\n')}
              onChange={(e) => {
                handleChange(e.target.value.split('\n'));
              }}
              placeholder="每行一个项目 / One item per line"
            />
          ) : (
            <>
              {propValue.map((item, index) => (
                <div key={`${currentPath}[${index}]`} style={{ border: '1px dashed #e0e0e0', padding: '8px', margin: '8px 0', backgroundColor: '#fff' }}>
                  <em style={{display: 'block', marginBottom: '5px', color: '#555'}}>第 {index + 1} 项:</em>
                  {typeof item === 'object' && item !== null ? (
                    Object.entries(item).map(([itemKey, itemValue]) => (
                      <RenderPropertyField
                        key={itemKey}
                        propKey={itemKey}
                        propValue={itemValue}
                        currentPath={`${currentPath}[${index}].${itemKey}`} // Placeholder path, direct editing of complex array items not fully supported by updatePropertyByPath yet
                        form={form}
                        commonInputStyle={commonInputStyle}
                        commonLabelStyle={commonLabelStyle}
                        fieldContainerStyle={fieldContainerStyle}
                        depth={depth + 1} // Corrected depth for properties of objects within arrays
                        isInsidePersonalityGroup={parentPath === 'personality'} // Pass the flag down
                      />
                    ))
                  ) : (
                     <input
                        type="text"
                        style={commonInputStyle}
                        value={item ?? ''}
                        readOnly // For now, simple array items displayed read-only, edit via JSON
                     />
                  )}
                </div>
              ))}
              <div style={{ ...fieldContainerStyle, marginTop: '10px' }}>
                  <label style={{...commonLabelStyle, fontSize: '0.9em' }}>编辑整个列表 (JSON格式):</label>
                  <textarea
                    style={{ ...commonInputStyle, minHeight: '100px', fontFamily: 'monospace', fontSize: '0.9em' }}
                    value={JSON.stringify(propValue, null, 2)}
                    onChange={(e) => {
                      try {
                        handleChange(JSON.parse(e.target.value));
                      } catch (err) { console.warn(`Invalid JSON for ${propKey}:`, err); }
                    }}
                  />
              </div>
            </>
          )}
        </div>
      );
    }
    // Case 3: Nested Object (not "Value/Caption" type)
    else if (typeof propValue === 'object' && propValue !== null) {
      return (
        <div key={currentPath} style={{ marginLeft: `${currentIndent}px`, borderLeft: depth > 0 ? '2px solid #f0f0f0' : 'none', paddingLeft: depth > 0 ? '10px' : '0', marginBottom: '10px' }}>
          { depth > 0 && <strong style={{ ...commonLabelStyle, marginTop: '10px', display: 'block', fontSize: '1em' }}>{getChineseGroupName(propKey)} ({propKey}):</strong> }
          {Object.entries(propValue).map(([subKey, subValue]) => (
            <RenderPropertyField
              key={subKey}
              propKey={subKey}
              propValue={subValue}
              currentPath={`${currentPath}.${subKey}`}
              form={form}
              commonInputStyle={commonInputStyle}
              commonLabelStyle={commonLabelStyle}
              fieldContainerStyle={fieldContainerStyle}
              depth={depth + 1}
              isInsidePersonalityGroup={parentPath === 'personality'} // Pass the flag down
            />
          ))}
        </div>
      );
    }
    // Case 4: Simple value (string, number, boolean, null)
    else {
      // If this simple value is directly under a personality group (e.g. personality.someDirectValue), don't render it.
      // The table rendering for personality subgroups handles its children.
      if (isInsidePersonalityGroup) {
        return null;
      }
      return (
        <div style={{ ...fieldContainerStyle, marginLeft: `${currentIndent}px` }} key={currentPath}>
          <label style={commonLabelStyle}>{getChineseGroupName(propKey)} ({propKey}):</label>
          <input
            type={typeof propValue === 'number' ? 'number' : (typeof propValue === 'boolean' ? 'checkbox' : 'text')}
            style={typeof propValue === 'boolean' ? { marginRight: '10px', verticalAlign: 'middle'} : commonInputStyle}
            value={typeof propValue === 'boolean' ? undefined : (propValue ?? '')}
            checked={typeof propValue === 'boolean' ? propValue : undefined}
            onChange={(e) => {
              let newValue: any;
              if (typeof propValue === 'boolean') {
                newValue = e.target.checked;
              } else if (typeof propValue === 'number') {
                newValue = parseFloat(e.target.value); // Use parseFloat for decimals
                if (isNaN(newValue)) newValue = null; // Set to null if not a valid number
              } else {
                newValue = e.target.value;
              }
              handleChange(newValue);
            }}
          />
          {typeof propValue === 'boolean' && <span style={{verticalAlign: 'middle'}}>{propValue ? '是' : '否'}</span>}
        </div>
      );
    }
  };

  return (
    <>
      <FormHeader />
      <FormContent key={formContentKey}>
        {/* Entire Character File section WAS commented out, NOW UNCOMMENTED */}
        <div style={{ marginBottom: '20px', padding: '0 10px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            角色文件:
          </label>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileSelected}
              style={{ display: 'none' }}
            />
            <button onClick={handleBrowseClick} style={{ padding: '8px 12px' }}>
              浏览...
            </button>
            <button onClick={handleSave} disabled={!displayedFileName} style={{ padding: '8px 12px' }}>
              保存
            </button>
            <button onClick={handleExport} style={{ padding: '8px 12px' }}>
              导出
            </button>
          </div>
          {displayedFileName && (
            <span style={{ fontStyle: 'italic', display: 'block', marginTop: '8px', color: '#555' }}>
              已加载: {displayedFileName}
            </span>
          )}
          {!displayedFileName && (
             <span style={{ fontStyle: 'italic', display: 'block', marginTop: '8px', color: '#777' }}>
                未选择文件
             </span>
          )}
          {form.getValueIn<string>('data.properties.loadError') && (
            <p style={{ color: 'red', marginTop: '8px', fontSize: '0.9em' }}>
              错误: {form.getValueIn<string>('data.properties.loadError')}
            </p>
          )}
        </div>

        {/* Character Details section - Title commented out, fields remain */}
        <div style={{ padding: '0 10px', /*marginTop: '15px',*/ marginBottom: '10px', /*borderTop: '1px solid #eee', paddingTop: '15px'*/ }}>
          {/* <strong style={{ fontSize: '1.1em' }}>角色详情:</strong> */}
        </div>

        {/* Name Field */}
        <div style={fieldContainerStyle}>
          <label style={commonLabelStyle}>名称:</label>
          <input
            type="text"
            style={commonInputStyle}
            value={form.getValueIn<string>('data.properties.characterJSON.name') || ''}
            onChange={(e) => {
              const newValue = e.target.value;
              const currentJson = form.getValueIn<Record<string, any>>('data.properties.characterJSON') || {};
              form.setValueIn('data.properties.characterJSON', { ...currentJson, name: newValue });
              form.setValueIn('data.properties.characterName', newValue);
              form.setValueIn('data.title', newValue);
            }}
          />
        </div>

        {/* Age Field */}
        <div style={fieldContainerStyle}>
          <label style={commonLabelStyle}>年龄:</label>
          <input
            type="number"
            style={commonInputStyle}
            value={form.getValueIn<any>('data.properties.characterJSON.age') ?? ''}
            onChange={(e) => {
              const newValue = e.target.value;
              const currentJson = form.getValueIn<Record<string, any>>('data.properties.characterJSON') || {};
              const parsedAge = parseInt(newValue, 10);
              form.setValueIn('data.properties.characterJSON', { 
                ...currentJson, 
                age: isNaN(parsedAge) ? undefined : parsedAge 
              });
              setFormContentKey(prevKey => prevKey + 1);
            }}
          />
        </div>

        {/* Background Section Title - Title commented out, fields remain */}
        <div style={{ padding: '0 10px', marginTop: '15px', marginBottom: '5px' }}>
            {/* <strong style={{ fontSize: '1.05em' }}>背景:</strong> */}
        </div>

        {/* Background Origin Field - Commented out */}
        {/*
        <div style={fieldContainerStyle}>
          <label style={commonLabelStyle}>出身:</label>
          <input
            type="text"
            style={commonInputStyle}
            value={(form.getValueIn<Record<string, any>>('data.properties.characterJSON.background') || {}).origin || ''}
            onChange={(e) => {
              const newValue = e.target.value;
              const charJson = form.getValueIn<Record<string, any>>('data.properties.characterJSON') || {};
              const background = charJson.background || {};
              form.setValueIn('data.properties.characterJSON', {
                ...charJson,
                background: { ...background, origin: newValue },
              });
            }}
          />
        </div>
        */}

        {/* Background Occupation Field - Commented out */}
        {/*
        <div style={fieldContainerStyle}>
          <label style={commonLabelStyle}>职业:</label>
          <input
            type="text"
            style={commonInputStyle}
            value={(form.getValueIn<Record<string, any>>('data.properties.characterJSON.background') || {}).occupation || ''}
            onChange={(e) => {
              const newValue = e.target.value;
              const charJson = form.getValueIn<Record<string, any>>('data.properties.characterJSON') || {};
              const background = charJson.background || {};
              form.setValueIn('data.properties.characterJSON', {
                ...charJson,
                background: { ...background, occupation: newValue },
              });
            }}
          />
        </div>
        */}

        {/* Background History Field - Commented out */}
        {/*
        <div style={fieldContainerStyle}>
          <label style={commonLabelStyle}>经历:</label>
          <textarea
            style={{ ...commonInputStyle, minHeight: '100px', fontFamily: 'inherit', fontSize: 'inherit' }}
            value={(form.getValueIn<Record<string, any>>('data.properties.characterJSON.background') || {}).history || ''}
            onChange={(e) => {
              const newValue = e.target.value;
              const charJson = form.getValueIn<Record<string, any>>('data.properties.characterJSON') || {};
              const background = charJson.background || {};
              form.setValueIn('data.properties.characterJSON', {
                ...charJson,
                background: { ...background, history: newValue },
              });
            }}
          />
        </div>
        */}

        {/* Other Properties Dynamically Rendered - THIS SECTION MUST BE UNCOMMENTED AND ACTIVE */}
        <div style={{ padding: '0 10px', marginTop: '20px', marginBottom: '10px', borderTop: '2px solid #ccc', paddingTop: '15px' }}>
            <strong style={{ fontSize: '1.15em' }}>其他主要属性:</strong>
        </div>

        {Object.entries(getRemainingJson(form.getValueIn('data.properties.characterJSON'))).map(([groupKey, groupData]) => (
          <div key={groupKey} style={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: '4px', 
            padding: '15px', 
            margin: '10px', 
            backgroundColor: '#f9f9f9' 
          }}>
            <h4 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '10px', fontSize: '1.1em', color: '#333' }}>
              {getChineseGroupName(groupKey)}
            </h4>
            <RenderPropertyField
              propKey={groupKey}
              propValue={groupData}
              currentPath={groupKey} // Path is the groupKey itself from remainingJson root
              form={form}
              commonInputStyle={commonInputStyle}
              commonLabelStyle={commonLabelStyle}
              fieldContainerStyle={fieldContainerStyle}
              depth={0} // Initial depth for top-level groups
              isInsidePersonalityGroup={groupKey === 'personality'} // Set flag if this is the personality group itself
            />
          </div>
        ))}
      </FormContent>
    </>
  );
}; 