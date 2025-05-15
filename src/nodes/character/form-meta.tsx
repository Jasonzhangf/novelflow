import React, { useState, useEffect, useRef } from 'react';
import {
  Field,
  FormRenderProps,
  FlowNodeJSON,
} from '@flowgram.ai/free-layout-editor'; 
import { FlowNodeEntity, FlowNodeFormData, FormModelV2 } from '@flowgram.ai/free-layout-editor';

import { FormHeader, FormContent } from '../../form-components'; 

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

export const renderCharacterForm = ({ form }: FormRenderProps<CharacterNodeData>) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayedFileName, setDisplayedFileName] = useState<string>(() => {
    return form.getValueIn<string>('data.properties.characterFilePath') || '';
  });

  useEffect(() => {
    const currentPathInForm = form.getValueIn<string>('data.properties.characterFilePath') || '';
    setDisplayedFileName(currentPathInForm);
  }, [form, form.getValueIn<string>('data.properties.characterFilePath')]);

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
        const jsonData = JSON.parse(fileContentString);

        form.setValueIn('data.properties.characterJSON', jsonData);
        form.setValueIn('data.properties.characterName', jsonData.name || 'Unknown Character');
        form.setValueIn('data.properties.loadError', ''); 

        if (jsonData.name) {
          form.setValueIn('data.title', jsonData.name);
        }
        console.log('Character data loaded from file and form updated.');
      } catch (error: any) {
        console.error('Failed to load or parse character JSON from file:', error);
        form.setValueIn('data.properties.loadError', error.message || 'Failed to load data.');
        form.setValueIn('data.properties.characterJSON', {}); 
        form.setValueIn('data.properties.characterName', '');
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <FormHeader />
      <FormContent>
        <div style={{ marginBottom: '10px', padding: '0 10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Character File / 角色文件:
          </label>
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleFileSelected} 
            style={{ display: 'none' }} 
          />
          <button onClick={handleBrowseClick} style={{ padding: '8px 12px', marginRight: '10px' }}>
            Browse... / 浏览...
          </button>
          <span style={{ fontStyle: displayedFileName ? 'normal' : 'italic' }}>
            {displayedFileName || 'No file selected / 未选择文件'}
          </span>
          
          {form.getValueIn<string>('data.properties.loadError') && (
            <p style={{ color: 'red' }}>{form.getValueIn<string>('data.properties.loadError')}</p>
          )}
        </div>

        <div style={{ padding: '0 10px' }}>
            <strong>Character Data (JSON) / 角色数据 (JSON):</strong>
        </div>
        <Field
          name="data.properties.characterJSON"
          render={({ field }: { field: { value: Record<string, any>, onChange: (newVal: Record<string, any>) => void }}) => (
            <div style={{ padding: '0 10px', marginTop: '5px', marginBottom: '10px' }}>
              <textarea
                style={{
                  width: '100%',
                  minHeight: '200px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '8px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  boxSizing: 'border-box' // Ensures padding and border are included in width/height
                }}
                value={JSON.stringify(field.value || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const newJson = JSON.parse(e.target.value);
                    field.onChange(newJson);
                    if (newJson && typeof newJson === 'object' && 'name' in newJson && typeof newJson.name === 'string') {
                      form.setValueIn('data.properties.characterName', newJson.name);
                      form.setValueIn('data.title', newJson.name);
                    }
                  } catch (error) {
                    // Optionally, handle JSON parsing errors (e.g., display a message)
                    console.warn("Invalid JSON entered:", error);
                  }
                }}
              />
            </div>
          )}
        />
      </FormContent>
    </>
  );
}; 