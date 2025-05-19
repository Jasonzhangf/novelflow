import { NodeRenderProps, useNodeRender } from '@flowgram.ai/free-layout-editor';
import React from 'react';
import { NodeWrapper } from '../../components/base-node/node-wrapper';
import { NodeRenderContext } from '../../context';

// Define the expected structure of characterJSON for the canvas view.
interface CharacterDetailsFromTemplate {
  name?: string;
  age?: number | string; // Age is now re-added for canvas display
}

// Define the structure of the 'properties' object within node.data
interface CanvasNodeProperties {
  characterName?: string; // Added to explicitly include characterName
  characterJSON: CharacterDetailsFromTemplate;
  // other properties like characterFilePath might also be here
  // but CharacterNodeCanvas only needs characterJSON for name.
}

// Define the structure of node.data that CharacterNodeCanvas receives
interface CanvasNodeData {
  title?: string; // Optional: if you want to use the node's title
  properties: CanvasNodeProperties;
}

export const CharacterNodeCanvas: React.FC<NodeRenderProps> = ({ node }) => {
  const nodeRender = useNodeRender(); // Use the hook

  // Access data using nodeRender.form.values, which represents node.data
  // Cast to CanvasNodeData for intent, but access will be defensive
  // 使用 nodeRender.form.values 访问数据，它代表 node.data
  // 为了明确意图，类型转换为 CanvasNodeData，但实际访问将采用防御性策略
  const nodeData = nodeRender.form?.values as CanvasNodeData | undefined;

  // console.log('[CharacterNodeCanvas] Full nodeData:', JSON.stringify(nodeData, null, 2));

  const properties = nodeData?.properties;
  const characterNameFromProperties = properties?.characterName;
  const characterJSONFromProperties = properties?.characterJSON;

  // console.log('[CharacterNodeCanvas] properties:', JSON.stringify(properties, null, 2));
  // console.log('[CharacterNodeCanvas] characterNameFromProperties:', characterNameFromProperties);
  // console.log('[CharacterNodeCanvas] characterJSONFromProperties:', JSON.stringify(characterJSONFromProperties, null, 2));

  // Extract name and age from characterJSON, if available
  // 从 characterJSON (如果存在) 中提取姓名和年龄
  const nameFromCharacterJSON = characterJSONFromProperties?.name;
  const ageFromCharacterJSON = characterJSONFromProperties?.age; // Can be string, number, null, or undefined

  // console.log('[CharacterNodeCanvas] nameFromCharacterJSON:', nameFromCharacterJSON);
  // console.log('[CharacterNodeCanvas] ageFromCharacterJSON:', ageFromCharacterJSON, typeof ageFromCharacterJSON);
  // console.log('[CharacterNodeCanvas] nodeData?.title:', nodeData?.title);
  
  // Determine displayName with fallbacks:
  // 1. characterName from properties (node.data.properties.characterName)
  // 2. name from characterJSON within properties (node.data.properties.characterJSON.name)
  // 3. node's title (node.data.title) - logs show this gets populated
  // 4. Default placeholder
  // 确定显示名称的降级策略：
  // 1. 来自 properties 的 characterName (node.data.properties.characterName)
  // 2. 来自 properties 中 characterJSON 的 name (node.data.properties.characterJSON.name)
  // 3. 节点的 title (node.data.title) - 日志显示此字段会被填充
  // 4. 默认占位符
  const displayName = String(
    characterNameFromProperties || 
    nameFromCharacterJSON || 
    nodeData?.title || 
    'Unknown Character / 未知角色'
  );

  // Determine displayAge with fallbacks:
  // 1. age from characterJSON within properties (node.data.properties.characterJSON.age)
  // 2. Default placeholder '??'
  // Ensure age '0' is displayed correctly. Handle null, undefined, and empty strings.
  // 确定显示年龄的降级策略：
  // 1. 来自 properties 中 characterJSON 的 age (node.data.properties.characterJSON.age)
  // 2. 默认占位符 '??'
  // 确保年龄 '0' 正确显示。处理 null、undefined 和空字符串。
  let ageString = '??';
  if (ageFromCharacterJSON !== undefined && ageFromCharacterJSON !== null) {
    const ageValAsString = String(ageFromCharacterJSON).trim();
    // Allow "0" and other numbers, but not an empty string after trimming.
    if (ageValAsString !== '' || ageFromCharacterJSON === 0) { 
      ageString = ageValAsString;
    }
  }
  const displayAge = ageString;

  // console.log(`[CharacterNodeCanvas] Final displayName: '${displayName}', Final displayAge: '${displayAge}'`);

  return (
    <NodeRenderContext.Provider value={nodeRender}>
      <NodeWrapper>
        <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', background: '#f9f9f9', width: '100%', height: '100%', boxSizing: 'border-box' }}>
          <div><strong>{displayName}</strong></div>
          <div>Age / 年龄: {displayAge}</div>
        </div>
      </NodeWrapper>
    </NodeRenderContext.Provider>
  );
}; 