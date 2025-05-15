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
    fontWeight: 'normal'
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
            <p style={{ color: 'red', marginTop: '5px' }}>{form.getValueIn<string>('data.properties.loadError')}</p>
          )}
        </div>

        <div style={{ padding: '0 10px', marginTop: '15px', marginBottom: '10px' }}>
            <strong>Character Details / 角色详情:</strong>
        </div>

        {/* Name Field */}
        <div style={fieldContainerStyle}>
          <label style={commonLabelStyle}>Name / 名称:</label>
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
          <label style={commonLabelStyle}>Age / 年龄:</label>
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
            }}
          />
        </div>

        {/* Background Section Title */}
        <div style={{ padding: '0 10px', marginTop: '15px', marginBottom: '5px' }}>
            <strong>Background / 背景:</strong>
        </div>

        {/* Background Origin Field */}
        <div style={fieldContainerStyle}>
          <label style={commonLabelStyle}>Origin / 出身:</label>
          <textarea
            style={{ ...commonInputStyle, minHeight: '60px', fontFamily: 'inherit', fontSize: 'inherit' }}
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

        {/* Background Occupation Field */}
        <div style={fieldContainerStyle}>
          <label style={commonLabelStyle}>Occupation / 职业:</label>
          <textarea
            style={{ ...commonInputStyle, minHeight: '60px', fontFamily: 'inherit', fontSize: 'inherit' }}
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

        {/* Background History Field */}
        <div style={fieldContainerStyle}>
          <label style={commonLabelStyle}>History / 经历:</label>
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

        {/* Other Properties Section Title */}
        <div style={{ padding: '0 10px', marginTop: '15px', marginBottom: '5px' }}>
            <strong>Other Properties / 其他属性:</strong>
        </div>

        {/* Other Properties JSON Textarea */}
        <div style={fieldContainerStyle}>
          <textarea
            style={{ 
              ...commonInputStyle, 
              minHeight: '150px', 
              fontFamily: 'monospace', 
              fontSize: '13px' 
            }}
            value={JSON.stringify(getRemainingJson(form.getValueIn('data.properties.characterJSON')), null, 2)}
            onChange={(e) => {
              try {
                const newRemainingJson = JSON.parse(e.target.value);
                const currentCharJson = form.getValueIn<Record<string, any>>('data.properties.characterJSON') || {};
                
                const updatedFullJson = {
                  ...newRemainingJson, // Start with new "other" data
                  name: currentCharJson.name, // Preserve dedicated field values
                  age: currentCharJson.age,
                  background: currentCharJson.background,
                };
                form.setValueIn('data.properties.characterJSON', updatedFullJson);

              } catch (error) {
                console.warn("Invalid JSON entered in 'Other Properties':", error);
                // Optionally: set a specific error message for this textarea
              }
            }}
          />
        </div>
      </FormContent>
    </>
  );
}; 