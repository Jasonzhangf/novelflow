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
  // 文本输出节点（LLM节点下方）
  {
    id: 'text-output-1',
    type: 'textOutput',
    position: { x: 800, y: 750 },
    data: {
      label: '文本输出',
      title: '文本输出',
      content: '',
    },
  },
  // 世界设定节点（左上角）
  {
    id: 'world-1',
    type: 'world',
    position: { x: 50, y: 50 },
    data: {
      label: '世界设定',
      worldName: '',
      worldData: {}
    },
  },
  // 人物关系节点（独立位置）
  {
    id: 'relationship-1',
    type: 'relationship',
    position: { x: 1100, y: 350 },
    data: {
      label: '人物关系',
      relationshipData: {},
      connectedCharacters: []
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
  // 系统提示词 -> LLM节点
  {
    id: 'systemPrompt-1-llm-1',
    source: 'systemPrompt-1',
    target: 'llm-1',
    sourceHandle: 'bottom',
    targetHandle: 'top',
  },
  // 用户提示词 -> LLM节点
  {
    id: 'userPrompt-1-llm-1',
    source: 'userPrompt-1',
    target: 'llm-1',
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
  // LLM节点 -> 文本输出节点
  {
    id: 'llm-1-text-output-1',
    source: 'llm-1',
    target: 'text-output-1',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    animated: true,
  },
  // 世界设定 -> 场景节点
  {
    id: 'world-1-scene-1',
    source: 'world-1',
    target: 'scene-1',
    sourceHandle: 'bottom',
    targetHandle: 'top',
  },
];