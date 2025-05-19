import React, { useEffect, useState, useContext } from 'react';

import { FlowNodeEntity, FlowNodeFormData, FormModelV2 } from '@flowgram.ai/free-layout-editor';

import { WorkflowNodeType } from '../../nodes/constants';
import { PropertiesEdit } from '../../form-components/properties-edit';
import { SidebarContext } from '../../context/sidebar-context';

const PropertiesPanelCharacterFields: React.FC = () => {
  const sidebarCtx = useContext(SidebarContext);
  const nodeRender = sidebarCtx?.nodeRender;
  const selectedNode = nodeRender?.node as FlowNodeEntity | undefined;

  // Get the FormModel, this is the primary interface for form data manipulation
  const formModel = selectedNode?.getData(FlowNodeFormData)?.getFormModel<FormModelV2>();

  const [localCharacterFilePath, setLocalCharacterFilePath] = useState<string>('');

  useEffect(() => {
    if (selectedNode?.type === WorkflowNodeType.CHARACTER && formModel) {
      const initialPath = formModel.getValueIn<string>('properties.characterFilePath') || '';
      setLocalCharacterFilePath(initialPath);
    } else {
      setLocalCharacterFilePath('');
    }
  }, [selectedNode, formModel]); // Depend on formModel

  const handleFilePathChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalCharacterFilePath(event.target.value);
  };

  const handleLoadFile = async () => {
    if (!selectedNode || !formModel || !localCharacterFilePath) {
      console.warn(
        'Cannot load file: No node selected, formModel unavailable, or file path is empty.'
      );
      return;
    }
    console.log(`Attempting to load character data from: ${localCharacterFilePath}`);
    try {
      let fileContentString: string;
      if (localCharacterFilePath === 'Doc/李观一.json') {
        fileContentString = JSON.stringify({
          name: 'Li Guanyi / 李观一',
          age: 13,
          background: {
            origin: 'Unknown',
            occupation: 'Apothecary Apprentice',
            history: 'Survived assassination attempt...',
          },
          personality: { CoreTemperament: { OptimismLevel: { Value: 60, Caption: '乐观度' } } },
          relationships: [{ character: 'Murong Qiushui', type: 'Aunt (Guardian)' }],
          language: 'chinese',
        });
      } else {
        throw new Error(
          `Simulated file read: File not found or access denied for ${localCharacterFilePath}. Please implement actual file reading.`
        );
      }
      const jsonData = JSON.parse(fileContentString);

      formModel.setValueIn('properties.characterJSON', jsonData);
      formModel.setValueIn('properties.characterName', jsonData.name || 'Unknown Character');
      formModel.setValueIn('properties.characterFilePath', localCharacterFilePath);

      if (jsonData.name) {
        formModel.setValueIn('title', jsonData.name);
      }
      console.log('Character data loaded and form updated.');
    } catch (error) {
      console.error('Failed to load or parse character JSON:', error);
    }
  };

  if (!selectedNode || selectedNode.type !== WorkflowNodeType.CHARACTER || !formModel) {
    return null;
  }

  return (
    <div style={{ padding: '10px' }}>
      <h4>Character Node Details / 角色节点详情</h4>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="characterFilePathInput" style={{ display: 'block', marginBottom: '5px' }}>
          Character File Path / 角色文件路径:
        </label>
        <input
          id="characterFilePathInput"
          type="text"
          value={localCharacterFilePath}
          onChange={handleFilePathChange}
          placeholder="e.g., Doc/李观一.json"
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
        <button
          onClick={handleLoadFile}
          disabled={!localCharacterFilePath}
          style={{ marginTop: '5px', padding: '8px 12px' }}
        >
          Load Data / 加载数据
        </button>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Name / 名称:</strong>
        <span>{formModel.getValueIn<string>('properties.characterName') || 'N/A'}</span>
      </div>
      <div>
        <strong>Character Data (JSON) / 角色数据 (JSON):</strong>
        <PropertiesEdit
          value={formModel.getValueIn<Record<string, any>>('properties.characterJSON') || {}}
          onChange={(newJson: Record<string, any>) => {
            formModel.setValueIn('properties.characterJSON', newJson);
            if (
              newJson &&
              typeof newJson === 'object' &&
              'name' in newJson &&
              typeof newJson.name === 'string'
            ) {
              formModel.setValueIn('properties.characterName', newJson.name);
              formModel.setValueIn('title', newJson.name);
            }
          }}
        />
      </div>
    </div>
  );
};

export default PropertiesPanelCharacterFields;
