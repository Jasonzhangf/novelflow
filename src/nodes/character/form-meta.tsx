import React, { useState, useEffect, useRef, useCallback } from 'react';

import {
  Field,
  FormRenderProps,
  FieldRenderProps,
  FlowNodeJSON,
  FormModelV2,
  FlowNodeEntity,
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
  // Ensure all top-level keys from default-character-template.json are listed here
}

// Cast the imported JSON to our interface
const defaultCharacterTemplate = defaultCharacterTemplateJson as CharacterFullTemplate;

interface CharacterNodeDataProperties {
  characterName: string;
  characterFilePath: string;
  characterJSON: Record<string, any>;
  loadError?: string;
  outputVariableName?: string; // Added for completeness from ManagedInput usage
}

interface CharacterNodeData extends FlowNodeJSON {
  data: FlowNodeJSON['data'] & {
    properties: CharacterNodeDataProperties;
    title?: string;
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

export const renderCharacterForm = ({ form, t }: CustomFormRenderProps) => {
  // Defensive t function to prevent crashes if not provided, and provide default values.
  const tSafe = (key: string, options?: any) => {
    if (typeof t === 'function') {
      return t(key, options);
    }
    // Fallback logic if t is not a function
    if (options?.defaultValue) {
      return options.defaultValue;
    }
    // Return key if no t and no defaultValue, common for i18n libraries during development
    const keyParts = key.split('.');
    return keyParts[keyParts.length - 1];
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayedFileName, setDisplayedFileName] = useState<string>(
    () => form.getValueIn<string>('data.properties.characterFilePath') || ''
  );
  const [formContentKey, setFormContentKey] = useState(0);

  const characterJSONPath = 'data.properties.characterJSON';
  const characterNamePath = 'data.properties.characterName';
  const titlePath = 'data.title';

  const initialCharacterJSON = form.getValueIn<CharacterFullTemplate>(characterJSONPath) || {};
  const initialNameFromJSON = initialCharacterJSON.name;
  const initialAgeFromJSON = initialCharacterJSON.age;
  const characterNameProp = form.getValueIn<string>(characterNamePath);
  const currentTitleValue = form.getValueIn<string>(titlePath); // Read current title for fallback

  // Effective initial name for the input field
  const effectiveInitialName = initialNameFromJSON || characterNameProp || currentTitleValue || '';
  const effectiveInitialAge = initialAgeFromJSON;

  console.log(
    `[renderCharacterForm] FINAL VALUES BEFORE RENDER. Name: '${effectiveInitialName}', Age:`,
    effectiveInitialAge,
    `Type of Age: ${typeof effectiveInitialAge}`
  );

  // useEffect for initialization and syncing name/title
  useEffect(() => {
    let currentJsonInEffect = form.getValueIn<Record<string, any>>(characterJSONPath);
    let characterNameInEffect = form.getValueIn<string>(characterNamePath);
    let titleInEffect = form.getValueIn<string>(titlePath);
    let changed = false;

    if (
      !currentJsonInEffect ||
      Object.keys(currentJsonInEffect).length === 0 ||
      !currentJsonInEffect.personality
    ) {
      const templateCopy = JSON.parse(
        JSON.stringify(defaultCharacterTemplate)
      ) as CharacterFullTemplate;
      const initialCharacterData: CharacterFullTemplate = {
        name: templateCopy.name || '新角色',
        age: templateCopy.age !== undefined ? templateCopy.age : null,
        background: templateCopy.background
          ? { ...templateCopy.background }
          : { origin: '', occupation: '', history: '' },
        personality: templateCopy.personality ? { ...templateCopy.personality } : {},
        relationships: templateCopy.relationships ? [...templateCopy.relationships] : [],
        language: templateCopy.language || 'chinese',
      };
      currentJsonInEffect = deepMerge(
        {} as CharacterFullTemplate,
        initialCharacterData,
        currentJsonInEffect || {}
      );
      form.setValueIn(characterJSONPath, currentJsonInEffect);
      form.setValueIn('outputsValues.jsonDataOut', currentJsonInEffect);
      changed = true;
    }

    if (currentJsonInEffect && currentJsonInEffect.name) {
      if (characterNameInEffect !== currentJsonInEffect.name) {
        form.setValueIn(characterNamePath, currentJsonInEffect.name);
        changed = true;
      }
      if (titleInEffect !== currentJsonInEffect.name) {
        form.setValueIn(titlePath, currentJsonInEffect.name);
        changed = true;
      }
    }
    form.setValueIn('outputsValues.jsonDataOut', currentJsonInEffect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const currentPathInForm = form.getValueIn<string>('data.properties.characterFilePath') || '';
    if (currentPathInForm !== displayedFileName) {
      setDisplayedFileName(currentPathInForm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.getValueIn('data.properties.characterFilePath')]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      form.setValueIn('data.properties.characterFilePath', file.name);

      // console.log(`Attempting to load character data from selected file: ${file.name}`);
      try {
        const fileContentString = await file.text();
        const jsonDataFromFile = JSON.parse(fileContentString) as Partial<CharacterFullTemplate>;

        const templateCopy = JSON.parse(
          JSON.stringify(defaultCharacterTemplate)
        ) as CharacterFullTemplate;
        let baseStructure = JSON.parse(JSON.stringify(templateCopy)) as CharacterFullTemplate;

        baseStructure.name = jsonDataFromFile.name || templateCopy.name || '新角色';
        baseStructure.age =
          jsonDataFromFile.age !== undefined
            ? jsonDataFromFile.age
            : templateCopy.age !== undefined
            ? templateCopy.age
            : null;
        baseStructure.background = deepMerge(
          {},
          templateCopy.background || { origin: '', occupation: '', history: '' },
          jsonDataFromFile.background || {}
        );

        const mergedJsonData = deepMerge(baseStructure, jsonDataFromFile);

        form.setValueIn('data.characterJSON', mergedJsonData);
        form.setValueIn('data.name', mergedJsonData.name || '');
        form.setValueIn('data.age', mergedJsonData.age ?? null);
        form.setValueIn('data.title', mergedJsonData.name || '');
        form.setValueIn('data.loadError', '');
        form.setValueIn('data.properties.characterJSON', mergedJsonData);
        form.setValueIn('data.properties.characterName', mergedJsonData.name || '未知角色');
        // --- Sync to top-level fields for canvas and standard node compatibility ---
        form.setValueIn('data.name', mergedJsonData.name || '');
        form.setValueIn('data.age', mergedJsonData.age ?? null);
        if (mergedJsonData.name) {
          form.setValueIn('data.title', mergedJsonData.name);
        }
        form.setValueIn('outputsValues.jsonDataOut', mergedJsonData);
        // console.log('Character data loaded from file, merged with defaults, and form updated.');
        // setFormContentKey(prevKey => prevKey + 1); // Temporarily commented out
      } catch (error: any) {
        console.error('Failed to load or parse character JSON from file:', error);
        form.setValueIn('data.properties.loadError', error.message || 'Failed to load data.');
        form.setValueIn('data.properties.characterJSON', {});
        form.setValueIn('data.properties.characterName', '');
        // setFormContentKey(prevKey => prevKey + 1); // Temporarily commented out
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
    const currentFilePath = form.getValueIn<string>('data.properties.characterFilePath');
    if (!currentFilePath) {
      alert(
        "没有文件路径，请先使用 '导出' 功能命名文件或加载一个现有文件。\nNo file path. Please use 'Export' to name the file or load an existing file first."
      );
      return;
    }
    const characterJSON = form.getValueIn('data.properties.characterJSON');
    if (!characterJSON) {
      alert('没有数据可保存。/ No data to save.');
      return;
    }
    triggerDownload(JSON.stringify(characterJSON, null, 2), currentFilePath);
    form.setValueIn('outputsValues.jsonDataOut', characterJSON);
  };

  const handleExport = () => {
    const characterJSON = form.getValueIn('data.properties.characterJSON');
    if (!characterJSON || Object.keys(characterJSON).length === 0) {
      alert('没有数据可导出。/ No data to export.');
      return;
    }
    const characterName =
      form.getValueIn<string>('data.properties.characterJSON.name') ||
      form.getValueIn<string>('data.properties.characterName') ||
      'character';
    const fileName = `${characterName.replace(/[^a-z0-9_\-\s\u4e00-\u9fa5]/gi, '_')}.json`;
    triggerDownload(JSON.stringify(characterJSON, null, 2), fileName);
    if (!form.getValueIn('data.properties.characterFilePath')) {
      form.setValueIn('data.properties.characterFilePath', fileName);
    }
    form.setValueIn('outputsValues.jsonDataOut', characterJSON);
  };

  const baseInputStyle: React.CSSProperties = {
    // Renamed from commonInputStyle to avoid conflict in this scope
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
    marginTop: '5px',
  };

  const baseLabelStyle: React.CSSProperties = {
    // Renamed from commonLabelStyle
    display: 'block',
    marginBottom: '2px',
    fontWeight: 'normal',
    fontSize: '0.95em',
  };

  const baseFieldContainerStyle: React.CSSProperties = {
    // Renamed from fieldContainerStyle
    marginBottom: '15px',
    padding: '0 10px',
  };

  const getRemainingJson = (fullJson: Record<string, any> | undefined): Record<string, any> => {
    if (!fullJson) return {};
    const { name, age, background, language, ...remaining } = fullJson; // Exclude language as well if it has special handling
    return remaining;
  };

  const getChineseGroupName = (key: string): string => {
    const map: Record<string, string> = {
      personality: '性格',
      relationships: '关系',
      coretemperament: '核心气质',
      internalvalues: '内在价值观',
      thinkingstyle: '思维风格',
      internalmotivation: '内在动机',
      selfperception: '自我认知',
      skills_abilities: '技能与能力',
      possessions_inventory: '物品与装备',
      settings_affiliations: '场景与阵营',
      plot_points: '情节要点',
      custom_fields: '自定义字段',
      appearance_details: '外貌细节',
      occupation_role: '职业/角色',
      notes_comments: '备注',
      description: '描述',
      personality_description: '性格描述',
      background_story: '背景故事',
      goals_motivations: '目标与动机',
    };
    return map[key.toLowerCase().replace(/\s+/g, '')] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  const updatePropertyByPath = (
    obj: Record<string, any>,
    path: string,
    value: any
  ): Record<string, any> => {
    const pathParts = path.split('.');
    const newObj = JSON.parse(JSON.stringify(obj));

    let currentLevel = newObj;
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (
        currentLevel[part] === undefined ||
        typeof currentLevel[part] !== 'object' ||
        currentLevel[part] === null
      ) {
        currentLevel[part] = {};
      }
      currentLevel = currentLevel[part];
    }

    const lastPart = pathParts[pathParts.length - 1];
    if (value === undefined || value === null || value === '') {
      if (typeof currentLevel[lastPart] === 'string') currentLevel[lastPart] = '';
      else if (typeof currentLevel[lastPart] === 'number') currentLevel[lastPart] = null;
      else currentLevel[lastPart] = null;
    } else {
      currentLevel[lastPart] = value;
    }
    return newObj;
  };

  const RenderPropertyField: React.FC<{
    propKey: string;
    propValue: any;
    currentPath: string;
    form: FormRenderProps<CharacterNodeData>['form'];
    depth?: number;
    // isInsidePersonalityGroup?: boolean; // This prop seems to be causing confusion and might not be needed if logic is self-contained.
  }> = ({ propKey, propValue, currentPath, form, depth = 0 }) => {
    const handleInputChange = (newValue: any, valuePathSuffix?: string) => {
      const fullCharacterJson =
        form.getValueIn<Record<string, any>>('data.properties.characterJSON') || {};
      const { name, age, background, language, ...currentRemaining } = fullCharacterJson;

      const pathToUpdate = valuePathSuffix ? `${currentPath}.${valuePathSuffix}` : currentPath;
      const updatedRemaining = updatePropertyByPath(currentRemaining, pathToUpdate, newValue);

      const newFullJson = {
        name,
        age,
        background,
        language,
        ...(Object.keys(updatedRemaining).length > 0 ? updatedRemaining : {}),
      };
      form.setValueIn('data.properties.characterJSON', newFullJson);
      form.setValueIn('outputsValues.jsonDataOut', newFullJson);
      // setFormContentKey(prevKey => prevKey + 1); // Temporarily commented out
    };

    const currentIndent = depth * 15;

    // 1. 特殊结构（Value/Caption/Unit）
    if (
      typeof propValue === 'object' &&
      propValue !== null &&
      'Value' in propValue &&
      'Caption' in propValue &&
      Object.keys(propValue).length <= 3 /* Allow for an optional Unit key */
    ) {
      return (
        <div
          style={{
            ...baseFieldContainerStyle,
            marginLeft: `${currentIndent}px`,
            paddingLeft: '0px',
          }}
          key={currentPath}
        >
          <ManagedInput
            label={(propValue.Caption || propKey) + (propValue.Unit ? ` (${propValue.Unit})` : '')}
            initialValue={propValue.Value}
            type={typeof propValue.Value === 'number' ? 'number' : 'text'}
            onCommit={(committedValue) => {
              let finalValue = committedValue;
              if (typeof propValue.Value === 'number') {
                const num = parseFloat(committedValue as string);
                finalValue = isNaN(num) ? null : num;
              }
              handleInputChange({ ...propValue, Value: finalValue });
            }}
          />
        </div>
      );
    }

    // 2. personality 子分组
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('.'));
    const isPersonalitySubGroup =
      parentPath === 'personality' &&
      typeof propValue === 'object' &&
      propValue !== null &&
      !Array.isArray(propValue) &&
      Object.values(propValue).every((v) => isObject(v) && 'Value' in v && 'Caption' in v);

    if (isPersonalitySubGroup) {
      return (
        <div
          key={currentPath}
          style={{
            ...baseFieldContainerStyle,
            marginLeft: `${depth * 15}px`,
            marginBottom: '15px',
            paddingLeft: '0px',
          }}
        >
          <h5
            style={{ marginTop: '10px', marginBottom: '10px', fontSize: '1em', fontWeight: 'bold' }}
          >
            {getChineseGroupName(propKey)}:
          </h5>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {Object.entries(propValue).map(([traitKey, traitObject]) => {
                if (isObject(traitObject) && 'Value' in traitObject && 'Caption' in traitObject) {
                  const valuePathForTable = `${traitKey}.Value`;
                  return (
                    <tr key={traitKey} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px 4px', textAlign: 'left', minWidth: '100px' }}>
                        {((traitObject as any).Caption || traitKey) +
                          ((traitObject as any).Unit ? ` (${(traitObject as any).Unit})` : '')}
                        :
                      </td>
                      <td style={{ padding: '8px 4px' }}>
                        <ManagedInput
                          initialValue={(traitObject as any).Value}
                          type="number"
                          onCommit={(committedValue) => {
                            let numValue: number | null = parseFloat(committedValue as string);
                            if (isNaN(numValue)) numValue = null;
                            handleInputChange(numValue, valuePathForTable);
                          }}
                          style={{
                            ...baseInputStyle,
                            marginTop: 0,
                            width: '100%',
                            marginBottom: 0,
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

    // 3. relationships 列表
    if (currentPath === 'relationships') {
      return (
        <div
          key={currentPath}
          style={{ marginBottom: '10px', marginLeft: `${currentIndent}px`, paddingLeft: '0px' }}
        >
          {propValue.map((item: any, index: number) => (
            <div
              key={`${currentPath}.${index}`}
              style={{
                border: '1px solid #ddd',
                padding: '10px',
                margin: '10px 0',
                backgroundColor: '#fdfdfd',
                borderRadius: '4px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <strong style={{ fontSize: '0.95em' }}>关系 #{index + 1}</strong>
                <button
                  onClick={() => {
                    const newRelationships = [...propValue];
                    newRelationships.splice(index, 1);
                    handleInputChange(newRelationships);
                  }}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.85em',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                >
                  删除
                </button>
              </div>
              {(Object.keys(item || {}) as Array<keyof typeof item>).map((itemKey) => (
                <ManagedInput
                  key={`${currentPath}.${index}.${String(itemKey)}`}
                  label={`${getChineseGroupName(String(itemKey))} (${String(itemKey)})`}
                  initialValue={item[itemKey] || ''}
                  type="text"
                  multiline={
                    String(itemKey).toLowerCase().includes('description') ||
                    String(itemKey).toLowerCase().includes('history')
                  }
                  onCommit={(committedValue) => {
                    const newItem = { ...item, [itemKey]: committedValue };
                    const newRelationships = [...propValue];
                    newRelationships[index] = newItem;
                    handleInputChange(newRelationships);
                  }}
                />
              ))}
            </div>
          ))}
          <button
            onClick={() => {
              const newRelationship = { character: '', type: '', description: '' };
              handleInputChange([...propValue, newRelationship]);
            }}
            style={{
              marginTop: '10px',
              padding: '8px 12px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            添加关系
          </button>
        </div>
      );
    }

    // 4. 普通数组
    if (Array.isArray(propValue)) {
      return (
        <div
          key={currentPath}
          style={{
            marginBottom: '10px',
            marginLeft: `${currentIndent}px`,
            borderLeft: depth > 0 ? '2px solid #f0f0f0' : 'none',
            paddingLeft: depth > 0 ? '10px' : '0',
          }}
        >
          <strong
            style={{ ...baseLabelStyle, marginTop: '10px', display: 'block', fontSize: '1em' }}
          >
            {getChineseGroupName(propKey)} ({propKey} - 列表):
          </strong>
          {propValue.length > 0 &&
          propValue.every((item) => typeof item !== 'object' && !Array.isArray(item)) ? (
            <ManagedInput
              label={undefined}
              initialValue={propValue.join('\n')}
              multiline
              onCommit={(committedValue) => {
                handleInputChange((committedValue as string).split('\n'));
              }}
              placeholder="每行一个项目 / One item per line"
              style={{
                ...baseInputStyle,
                minHeight: '60px',
                fontFamily: 'inherit',
                fontSize: '0.95em',
              }}
            />
          ) : (
            <div style={{ ...baseFieldContainerStyle, marginTop: '10px', paddingLeft: '0px' }}>
              <label style={{ ...baseLabelStyle, fontSize: '0.9em' }}>
                编辑整个列表 (JSON格式):
              </label>
              <ManagedInput
                label={undefined}
                initialValue={JSON.stringify(propValue, null, 2)}
                multiline
                onCommit={(committedValue) => {
                  try {
                    handleInputChange(JSON.parse(committedValue as string));
                  } catch (err) {
                    console.warn(`Invalid JSON for ${propKey}:`, err);
                    alert(`无效的JSON格式: ${propKey}\nInvalid JSON for ${propKey}`);
                  }
                }}
                style={{
                  ...baseInputStyle,
                  minHeight: '100px',
                  fontFamily: 'monospace',
                  fontSize: '0.9em',
                }}
              />
            </div>
          )}
        </div>
      );
    }

    // 5. 嵌套对象
    if (typeof propValue === 'object' && propValue !== null) {
      return (
        <div
          key={currentPath}
          style={{
            marginLeft: `${currentIndent}px`,
            borderLeft: depth > 0 ? '2px solid #f0f0f0' : 'none',
            paddingLeft: depth > 0 ? '10px' : '0',
            marginBottom: '10px',
          }}
        >
          {depth > 0 && (
            <strong
              style={{ ...baseLabelStyle, marginTop: '10px', display: 'block', fontSize: '1em' }}
            >
              {getChineseGroupName(propKey)} ({propKey}):
            </strong>
          )}
          {Object.entries(propValue).map(([subKey, subValue]) => (
            <RenderPropertyField
              key={subKey}
              propKey={subKey}
              propValue={subValue}
              currentPath={`${currentPath}.${subKey}`}
              form={form}
              depth={depth + 1}
            />
          ))}
        </div>
      );
    }

    // 6. 基础类型
    // Generic input for simple properties (string, number, boolean)
    return (
      <div
        style={{
          ...baseFieldContainerStyle,
          marginLeft: `${currentIndent}px`,
          paddingLeft: '0px',
        }}
        key={currentPath}
      >
        <ManagedInput
          id={`${currentPath.replace(/\./g, '-')}`}
          label={getChineseGroupName(propKey)}
          type={typeof propValue === 'number' ? 'number' : 'text'}
          initialValue={
            propValue === null || propValue === undefined
              ? ''
              : typeof propValue === 'boolean'
              ? String(propValue)
              : String(propValue)
          }
          onCommit={(committedValue) => {
            let finalValue: string | number | boolean | null = committedValue;
            if (
              typeof propValue === 'number' ||
              (propValue === null &&
                typeof committedValue === 'string' &&
                committedValue.match(/^\d*\.?\d+$/))
            ) {
              if (committedValue === null || String(committedValue).trim() === '') {
                finalValue = null;
              } else {
                const num = parseFloat(String(committedValue));
                finalValue = isNaN(num) ? null : num;
              }
            } else if (typeof propValue === 'boolean') {
              finalValue = String(committedValue).toLowerCase() === 'true';
            } else {
              finalValue = String(committedValue || '');
            }
            handleInputChange(finalValue);
          }}
          placeholder={`${getChineseGroupName(propKey)}`}
        />
      </div>
    );
  };

  console.log(
    `[renderCharacterForm] CHECKING BEFORE RETURN. Name: '${effectiveInitialName}', Age:`,
    effectiveInitialAge,
    `Typeof Age: ${typeof effectiveInitialAge}`
  );

  return (
    <div key={formContentKey} style={{padding: 16, background: '#fff'}}>
      <FormHeader />

      <div style={{ padding: '0 10px', marginBottom: '20px', marginTop: '10px' }}>
        <label
          htmlFor="characterNameInput"
          style={{ ...baseLabelStyle, fontWeight: 'bold', display: 'block', marginBottom: '5px' }}
        >
          {tSafe('characterNode.form.labels.name', {
            ns: 'novelWriter',
            defaultValue: 'Name / 名称',
          })}
        </label>
        <ManagedInput
          id="characterNameInput"
          type="text"
          initialValue={effectiveInitialName}
          onCommit={(value) => {
            form.setValueIn('data.name', value);
            // Sync to characterJSON
            const json = form.getValueIn('data.properties.characterJSON') || {};
            form.setValueIn('data.properties.characterJSON', { ...json, name: value });
            form.setValueIn('outputsValues.jsonDataOut', { ...json, name: value });
          }}
          placeholder={tSafe('characterNode.form.placeholders.name', {
            ns: 'novelWriter',
            defaultValue: '输入角色名称 / Enter character name',
          })}
          style={{ ...baseInputStyle, marginTop: '0px' }}
        />
      </div>

      <div style={{ padding: '0 10px', marginBottom: '20px' }}>
        <label
          htmlFor="characterAgeInput"
          style={{ ...baseLabelStyle, fontWeight: 'bold', display: 'block', marginBottom: '5px' }}
        >
          {tSafe('characterNode.form.labels.age', {
            ns: 'novelWriter',
            defaultValue: 'Age / 年龄',
          })}
        </label>
        <ManagedInput
          id="characterAgeInput"
          type="number"
          initialValue={effectiveInitialAge}
          onCommit={(value) => {
            const ageValue = value === '' ? null : Number(value);
            form.setValueIn('data.age', ageValue);
            // Sync to characterJSON
            const json = form.getValueIn('data.properties.characterJSON') || {};
            form.setValueIn('data.properties.characterJSON', { ...json, age: ageValue });
            form.setValueIn('outputsValues.jsonDataOut', { ...json, age: ageValue });
          }}
          placeholder={tSafe('characterNode.form.placeholders.age', {
            ns: 'novelWriter',
            defaultValue: '输入角色年龄 / Enter character age',
          })}
          style={{ ...baseInputStyle, marginTop: '0px' }}
        />
      </div>

      <div style={{ marginBottom: '20px', padding: '0 10px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          角色文件 / Character File:
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
            浏览 / Browse...
          </button>
          <button
            onClick={handleSave}
            disabled={!displayedFileName}
            style={{ padding: '8px 12px' }}
          >
            保存 / Save
          </button>
          <button onClick={handleExport} style={{ padding: '8px 12px' }}>
            导出 / Export
          </button>
        </div>
        {displayedFileName && (
          <span style={{ fontStyle: 'italic', display: 'block', marginTop: '8px', color: '#555' }}>
            已加载 / Loaded: {displayedFileName}
          </span>
        )}
        {!displayedFileName && (
          <span style={{ fontStyle: 'italic', display: 'block', marginTop: '8px', color: '#777' }}>
            未选择文件 / No file selected
          </span>
        )}
        {form.getValueIn<string>('data.properties.loadError') && (
          <p style={{ color: 'red', marginTop: '8px', fontSize: '0.9em' }}>
            错误 / Error: {form.getValueIn<string>('data.properties.loadError')}
          </p>
        )}
      </div>

      <div style={{ padding: '0 10px', marginBottom: '10px' }}></div>

      <div
        style={{
          padding: '0 10px',
          marginTop: '20px',
          marginBottom: '10px',
          borderTop: '2px solid #ccc',
          paddingTop: '15px',
        }}
      >
        <strong style={{ fontSize: '1.15em' }}>其他主要属性 / Other Main Attributes:</strong>
      </div>

      {Object.entries(getRemainingJson(form.getValueIn('data.properties.characterJSON'))).map(
        ([groupKey, groupData]) => (
          <div
            key={groupKey}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '15px',
              margin: '10px',
              backgroundColor: '#f9f9f9',
            }}
          >
            <h4
              style={{
                marginTop: 0,
                marginBottom: '15px',
                borderBottom: '1px solid #ddd',
                paddingBottom: '10px',
                fontSize: '1.1em',
                color: '#333',
              }}
            >
              {getChineseGroupName(groupKey)}
            </h4>
            <RenderPropertyField
              propKey={groupKey}
              propValue={groupData}
              currentPath={groupKey}
              form={form}
              depth={0}
              // isInsidePersonalityGroup={groupKey === 'personality'} // Removed, as RenderPropertyField logic revised
            />
          </div>
        )
      )}
    </div>
  );
};
