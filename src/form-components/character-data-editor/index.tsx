import React, { useState, useCallback, memo, useEffect } from 'react';

import { Input, Button, Collapsible, Typography, Tooltip } from '@douyinfe/semi-ui';
import { IconChevronDown, IconChevronRight } from '@douyinfe/semi-icons';

const { Text, Title } = Typography;

interface CharacterDataEditorProps {
  value: Record<string, any>;
  onChange: (newValue: Record<string, any>) => void;
}

const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

const setNestedValue = (
  obj: Record<string, any>,
  path: string[],
  newValue: any
): Record<string, any> => {
  const newObj = deepClone(obj);
  let current = newObj;
  for (let i = 0; i < path.length - 1; i++) {
    if (!current[path[i]] || typeof current[path[i]] !== 'object') {
      current[path[i]] = {};
    }
    current = current[path[i]];
  }
  current[path[path.length - 1]] = newValue;
  return newObj;
};

const MemoizedRenderPropertyValue = memo(function RenderPropertyValue({
  itemKey,
  itemValue,
  itemPath,
  onValueChange,
  isBasicInfo,
}: {
  itemKey: string;
  itemValue: any;
  itemPath: string[];
  onValueChange: (path: string[], newValue: any) => void;
  isBasicInfo?: boolean;
}) {
  // Ensure we have a stable value for state initialization
  const getDisplayValue = useCallback(() => {
    // For objects with Value/Caption structure
    if (itemValue && typeof itemValue === 'object' && 'Value' in itemValue) {
      return String(itemValue.Value ?? '');
    }
    // For direct values
    return String(itemValue ?? '');
  }, [itemValue]);

  const [localEditValue, setLocalEditValue] = useState<string>(getDisplayValue());
  const [isEditing, setIsEditing] = useState(false);

  // Update local state when the itemValue changes (from props)
  useEffect(() => {
    setLocalEditValue(getDisplayValue());
  }, [itemValue, getDisplayValue]);

  const handleInputOnChange = (newValue: string) => {
    setLocalEditValue(newValue);
  };

  const handleSave = useCallback(() => {
    let finalValue: any = localEditValue;

    // Determine if we need to cast to number or boolean based on original type
    if (itemValue && typeof itemValue === 'object' && 'Value' in itemValue) {
      const originalType = typeof itemValue.Value;

      if (originalType === 'number' && !isNaN(Number(localEditValue))) {
        finalValue = Number(localEditValue);
      } else if (originalType === 'boolean') {
        if (localEditValue.toLowerCase() === 'true') finalValue = true;
        else if (localEditValue.toLowerCase() === 'false') finalValue = false;
      }

      // Update the Value property in the object
      onValueChange(itemPath, { ...itemValue, Value: finalValue });
    } else {
      // Handle direct values (strings, numbers, etc.)
      const originalType = typeof itemValue;

      if (originalType === 'number' && !isNaN(Number(localEditValue))) {
        finalValue = Number(localEditValue);
      } else if (originalType === 'boolean') {
        if (localEditValue.toLowerCase() === 'true') finalValue = true;
        else if (localEditValue.toLowerCase() === 'false') finalValue = false;
      }

      onValueChange(itemPath, finalValue);
    }

    setIsEditing(false);
  }, [localEditValue, itemValue, itemPath, onValueChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        setLocalEditValue(getDisplayValue());
        setIsEditing(false);
      }
    },
    [handleSave, getDisplayValue]
  );

  // Determine display values
  const displayKey =
    itemValue && typeof itemValue === 'object' && 'Caption' in itemValue
      ? itemValue.Caption
      : itemKey;

  const displayValue = getDisplayValue();

  const valueStyle: React.CSSProperties = {
    flexGrow: 1,
    cursor: 'pointer',
    whiteSpace: 'pre-wrap',
    padding: '5px',
    borderRadius: '3px',
  };

  const hoverStyle: React.CSSProperties = {
    backgroundColor: '#f0f0f0',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '5px',
        paddingLeft: isBasicInfo ? '0px' : '10px',
      }}
    >
      <Text
        strong
        style={{
          minWidth: '150px',
          maxWidth: '200px',
          marginRight: '10px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <Tooltip content={displayKey} position="leftTop" mouseEnterDelay={0.5}>
          {displayKey}:
        </Tooltip>
      </Text>
      {isEditing ? (
        <>
          <Input
            value={localEditValue}
            onChange={handleInputOnChange}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            style={{ flexGrow: 1, marginRight: '5px' }}
            autoFocus
          />
          <Button onClick={handleSave} size="small" style={{ marginRight: '5px' }}>
            保存 / Save
          </Button>
          <Button
            onClick={() => {
              setLocalEditValue(getDisplayValue());
              setIsEditing(false);
            }}
            size="small"
            type="tertiary"
          >
            取消 / Cancel
          </Button>
        </>
      ) : (
        <Text
          onClick={() => setIsEditing(true)}
          style={valueStyle}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = hoverStyle.backgroundColor!)
          }
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {displayValue || (
            <span style={{ fontStyle: 'italic', color: '#999' }}>未设置 / Not set</span>
          )}
        </Text>
      )}
    </div>
  );
});

