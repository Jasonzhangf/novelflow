import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Field,
  FormRenderProps,
  FieldRenderProps,
  FlowNodeJSON,
  FormModelV2,
  FlowNodeEntity,
  useNodeRender,
} from '@flowgram.ai/free-layout-editor';

import { FormHeader } from '../../form-components';
import defaultCharacterTemplateJson from '../../../Templates/default-character-template.json';

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
  [key: string]: any; // Allow other properties
}

// Cast the imported JSON to our interface
const defaultCharacterSourceForTemplate = defaultCharacterTemplateJson as CharacterFullTemplate;

// Function to create an empty template (can be imported or redefined if not already in scope)
// For this example, assuming a simplified version or that it's available.
// A more robust solution would share this with index.ts
function createEmptyTemplate(source: Record<string, any>): CharacterFullTemplate {
  const template: CharacterFullTemplate = {};
  if (!source || typeof source !== 'object') {
    return {
        name: '',
        age: null,
        background: { origin: '', occupation: '', history: '' },
        personality: {},
        relationships: [],
        language: 'chinese',
    };
  }
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const value = source[key];
      if (Array.isArray(value)) {
        template[key] = [];
      } else if (typeof value === 'object' && value !== null) {
        if (key === 'personality') {
            template[key] = {};
            const personalityGroup = template[key] as Record<string, any>;
            for (const pKey in value) {
                if (typeof value[pKey] === 'object' && value[pKey] !== null) {
                    personalityGroup[pKey] = {};
                    for (const traitKey in value[pKey]) {
                         if (typeof value[pKey][traitKey] === 'object' &&
                             value[pKey][traitKey] !== null &&
                             'Value' in value[pKey][traitKey] &&
                             'Caption' in value[pKey][traitKey]) {
                            personalityGroup[pKey][traitKey] = {
                                Value: typeof value[pKey][traitKey].Value === 'number' ? 0 : '',
                                Caption: value[pKey][traitKey].Caption,
                            };
                        } else {
                             personalityGroup[pKey][traitKey] = createEmptyTemplate(value[pKey][traitKey]);
                        }
                    }
                }
            }
        } else {
          template[key] = createEmptyTemplate(value);
        }
      } else if (typeof value === 'string') {
        template[key] = '';
      } else if (typeof value === 'number') {
        template[key] = null;
      } else if (typeof value === 'boolean') {
        template[key] = false;
      } else {
        template[key] = null;
      }
    }
  }
  if (template.name === undefined) template.name = '';
  if (template.age === undefined) template.age = null;
  if (template.background === undefined) template.background = { origin: '', occupation: '', history: '' };
  if (template.personality === undefined) template.personality = {};
  if (template.relationships === undefined) template.relationships = [];
  if (template.language === undefined) template.language = 'chinese';
  return template;
}

interface CharacterNodeData extends FlowNodeJSON {
  data: FlowNodeJSON['data'] & {
    characterJSON: CharacterFullTemplate;
    title?: string;
    // Removed properties like characterName, characterFilePath if they are now part of characterJSON
    // or handled differently.
    properties?: { // Keep properties if some meta-data is still stored here
        characterFilePath?: string; // For file name display
        outputVariableName?: string;
    };
     outputsValues?: { // Ensure outputsValues is part of the form data structure for updating
        jsonDataOut?: CharacterFullTemplate;
    };
  };
}

// Deep merge utility
const isObject = (item: any): item is Record<string, any> =>
  item && typeof item === 'object' && !Array.isArray(item);

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
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return deepMerge(target, ...sources);
};

// 受控输入组件，用于处理本地输入状态，并在失焦或回车时提交
// ManagedInput component to handle local input state and commit on blur or Enter
interface ManagedInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>,
    'onChange' | 'value' | 'onBlur' | 'onKeyDown'
  > {
  initialValue: string | number | null | undefined;
  onCommit: (value: string | number | null) => void;
  label?: string;
  multiline?: boolean;
  id?: string; // Ensure id is part of the props for logging
}

