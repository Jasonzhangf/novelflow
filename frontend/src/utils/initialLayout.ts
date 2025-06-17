import { type Node, type Edge } from 'reactflow';

export const getInitialNodes = (): Node[] => [
  // 场景节点（中心）
  {
    id: 'scene-1',
    type: 'scene',
    position: { x: 500, y: 350 },
    data: { 
      label: '场景节点',
      sceneName: '序章',
      sceneData: {}
    },
  },
  // 角色节点（左上）
  {
    id: 'character-1',
    type: 'character',
    position: { x: 200, y: 150 },
    data: {
      label: '角色节点',
    },
  },
  // 环境节点（右上）
  {
    id: 'environment-1',
    type: 'environment',
    position: { x: 800, y: 150 },
    data: {
      label: '环境节点',
    },
  },
  // 系统提示词（左下）
  {
    id: 'systemPrompt-1',
    type: 'systemPrompt',
    position: { x: 200, y: 550 },
    data: {
      label: '系统提示词',
    },
  },
  // 用户提示词（中下）
  {
    id: 'userPrompt-1',
    type: 'userPrompt',
    position: { x: 500, y: 550 },
    data: {
      label: '用户提示词',
    },
  },
  // LLM节点（右下）
  {
    id: 'llm-1',
    type: 'llm',
    position: { x: 800, y: 550 },
    data: {
      label: 'LLM节点',
    },
  },
];

export const getInitialEdges = (): Edge[] => [
  // 角色节点 -> 场景节点
  {
    id: 'character-1-scene-1',
    source: 'character-1',
    target: 'scene-1',
    sourceHandle: 'bottom',
    targetHandle: 'top',
  },
  // 环境节点 -> 场景节点  
  {
    id: 'environment-1-scene-1',
    source: 'environment-1',
    target: 'scene-1',
    sourceHandle: 'bottom',
    targetHandle: 'top',
  },
  // 系统提示词 -> 场景节点
  {
    id: 'systemPrompt-1-scene-1',
    source: 'systemPrompt-1',
    target: 'scene-1',
    sourceHandle: 'bottom',
    targetHandle: 'top',
  },
  // 用户提示词 -> 场景节点
  {
    id: 'userPrompt-1-scene-1',
    source: 'userPrompt-1',
    target: 'scene-1',
    sourceHandle: 'bottom',
    targetHandle: 'top',
  },
  // 场景节点 -> LLM节点
  {
    id: 'scene-1-llm-1',
    source: 'scene-1',
    target: 'llm-1',
    sourceHandle: 'bottom',
    targetHandle: 'top',
  },
];