const MemoizedRenderObjectRecursive = memo(function RenderObjectRecursive({
  obj,
  currentPath,
  onValueChange,
  groupKey,
  defaultOpen = false,
}: {
  obj: Record<string, any>;
  currentPath: string[];
  onValueChange: (path: string[], newValue: any) => void;
  groupKey: string;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Safely get child entries, handling empty/null objects
  const safeObj = obj || {};
  const childEntries = Object.entries(safeObj).filter(([key]) => !key.startsWith('_'));

  const hasContent = childEntries.length > 0;

  const header = (
    <div
      onClick={() => setIsOpen(!isOpen)}
      style={{ padding: '8px 0', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
    >
      {isOpen ? (
        <IconChevronDown style={{ marginRight: '8px' }} />
      ) : (
        <IconChevronRight style={{ marginRight: '8px' }} />
      )}
      <Title heading={5} style={{ margin: 0 }}>
        {groupKey}
      </Title>
    </div>
  );

  return (
    <Collapsible isOpen={isOpen}>
      {header}
      {isOpen && (
        <div style={{ paddingLeft: '20px' }}>
          {!hasContent && (
            <Text type="secondary" style={{ display: 'block', marginBottom: '10px' }}>
              (Empty section / 空的部分)
            </Text>
          )}
          {childEntries.map(([key, val]) => {
            const newPathToChild = [...currentPath, key];

            // Handle nested objects (but not Value/Caption objects)
            if (
              val &&
              typeof val === 'object' &&
              !('Value' in val && 'Caption' in val) &&
              !(val instanceof Array)
            ) {
              return (
                <MemoizedRenderObjectRecursive
                  key={`${groupKey}-${key}`} // Improved key to prevent reordering issues
                  groupKey={key}
                  obj={val}
                  currentPath={newPathToChild}
                  onValueChange={onValueChange}
                />
              );
            }
            // Handle arrays
            else if (val instanceof Array) {
              return (
                <div
                  key={`${groupKey}-${key}-array`}
                  style={{ marginBottom: '5px', paddingLeft: '10px' }}
                >
                  <Text strong>{key}: </Text>
                  {!val || val.length === 0 ? (
                    <Text type="secondary" style={{ marginLeft: '10px' }}>
                      (Empty / 空)
                    </Text>
                  ) : (
                    <pre
                      style={{
                        fontSize: '0.9em',
                        backgroundColor: '#f8f8f8',
                        padding: '10px',
                        borderRadius: '4px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                      }}
                    >
                      {JSON.stringify(val, null, 2)}
                    </pre>
                  )}
                </div>
              );
            }
            // Handle leaf properties (including Value/Caption objects)
            return (
              <MemoizedRenderPropertyValue
                key={`${groupKey}-${key}-prop`} // Improved key to prevent reordering issues
                itemKey={key}
                itemValue={val}
                itemPath={newPathToChild}
                onValueChange={onValueChange}
              />
            );
          })}
        </div>
      )}
    </Collapsible>
  );
});

export const CharacterDataEditor: React.FC<CharacterDataEditorProps> = ({ value, onChange }) => {
  const handleValueChange = useCallback(
    (path: string[], newValue: any) => {
      const updatedValue = setNestedValue(value, path, newValue);
      onChange(updatedValue);
    },
    [value, onChange]
  );

  // Order of keys as they appear in the original JSON for consistent display
  const orderedKeys = ['name', 'age', 'background', 'personality', 'relationships', 'language'];

  // If value is empty or undefined, initialize with a default structure
  const dataToRender = value || {};

  // Using orderedKeys to maintain consistent order when rendering
  // and add any additional keys from dataToRender that aren't in orderedKeys
  const keysToRender = [...orderedKeys];
  Object.keys(dataToRender).forEach((key) => {
    if (!keysToRender.includes(key)) {
      keysToRender.push(key);
    }
  });

  // If completely empty, display a message
  if (Object.keys(dataToRender).length === 0) {
    return (
      <div style={{ padding: '10px', textAlign: 'center' }}>
        <Text type="secondary">No character data structure available. / 无角色数据结构可用。</Text>
        <br />
        <Text type="secondary">
          Please import a character file or add data manually. / 请导入角色文件或手动添加数据。
        </Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px' }}>
      {keysToRender.map((topKey) => {
        const topVal = dataToRender[topKey];
        const isBasicInfoKey = ['name', 'age', 'language'].includes(topKey);

        // For empty sections, still display the section label with an appropriate empty state
        if (!topVal && !isBasicInfoKey) {
          return (
            <div key={`empty-${topKey}`} style={{ marginBottom: '15px' }}>
              <Title heading={5} style={{ margin: '8px 0' }}>
                {topKey}
              </Title>
              <Text type="secondary" style={{ paddingLeft: '20px' }}>
                (Empty section / 空的部分)
              </Text>
            </div>
          );
        }

        // For complex objects (nested structure)
        if (
          typeof topVal === 'object' &&
          topVal !== null &&
          !(topVal instanceof Array) &&
          !('Value' in topVal && 'Caption' in topVal)
        ) {
          return (
            <MemoizedRenderObjectRecursive
              key={`group-${topKey}`}
              groupKey={topKey}
              obj={topVal}
              currentPath={[topKey]}
              onValueChange={handleValueChange}
              defaultOpen={topKey === 'background' || topKey === 'personality'}
            />
          );
        } else if (topVal instanceof Array) {
          // For arrays
          return (
            <div key={`array-${topKey}`} style={{ marginTop: '10px', marginBottom: '15px' }}>
              <Title heading={5} style={{ margin: '8px 0' }}>
                {topKey}
              </Title>
              {!topVal || topVal.length === 0 ? (
                <Text type="secondary" style={{ marginLeft: '20px' }}>
                  (Empty / 空)
                </Text>
              ) : (
                <pre
                  style={{
                    fontSize: '0.9em',
                    backgroundColor: '#f8f8f8',
                    padding: '10px',
                    borderRadius: '4px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    marginLeft: '20px',
                  }}
                >
                  {JSON.stringify(topVal, null, 2)}
                </pre>
              )}
              {topKey === 'relationships' && (
                <Button
                  size="small"
                  style={{ marginTop: '5px', marginLeft: '20px' }}
                  onClick={() => console.log('TODO: Add to', topKey)}
                >
                  + Add {topKey} / 添加{topKey}
                </Button>
              )}
            </div>
          );
        } else {
          // For basic properties (name, age, etc.)
          // Even if value is undefined/null, still render the field for editing
          return (
            <MemoizedRenderPropertyValue
              key={`prop-${topKey}`}
              itemKey={topKey}
              itemValue={topVal !== undefined ? topVal : ''}
              itemPath={[topKey]}
              onValueChange={handleValueChange}
              isBasicInfo={isBasicInfoKey}
            />
          );
        }
      })}
    </div>
  );
};