const ManagedInput: React.FC<ManagedInputProps> = ({
  initialValue,
  onCommit,
  label,
  multiline,
  id,
  ...rest
}) => {
  // console.log(`[ManagedInput ${id || 'NO_ID'}] Initializing. initialValue:`, initialValue, 'Props:', { initialValue, onCommit, label, multiline, id, ...rest });

  const [currentValue, setCurrentValue] = useState(() => {
    const val = initialValue !== undefined && initialValue !== null ? String(initialValue) : '';
    // console.log(`[ManagedInput ${id || 'NO_ID'}] useState initializer. initialValue:`, initialValue, `Setting currentValue to: '${val}'`);
    return val;
  });
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    const newInitialValueString =
      initialValue !== undefined && initialValue !== null ? String(initialValue) : '';
    // console.log(`[ManagedInput ${id || 'NO_ID'}] useEffect for initialValue. Current initialValue:`, initialValue, `Current 'currentValue' state: '${currentValue}'`);

    if (newInitialValueString !== currentValue) {
      // console.log(`[ManagedInput ${id || 'NO_ID'}] useEffect: initialValue ('${newInitialValueString}') differs from currentValue ('${currentValue}'). Updating currentValue.`);
      setCurrentValue(newInitialValueString);
    }
    // else {
    // console.log(`[ManagedInput ${id || 'NO_ID'}] useEffect: initialValue ('${newInitialValueString}') is same as currentValue ('${currentValue}'). No update.`);
    // }
  }, [initialValue]); // Rerun effect if initialValue prop changes // 如果 initialValue prop 改变，则重新运行 effect

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // console.log(`[ManagedInput ${id || 'NO_ID'}] handleChange. New target value: '${e.target.value}'`);
    setCurrentValue(e.target.value);
  };

  const handleCommit = () => {
    // console.log(`[ManagedInput ${id || 'NO_ID'}] handleCommit. Current 'currentValue': '${currentValue}', Original 'initialValue' prop:`, initialValue);
    const originalInitialValueString =
      initialValue !== undefined && initialValue !== null ? String(initialValue) : '';

    if (currentValue !== originalInitialValueString) {
      let valToCommit: string | number | null = currentValue;
      if (rest.type === 'number') {
        if (currentValue.trim() === '') {
          // console.log(`[ManagedInput ${id || 'NO_ID'}] Committing null for number type (empty string).`);
          valToCommit = null; // Or some other representation for clearing a number
        } else {
          const parsedNum = parseFloat(currentValue);
          valToCommit = isNaN(parsedNum) ? null : parsedNum;
          // console.log(`[ManagedInput ${id || 'NO_ID'}] Committing parsed number:`, valToCommit, `(from '${currentValue}')`);
        }
      } else {
        // console.log(`[ManagedInput ${id || 'NO_ID'}] Committing string value: '${valToCommit}'`);
      }
      onCommit(valToCommit);
    }
    // else {
    // console.log(`[ManagedInput ${id || 'NO_ID'}] No change from original initialValue. Not committing.`);
    // }
  };

  const handleBlur = () => {
    // console.log(`[ManagedInput ${id || 'NO_ID'}] handleBlur`);
    handleCommit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !multiline) {
      // console.log(`[ManagedInput ${id || 'NO_ID'}] handleKeyDown: Enter pressed.`);
      handleCommit();
      e.preventDefault(); // Prevent form submission or newline in single-line inputs // 阻止表单提交或在单行输入中换行
    }
  };

  const InputComponent = multiline ? 'textarea' : 'input';
  // console.log(`[ManagedInput ${id || 'NO_ID'}] Rendering. currentValue for input value prop: '${currentValue}'`);

  return (
    <div style={{ marginBottom: '15px' }}>
      {label && (
        <label
          style={{ display: 'block', marginBottom: '3px', fontWeight: '500' }}
          htmlFor={id || rest.name}
        >
          {label}
        </label>
      )}
      <InputComponent
        id={id}
        {...rest}
        ref={inputRef as any}
        style={{
          width: '100%',
          padding: '8px',
          marginBottom: '5px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxSizing: 'border-box',
        }}
        value={currentValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

// Interface for our FormRenderProps, extending the one from the library
// to include the 't' function for translations.
interface CustomFormRenderProps extends FormRenderProps<CharacterNodeData> {
  t: (key: string, options?: any) => string; // Define 't' function signature
}

export const renderCharacterForm = (props: CustomFormRenderProps) => {
  const { form: formFromProps, t: tFunction } = props; 
  const { form: formFromHook, node: nodeFromHook } = useNodeRender(); 

  // Prioritize form from hook if available, otherwise use form from props for general operations.
  const currentForm = formFromHook || formFromProps;
  // Node must come from the hook as it's not in CustomFormRenderProps
  const currentNode = nodeFromHook; 

  const tSafe = (key: string, options?: any) => {
    if (typeof tFunction === 'function') {
      return tFunction(key, options);
    }
    // console.log(`[CharacterForm] tFunction not available. Key: ${key}`); // Example of a log to remove or reduce
    if (options?.defaultValue) return options.defaultValue;
    const keyParts = key.split('.');
    return keyParts[keyParts.length - 1];
  };

  const characterJSONPath = 'data.characterJSON';
  const outputDataPath = 'data.outputsValues.jsonDataOut';
  const titlePath = 'data.title';
  const characterFilePathPropertyPath = 'data.properties.characterFilePath';

  const [jsonText, setJsonText] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayedFileName, setDisplayedFileName] = useState<string>(
    () => currentForm?.getValueIn<string>(characterFilePathPropertyPath) || ''
  );

  // Initial load of characterJSON into the editor
  useEffect(() => {
    if (currentForm) {
      let currentJson = currentForm.getValueIn<CharacterFullTemplate>(characterJSONPath);
      if (!currentJson || Object.keys(currentJson).length === 0) {
        // console.log('[CharacterForm] characterJSON is empty or undefined, initializing with default template.');
        currentJson = createEmptyTemplate(defaultCharacterSourceForTemplate);
        currentForm.setValueIn(characterJSONPath, currentJson);
        currentForm.setValueIn(outputDataPath, currentJson); // Ensure output is also set initially
        if (currentJson.name) {
            currentForm.setValueIn(titlePath, currentJson.name);
        }
      }
      try {
        setJsonText(JSON.stringify(currentJson, null, 2));
        setErrorText('');
      } catch (e: any) {
        setErrorText('Error serializing JSON: ' + e.message);
        setJsonText('{}'); 
      }
    }
    // else { // Removed to reduce noise
    //     console.warn("[CharacterForm] currentForm is not available in initial useEffect.");
    // }
  }, [currentForm]); // currentForm dependency is correct here.

  // Handles changes from the textarea editor
  const handleJsonTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!currentForm) return;
    const newText = event.target.value;
    setJsonText(newText);
    try {
      const parsedJson = JSON.parse(newText);
      currentForm.setValueIn(characterJSONPath, parsedJson);
      if (parsedJson.name && typeof parsedJson.name === 'string') {
        currentForm.setValueIn(titlePath, parsedJson.name);
      }
      currentForm.setValueIn(outputDataPath, parsedJson);
      // console.log(`[CharacterForm DEBUG] outputsValues.jsonDataOut UPDATED by handleJsonTextChange. New name: ${parsedJson.name}`, parsedJson);
      setErrorText('');
    } catch (e: any) {
      setErrorText('Invalid JSON: ' + e.message);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentForm) return;
    const file = event.target.files?.[0];
    if (file) {
      setDisplayedFileName(file.name);
      currentForm.setValueIn(characterFilePathPropertyPath, file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const fileContent = e.target?.result as string;
          const importedJson = JSON.parse(fileContent);
          setJsonText(JSON.stringify(importedJson, null, 2)); // Update editor
          currentForm.setValueIn(characterJSONPath, importedJson); // Update form
          if (importedJson.name && typeof importedJson.name === 'string') {
            currentForm.setValueIn(titlePath, importedJson.name);
          }
          currentForm.setValueIn(outputDataPath, importedJson); // Update output
          setErrorText('');
        } catch (err: any) {
          setErrorText('Error importing file: ' + err.message);
          setDisplayedFileName('');
          currentForm.setValueIn(characterFilePathPropertyPath, '');
        }
      };
      reader.readAsText(file, 'UTF-8');
    }
  };

  const handleExportClick = () => {
    if (!currentForm) return;
    try {
      const currentJson = currentForm.getValueIn<CharacterFullTemplate>(characterJSONPath) || {};
      const content = JSON.stringify(currentJson, null, 2);
      const fileNameToUse = displayedFileName || (currentJson.name ? `${currentJson.name.replace(/[^a-z0-9_\-\s\u4e00-\u9fa5]/gi, '_')}.json` : 'character.json');
      const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', fileNameToUse);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setErrorText('');
    } catch (e: any) {
      setErrorText('Error exporting JSON: ' + e.message);
    }
  };

  // This useEffect is for subscribing to external changes to the form data and inputs.
  useEffect(() => {
    if (formFromHook && typeof formFromHook.onFormValuesChange === 'function') {
      const dispose = formFromHook.onFormValuesChange(() => {
        // Get the input name
        let nameFromInput: string | undefined = formFromHook.getValueIn<string>('inputsValues.nameIn');
        const nameFromMisroutedInput = formFromHook.getValueIn<any>('inputsValues.jsonDataIn');
        if (nameFromInput === undefined && typeof nameFromMisroutedInput === 'string') {
          nameFromInput = nameFromMisroutedInput;
        }

        // Get current character data from the form (most reliable source of the complete object)
        let characterDataFromForm = formFromHook.getValueIn<CharacterFullTemplate>(characterJSONPath);
        if (!characterDataFromForm || Object.keys(characterDataFromForm).length === 0) {
          // console.log('[CharacterForm] characterDataFromForm is empty, initializing.');
          characterDataFromForm = createEmptyTemplate(defaultCharacterSourceForTemplate);
          // If it was empty, consider this an initial setup, so we should populate the form.
          // This path might be less common if initialization in index.ts and earlier useEffect works.
          formFromHook.setValueIn(characterJSONPath, characterDataFromForm);
          formFromHook.setValueIn(outputDataPath, characterDataFromForm);
          if (characterDataFromForm.name) {
            formFromHook.setValueIn(titlePath, characterDataFromForm.name);
          }
        }
        
        let modifiedByInput = false;
        // Create a new object for modifications to avoid direct mutation issues if characterDataFromForm is a direct state reference
        let newCharacterData = { ...characterDataFromForm }; 

        // Process name input
        if (nameFromInput !== undefined && nameFromInput !== null) {
          if (newCharacterData.name !== nameFromInput) {
            console.log(`[CharacterForm] Input Sync: Input '${nameFromInput}' will update characterJSON.name (was '${newCharacterData.name}').`);
            newCharacterData.name = nameFromInput;
            modifiedByInput = true;
          }
        }

        // If the input caused a modification, update form model values.
        if (modifiedByInput) {
          console.log(`[CharacterForm DEBUG] Input caused modification. Attempting to update form model. New name: ${newCharacterData.name}`);
          
          try {
            // Explicitly create a "clean" deep clone of the data to be set.
            // This helps ensure that what's passed to setValueIn is a simple, plain object.
            const cleanDataToSet = JSON.parse(JSON.stringify(newCharacterData));

            // Critical: Update outputDataPath first or at least ensure it's updated with the new data.
            formFromHook.setValueIn(outputDataPath, cleanDataToSet);
            console.log(`[CharacterForm DEBUG] outputsValues.jsonDataOut hopefully UPDATED. Name: ${cleanDataToSet.name}`);
            
            // Update the main characterJSON data
            formFromHook.setValueIn(characterJSONPath, cleanDataToSet);
            
            // Update title
            if (cleanDataToSet.name && typeof cleanDataToSet.name === 'string') {
              formFromHook.setValueIn(titlePath, cleanDataToSet.name);
            }
            
            // Update the jsonText state for the editor UI *after* core model updates.
            const newEditorText = JSON.stringify(cleanDataToSet, null, 2);
            if (newEditorText !== jsonText) { // Only set if different to avoid unnecessary re-renders/effect re-runs
              setJsonText(newEditorText);
            }
          } catch (cloneOrSetError: any) {
            console.error("[CharacterForm] Error during deep clone or setValueIn for input-driven update:", cloneOrSetError);
            setErrorText('Failed to update character data due to internal error: ' + cloneOrSetError.message);
            // If cloning fails, the rest of the data flow will be broken.
            // The RunningService will likely not see the updated output.
          }
        }

        // Synchronize jsonText with form's characterJSON if they diverge (e.g., due to undo/redo or external tool changing form)
        // This should run after input processing, to ensure manual/external edits to characterJSON via other means
        // are reflected in the textarea, but not interfere with input-driven updates.
        const currentCharacterJsonInFormForEditorSync = formFromHook.getValueIn<CharacterFullTemplate>(characterJSONPath);
        if (currentCharacterJsonInFormForEditorSync) {
            try {
                const formStateAsJsonString = JSON.stringify(currentCharacterJsonInFormForEditorSync, null, 2);
                if (formStateAsJsonString !== jsonText && !modifiedByInput) { // Only if not just modified by input path
                    // console.log("[CharacterForm] External/non-input change detected in form's characterJSON. Syncing to editor.");
                    setJsonText(formStateAsJsonString);
                }
            } catch (e: any) {
                // console.warn("[CharacterForm] Error stringifying characterJSON from form for editor sync:", e);
            }
        }
        
        // Always sync displayed file name (idempotent)
        const filePath = formFromHook.getValueIn<string>(characterFilePathPropertyPath);
        if (filePath !== displayedFileName) {
            setDisplayedFileName(filePath || '');
        }
        // Consider clearing errorText more selectively, not on every form change.
        // setErrorText(''); 
      });
      return () => {
        dispose.dispose();
      };
    } 
  }, [formFromHook, jsonText, displayedFileName, characterJSONPath, outputDataPath, titlePath, characterFilePathPropertyPath]);

  const formContainerStyle: React.CSSProperties = {
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    height: '100%', 
    boxSizing: 'border-box',
  };

  const editorStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '300px', 
    flexGrow: 1, 
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '10px',
    fontFamily: 'monospace',
    fontSize: '13px',
    boxSizing: 'border-box',
    resize: 'vertical',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    fontSize: '14px',
  };
  
  const errorStyle: React.CSSProperties = {
    color: 'red',
    fontSize: '12px',
    whiteSpace: 'pre-wrap',
    marginTop: '5px',
  };
    
  const fileInputStyle: React.CSSProperties = {
    display: 'none',
  };

  const fileNameStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#555',
    marginTop: '5px',
    fontStyle: 'italic',
  };

  if (!currentForm) {
    return (
        <div style={formContainerStyle}>
            <p>Loading form...</p>
        </div>
    );
  }

  return (
    <div style={formContainerStyle}>
      {/* FormHeader no longer takes a title prop directly */}
      {/* It reads title from form context via <Field name="title"> */}
      <FormHeader /> 
      
      <div>
        <label htmlFor="character-json-editor" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
          {tSafe('characterNode.form.jsonEditorLabel', { defaultValue: '角色JSON数据 / Character JSON Data' })}:
        </label>
        <textarea
          id="character-json-editor"
          style={editorStyle}
          value={jsonText}
          onChange={handleJsonTextChange}
          placeholder={tSafe('characterNode.form.jsonEditorPlaceholder', {defaultValue: '在此处输入或粘贴JSON / Enter or paste JSON here...'})}
        />
        {errorText && <div style={errorStyle}>{errorText}</div>}
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button type="button" onClick={handleImportClick} style={buttonStyle}>
          {tSafe('characterNode.form.importButton', { defaultValue: '导入JSON / Import JSON' })}
        </button>
        <input
          type="file"
          accept=".json"
          onChange={handleFileSelected}
          ref={fileInputRef}
          style={fileInputStyle}
        />
        <button type="button" onClick={handleExportClick} style={buttonStyle}>
          {tSafe('characterNode.form.exportButton', { defaultValue: '导出JSON / Export JSON' })}
        </button>
        {displayedFileName && <span style={fileNameStyle}>{tSafe('characterNode.form.currentFile', {defaultValue: '当前文件 / Current File'})}: {displayedFileName}</span>}
      </div>
      
      <div style={{ marginTop: 'auto', paddingTop: '10px', fontSize: '12px', color: '#777' }}>
         {tSafe('characterNode.form.helperText', {defaultValue: '提示：直接编辑JSON。导入/导出会覆盖当前编辑区。 / Tip: Edit JSON directly. Import/Export will overwrite the current editor content.'})}
      </div>
    </div>
  );
};
