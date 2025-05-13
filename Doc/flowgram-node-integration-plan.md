# Flowgram节点集成方案 (Flowgram Node Integration Plan)

## 1. 节点系统概述 (Node System Overview)

基于对Flowgram节点系统和小说生成器需求的分析，我们设计了一套完整的节点集成方案。该方案包含16种专用节点类型，分为四大类，用于构建灵活且功能丰富的小说生成流程。

### 1.1 节点分类 (Node Categories)

```
┌───────────────────────────────────────────────────────────────────┐
│ 基础控制节点 (Basic Control Nodes)                                  │
│ - 开始节点 (Start Node)        - 条件节点 (Condition Node)         │
│ - 输出节点 (Output Node)       - 循环节点 (Loop Node)              │
├───────────────────────────────────────────────────────────────────┤
│ 数据处理节点 (Data Processing Nodes)                                │
│ - 人物节点 (Character Node)    - 场景节点 (Scene Node)             │
│ - 性格节点 (Personality Node)  - JSON导入节点 (JSON Import Node)    │
│ - JSON导出节点 (JSON Export Node)                                 │
├───────────────────────────────────────────────────────────────────┤
│ 记忆管理节点 (Memory Management Nodes)                              │
│ - 短期记忆节点 (Short-term Memory Node)                            │
│ - 长期记忆节点 (Long-term Memory Node)                             │
│ - 记忆检索节点 (Memory Retrieval Node)                             │
├───────────────────────────────────────────────────────────────────┤
│ LLM交互节点 (LLM Interaction Nodes)                               │
│ - LLM配置节点 (LLM Config Node)                                   │
│ - LLM执行节点 (LLM Execution Node)                                │
│ - 提示词模板节点 (Prompt Template Node)                            │
│ - 提示词组合节点 (Prompt Composition Node)                         │
└───────────────────────────────────────────────────────────────────┘
```

## 2. 节点数据结构 (Node Data Structures)

### 2.1 基础节点结构 (Basic Node Structure)

所有节点类型共享以下基础结构，符合Flowgram的WorkflowNodeJSON格式：

```typescript
interface NovelGenNodeJSON {
  id: string;                 // 节点唯一标识
  type: string;               // 节点类型标识
  position: {                 // 节点在画布上的位置
    x: number;
    y: number;
  };
  size: {                     // 节点大小
    width: number;
    height: number;
  };
  data: any;                  // 节点特定数据(各节点类型不同)
  ports?: {                   // 节点端口定义
    inputs: Array<{
      id: string;
      label?: string;
      type?: string;
    }>;
    outputs: Array<{
      id: string;
      label?: string;
      type?: string;
    }>;
  };
  style?: Record<string, any>; // 节点样式
  parentId?: string;          // 父节点ID(用于分组/嵌套)
}
```

### 2.2 特定节点数据结构 (Specific Node Data Structures)

以下是各类节点的特定数据结构定义：

#### 2.2.1 基础控制节点 (Basic Control Nodes)

**开始节点 (Start Node)**
```typescript
interface StartNodeData {
  label: string;
  projectInfo: {
    name: string;
    description: string;
    version: string;
    language: string;
  };
  globalSettings: {
    llmProvider: 'gemini' | 'ollama';
    apiKey?: string;
    defaultModel: string;
    defaultParams: Record<string, any>;
  };
}
```

**输出节点 (Output Node)**
```typescript
interface OutputNodeData {
  label: string;
  outputType: 'text' | 'json' | 'file';
  outputFormat: string;
  outputPath?: string;
  lastOutput: string | null;
  autoSave: boolean;
}
```

**条件节点 (Condition Node)**
```typescript
interface ConditionNodeData {
  label: string;
  condition: string;
  customLogic?: string;
  lastEvaluation: boolean | null;
  defaultPath: 'true' | 'false';
}
```

**循环节点 (Loop Node)**
```typescript
interface LoopNodeData {
  label: string;
  loopType: 'count' | 'condition' | 'collection';
  count?: number;
  condition?: string;
  collection?: string;
  currentIteration: number;
  maxIterations: number;
  iterationVariable: string;
}
```

#### 2.2.2 数据处理节点 (Data Processing Nodes)

**人物节点 (Character Node)**
```typescript
interface CharacterNodeData {
  label: string;
  character: {
    name: string;
    age: number;
    background: {
      origin: string;
      occupation: string;
      history: string;
    };
    language: string;
  } | null;
  showDetails: boolean;
  characterId?: string;
}
```

**性格节点 (Personality Node)**
```typescript
interface PersonalityNodeData {
  label: string;
  characterId?: string;
  personality: {
    CoreTemperament?: Record<string, PersonalityTrait>;
    InternalValues?: Record<string, PersonalityTrait>;
    ThinkingStyle?: Record<string, PersonalityTrait>;
    InternalMotivation?: Record<string, PersonalityTrait>;
    SelfPerception?: Record<string, PersonalityTrait>;
  } | null;
  activeCategory: string;
}

interface PersonalityTrait {
  Value: number;
  Caption: string;
}
```

**场景节点 (Scene Node)**
```typescript
interface SceneNodeData {
  label: string;
  scene: {
    id: string;
    name: string;
    location: {
      name: string;
      description: string;
    };
    time: {
      period: string;
      season: string;
      weather: string;
    };
    ambience: {
      mood: string;
      sights: string[];
      sounds: string[];
      smells: string[];
    };
    characters: string[];
    objects: string[];
  } | null;
  showDetails: boolean;
}
```

**JSON导入节点 (JSON Import Node)**
```typescript
interface JSONImportNodeData {
  label: string;
  targetType: 'character' | 'scene' | 'memory' | 'prompt';
  jsonContent: string | null;
  source: 'text' | 'file';
  filePath?: string;
  parseError: string | null;
  importedData: any | null;
}
```

**JSON导出节点 (JSON Export Node)**
```typescript
interface JSONExportNodeData {
  label: string;
  sourceType: 'character' | 'scene' | 'memory' | 'prompt';
  prettyPrint: boolean;
  destination: 'text' | 'file';
  filePath?: string;
  exportedJSON: string | null;
  lastExportTime: string | null;
}
```

#### 2.2.3 记忆管理节点 (Memory Management Nodes)

**短期记忆节点 (Short-term Memory Node)**
```typescript
interface ShortTermMemoryNodeData {
  label: string;
  characterId?: string;
  memories: Array<{
    id: string;
    timestamp: string;
    content: string;
    entities: Array<{
      name: string;
      type: string;
      relationship: string;
      sentiment: number;
    }>;
    eventType: string;
    eventOutcome: string;
    emotionalImpact: number;
    importance: number;
    location: string;
    personalReaction: string;
  }>;
  filter: {
    timeRange: [string, string] | null;
    entities: string[];
    importanceMin: number;
    emotionalImpactMin: number;
    eventTypes: string[];
  };
}
```

**长期记忆节点 (Long-term Memory Node)**
```typescript
interface LongTermMemoryNodeData {
  label: string;
  characterId?: string;
  memories: Array<{
    id: string;
    period: {
      start: string;
      end: string;
    };
    summary: string;
    keyEntities: Array<{
      id: string;
      name: string;
      significance: string;
      sentiment: number;
    }>;
    emotionalSignificance: string;
    lessonLearned: string;
    sourceMemories: string[];
    importance: number;
    emotionalImpact: number;
  }>;
  compressionRules: {
    timeThreshold: number;
    countThreshold: number;
    importanceThreshold: number;
  };
  isProcessing: boolean;
}
```

**记忆检索节点 (Memory Retrieval Node)**
```typescript
interface MemoryRetrievalNodeData {
  label: string;
  characterId?: string;
  context: {
    time?: string;
    location?: string;
    characters?: string[];
    topics?: string[];
    recentEvents?: string[];
    query?: string;
  };
  retrievalParams: {
    maxResults: number;
    minRelevance: number;
    includeShortTerm: boolean;
    includeLongTerm: boolean;
  };
  retrievedMemories: Array<{
    memory: any;
    relevanceScore: number;
  }> | null;
  isProcessing: boolean;
}
```

#### 2.2.4 LLM交互节点 (LLM Interaction Nodes)

**LLM配置节点 (LLM Config Node)**
```typescript
interface LLMConfigNodeData {
  label: string;
  provider: 'gemini' | 'ollama';
  apiKey?: string;
  model: string;
  parameters: {
    temperature: number;
    maxTokens: number;
    topP: number;
    presencePenalty: number;
    frequencyPenalty: number;
  };
  rateLimit: {
    maxRequestsPerMinute: number;
    enabled: boolean;
  };
}
```

**LLM执行节点 (LLM Execution Node)**
```typescript
interface LLMExecutionNodeData {
  label: string;
  systemPrompt: string;
  contextStrategy: 'append' | 'summarize' | 'selective';
  retryStrategy: {
    maxRetries: number;
    delayMs: number;
    enabled: boolean;
  };
  lastResponse: string | null;
  history: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  isProcessing: boolean;
  error: string | null;
}
```

**提示词模板节点 (Prompt Template Node)**
```typescript
interface PromptTemplateNodeData {
  label: string;
  template: {
    id: string;
    name: string;
    description: string;
    template: string;
    variables: Array<{
      name: string;
      description: string;
      defaultValue: string;
    }>;
    category: string;
    language: string;
  } | null;
  variables: Record<string, string>;
  showPreview: boolean;
  compiledPrompt: string | null;
}
```

**提示词组合节点 (Prompt Composition Node)**
```typescript
interface PromptCompositionNodeData {
  label: string;
  sections: Array<{
    id: string;
    name: string;
    content: string;
    enabled: boolean;
    order: number;
    sourceNodeId?: string;
  }>;
  separator: string;
  maxLength: number;
  currentLength: number;
  finalPrompt: string | null;
}
```

## 3. 节点端口设计 (Node Port Design)

以下定义了各节点的输入和输出端口，以及它们之间的连接规则。

### 3.1 基础控制节点端口 (Basic Control Node Ports)

```typescript
// 开始节点端口
const startNodePorts = {
  outputs: [
    { id: 'flow', label: '流程', type: 'flow' },
    { id: 'settings', label: '设置', type: 'settings' }
  ]
};

// 输出节点端口
const outputNodePorts = {
  inputs: [
    { id: 'flow', label: '流程', type: 'flow' },
    { id: 'content', label: '内容', type: 'content' }
  ]
};

// 条件节点端口
const conditionNodePorts = {
  inputs: [
    { id: 'flow', label: '流程', type: 'flow' },
    { id: 'condition', label: '条件', type: 'any' }
  ],
  outputs: [
    { id: 'true', label: '是', type: 'flow' },
    { id: 'false', label: '否', type: 'flow' }
  ]
};

// 循环节点端口
const loopNodePorts = {
  inputs: [
    { id: 'flow', label: '流程', type: 'flow' },
    { id: 'collection', label: '集合', type: 'any' }
  ],
  outputs: [
    { id: 'iteration', label: '循环体', type: 'flow' },
    { id: 'completed', label: '完成', type: 'flow' },
    { id: 'current', label: '当前项', type: 'any' }
  ]
};
```

### 3.2 数据处理节点端口 (Data Processing Node Ports)

```typescript
// 人物节点端口
const characterNodePorts = {
  inputs: [
    { id: 'import', label: '导入', type: 'character' }
  ],
  outputs: [
    { id: 'character', label: '人物', type: 'character' }
  ]
};

// 性格节点端口
const personalityNodePorts = {
  inputs: [
    { id: 'character', label: '人物', type: 'character' },
    { id: 'import', label: '导入', type: 'personality' }
  ],
  outputs: [
    { id: 'personality', label: '性格', type: 'personality' },
    { id: 'enhanced-character', label: '增强人物', type: 'character' }
  ]
};

// 场景节点端口
const sceneNodePorts = {
  inputs: [
    { id: 'import', label: '导入', type: 'scene' }
  ],
  outputs: [
    { id: 'scene', label: '场景', type: 'scene' }
  ]
};

// JSON导入节点端口
const jsonImportNodePorts = {
  outputs: [
    { id: 'data', label: '数据', type: 'any' },
    { id: 'error', label: '错误', type: 'error' }
  ]
};

// JSON导出节点端口
const jsonExportNodePorts = {
  inputs: [
    { id: 'data', label: '数据', type: 'any' }
  ],
  outputs: [
    { id: 'result', label: '结果', type: 'boolean' },
    { id: 'error', label: '错误', type: 'error' }
  ]
};
```

### 3.3 记忆管理节点端口 (Memory Management Node Ports)

```typescript
// 短期记忆节点端口
const shortTermMemoryNodePorts = {
  inputs: [
    { id: 'character', label: '人物', type: 'character' },
    { id: 'new-memory', label: '新记忆', type: 'memory-item' }
  ],
  outputs: [
    { id: 'memories', label: '记忆集', type: 'memory-array' },
    { id: 'filtered', label: '过滤后', type: 'memory-array' }
  ]
};

// 长期记忆节点端口
const longTermMemoryNodePorts = {
  inputs: [
    { id: 'character', label: '人物', type: 'character' },
    { id: 'short-term', label: '短期记忆', type: 'memory-array' }
  ],
  outputs: [
    { id: 'long-term', label: '长期记忆', type: 'memory-array' }
  ]
};

// 记忆检索节点端口
const memoryRetrievalNodePorts = {
  inputs: [
    { id: 'character', label: '人物', type: 'character' },
    { id: 'short-term', label: '短期记忆', type: 'memory-array' },
    { id: 'long-term', label: '长期记忆', type: 'memory-array' },
    { id: 'context', label: '上下文', type: 'context' }
  ],
  outputs: [
    { id: 'relevant', label: '相关记忆', type: 'memory-array' }
  ]
};
```

### 3.4 LLM交互节点端口 (LLM Interaction Node Ports)

```typescript
// LLM配置节点端口
const llmConfigNodePorts = {
  outputs: [
    { id: 'config', label: '配置', type: 'llm-config' }
  ]
};

// LLM执行节点端口
const llmExecutionNodePorts = {
  inputs: [
    { id: 'config', label: 'LLM配置', type: 'llm-config' },
    { id: 'prompt', label: '提示词', type: 'prompt' },
    { id: 'context', label: '上下文', type: 'any' }
  ],
  outputs: [
    { id: 'response', label: '响应', type: 'string' },
    { id: 'error', label: '错误', type: 'error' }
  ]
};

// 提示词模板节点端口
const promptTemplateNodePorts = {
  inputs: [
    { id: 'variables', label: '变量', type: 'object' }
  ],
  outputs: [
    { id: 'prompt', label: '提示词', type: 'prompt' }
  ]
};

// 提示词组合节点端口
const promptCompositionNodePorts = {
  inputs: [
    { id: 'section1', label: '部分1', type: 'string' },
    { id: 'section2', label: '部分2', type: 'string' },
    { id: 'section3', label: '部分3', type: 'string' },
    { id: 'character', label: '人物', type: 'character' },
    { id: 'memory', label: '记忆', type: 'memory-array' },
    { id: 'scene', label: '场景', type: 'scene' }
  ],
  outputs: [
    { id: 'prompt', label: '组合提示词', type: 'prompt' }
  ]
};
```

## 4. 节点注册与渲染 (Node Registration and Rendering)

### 4.1 节点注册流程 (Node Registration Process)

```typescript
/**
 * 注册所有小说生成器节点类型
 */
function registerNovelGenNodes(registry) {
  // 基础控制节点
  registerStartNode(registry);
  registerOutputNode(registry);
  registerConditionNode(registry);
  registerLoopNode(registry);
  
  // 数据处理节点
  registerCharacterNode(registry);
  registerPersonalityNode(registry);
  registerSceneNode(registry);
  registerJSONImportNode(registry);
  registerJSONExportNode(registry);
  
  // 记忆管理节点
  registerShortTermMemoryNode(registry);
  registerLongTermMemoryNode(registry);
  registerMemoryRetrievalNode(registry);
  
  // LLM交互节点
  registerLLMConfigNode(registry);
  registerLLMExecutionNode(registry);
  registerPromptTemplateNode(registry);
  registerPromptCompositionNode(registry);
}

/**
 * 示例节点注册函数 - 人物节点
 */
function registerCharacterNode(registry) {
  registry.registerNode({
    type: 'character',
    label: '人物节点 | Character Node',
    category: 'character',
    defaults: {
      width: 200,
      height: 150,
      data: {
        label: '人物节点',
        character: null,
        showDetails: false
      }
    },
    ports: characterNodePorts,
    renderer: CharacterNodeRenderer,
    propertyPanel: CharacterPropertyPanel
  });
}
```

### 4.2 节点渲染组件 (Node Rendering Components)

每种节点类型需要实现自定义渲染组件，以下是示例代码结构：

```jsx
/**
 * 人物节点渲染组件
 */
const CharacterNodeRenderer = (props) => {
  const { node, selected } = props;
  const { character, showDetails } = node.data;

  return (
    <div className={`character-node ${selected ? 'selected' : ''}`}>
      <div className="node-header">
        <div className="node-icon">👤</div>
        <div className="node-title">{character?.name || '新建人物'}</div>
        <div className="node-actions">
          <button onClick={() => toggleDetails(node.id)}>
            {showDetails ? '收起' : '展开'}
          </button>
          <button onClick={() => importCharacter(node.id)}>导入</button>
          <button onClick={() => exportCharacter(node.id)}>导出</button>
        </div>
      </div>
      
      {showDetails && character && (
        <div className="node-details">
          <div className="detail-item">
            <span className="detail-label">姓名:</span>
            <span className="detail-value">{character.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">年龄:</span>
            <span className="detail-value">{character.age}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">职业:</span>
            <span className="detail-value">{character.background.occupation}</span>
          </div>
        </div>
      )}
      
      <div className="node-ports">
        <div className="input-ports">
          {/* 渲染输入端口 */}
        </div>
        <div className="output-ports">
          {/* 渲染输出端口 */}
        </div>
      </div>
    </div>
  );
};
```

## 5. 节点交互与数据流 (Node Interaction and Data Flow)

### 5.1 节点数据更新 (Node Data Update)

```typescript
/**
 * 更新节点数据
 * @param nodeId 节点ID
 * @param updates 数据更新
 */
function updateNodeData(nodeId, updates) {
  // 获取当前节点
  const node = document.getNode(nodeId);
  if (!node) return;
  
  // 应用更新
  const updatedData = {
    ...node.data,
    ...updates
  };
  
  // 更新节点
  document.updateNode(nodeId, { data: updatedData });
  
  // 触发数据流更新
  propagateDataChange(nodeId);
}
```

### 5.2 数据流传递 (Data Flow Propagation)

```typescript
/**
 * 传播数据变更到下游节点
 * @param sourceNodeId 源节点ID
 */
function propagateDataChange(sourceNodeId) {
  // 获取源节点
  const sourceNode = document.getNode(sourceNodeId);
  if (!sourceNode) return;
  
  // 获取所有连接
  const connections = document.getConnections();
  
  // 找到以源节点为起点的所有连接
  const outgoingConnections = connections.filter(
    conn => conn.source === sourceNodeId
  );
  
  // 处理每个下游节点
  for (const conn of outgoingConnections) {
    const targetNodeId = conn.target;
    const sourcePortId = conn.sourceHandle;
    const targetPortId = conn.targetHandle;
    
    // 获取源节点输出数据
    const outputData = getNodeOutputData(sourceNodeId, sourcePortId);
    
    // 将数据传递给目标节点
    handleNodeInputData(targetNodeId, targetPortId, outputData);
  }
}

/**
 * 获取节点输出数据
 * @param nodeId 节点ID
 * @param portId 输出端口ID
 */
function getNodeOutputData(nodeId, portId) {
  const node = document.getNode(nodeId);
  if (!node) return null;
  
  // 根据节点类型和端口获取相应数据
  switch (node.type) {
    case 'character':
      if (portId === 'character') {
        return { character: node.data.character };
      }
      break;
    
    case 'short-term-memory':
      if (portId === 'memories') {
        return { memories: node.data.memories };
      } else if (portId === 'filtered') {
        return { memories: filterMemories(node.data.memories, node.data.filter) };
      }
      break;
    
    // 其他节点类型...
  }
  
  return null;
}

/**
 * 处理节点输入数据
 * @param nodeId 节点ID
 * @param portId 输入端口ID
 * @param data 输入数据
 */
function handleNodeInputData(nodeId, portId, data) {
  if (!data) return;
  
  const node = document.getNode(nodeId);
  if (!node) return;
  
  // 根据节点类型和端口处理输入数据
  switch (node.type) {
    case 'short-term-memory':
      if (portId === 'character' && data.character) {
        updateNodeData(nodeId, { characterId: data.character.id });
        loadMemoriesForCharacter(data.character.id, nodeId);
      } else if (portId === 'new-memory' && data.memory) {
        addMemoryToNode(nodeId, data.memory);
      }
      break;
    
    case 'llm-execution':
      if (portId === 'prompt' && data.prompt) {
        // 存储提示词以便执行
        updateNodeData(nodeId, { 
          pendingPrompt: data.prompt 
        });
      } else if (portId === 'config' && data.config) {
        // 更新LLM配置
        updateNodeData(nodeId, { 
          llmConfig: data.config 
        });
      }
      // 检查是否可以执行LLM调用
      checkAndExecuteLLM(nodeId);
      break;
    
    // 其他节点类型...
  }
}
```

## 6. 使用示例 (Usage Examples)

### 6.1 小说情节生成流程 (Novel Plot Generation Workflow)

```typescript
// 示例工作流JSON
const plotGenerationWorkflow = {
  nodes: [
    {
      id: 'start-1',
      type: 'start',
      position: { x: 100, y: 100 },
      data: {
        label: '开始',
        projectInfo: {
          name: '武侠小说生成器',
          description: '生成古风武侠小说情节',
          version: '1.0',
          language: 'zh'
        },
        globalSettings: {
          llmProvider: 'gemini',
          defaultModel: 'gemini-pro',
          defaultParams: { temperature: 0.7 }
        }
      }
    },
    {
      id: 'character-1',
      type: 'character',
      position: { x: 100, y: 300 },
      data: {
        label: '主角',
        character: {
          name: '李观一',
          age: 13,
          background: {
            origin: '陈国关翼城',
            occupation: '药师学徒',
            history: '婴儿时遭遇追杀幸存，身怀神秘青铜鼎压制奇毒...'
          },
          language: 'chinese'
        },
        showDetails: true
      }
    },
    {
      id: 'personality-1',
      type: 'personality',
      position: { x: 400, y: 300 },
      data: {
        label: '主角性格',
        characterId: 'character-1',
        personality: {
          // 性格属性...
        },
        activeCategory: 'CoreTemperament'
      }
    },
    {
      id: 'short-term-memory-1',
      type: 'short-term-memory',
      position: { x: 700, y: 300 },
      data: {
        label: '主角记忆',
        characterId: 'character-1',
        memories: [
          // 记忆数据...
        ],
        filter: {
          importanceMin: 5
        }
      }
    },
    {
      id: 'scene-1',
      type: 'scene',
      position: { x: 100, y: 500 },
      data: {
        label: '当前场景',
        scene: {
          id: 'scene-001',
          name: '药铺初遇',
          location: {
            name: '回春堂药铺',
            description: '一家位于关翼城中心的老字号药铺，药香四溢...'
          },
          time: {
            period: '黄昏',
            season: '初夏',
            weather: '晴朗'
          },
          ambience: {
            mood: '平静而神秘',
            sights: ['药柜', '药炉', '晒药架'],
            sounds: ['熬药声', '顾客交谈声'],
            smells: ['草药香', '檀香']
          },
          characters: ['李观一', '陈老大夫', '神秘客人'],
          objects: ['青铜鼎', '古方药书', '奇异药材']
        },
        showDetails: true
      }
    },
    {
      id: 'prompt-template-1',
      type: 'prompt-template',
      position: { x: 400, y: 500 },
      data: {
        label: '情节提示词',
        template: {
          id: 'template-001',
          name: '武侠情节生成',
          description: '生成下一段武侠小说情节',
          template: '你是一位擅长武侠小说创作的作家。请基于以下信息，生成一段精彩的武侠小说情节描写，长度约500字。\n\n角色：{{character}}\n\n角色性格：{{personality}}\n\n场景：{{scene}}\n\n角色记忆：{{memories}}\n\n要求：\n1. 符合古风武侠风格\n2. 情节要有矛盾冲突\n3. 展现角色性格特点\n4. 为下文埋下伏笔',
          variables: [
            { name: 'character', description: '角色信息', defaultValue: '' },
            { name: 'personality', description: '性格特点', defaultValue: '' },
            { name: 'scene', description: '场景描述', defaultValue: '' },
            { name: 'memories', description: '相关记忆', defaultValue: '' }
          ],
          category: '情节',
          language: 'zh'
        },
        variables: {},
        showPreview: true
      }
    },
    {
      id: 'llm-config-1',
      type: 'llm-config',
      position: { x: 100, y: 700 },
      data: {
        label: 'Gemini配置',
        provider: 'gemini',
        model: 'gemini-pro',
        parameters: {
          temperature: 0.8,
          maxTokens: 2048,
          topP: 0.9,
          presencePenalty: 0.6,
          frequencyPenalty: 0.5
        }
      }
    },
    {
      id: 'llm-execution-1',
      type: 'llm-execution',
      position: { x: 400, y: 700 },
      data: {
        label: '生成情节',
        systemPrompt: '你是一位擅长武侠小说创作的作家，尤其擅长古风武侠风格。',
        contextStrategy: 'append',
        isProcessing: false
      }
    },
    {
      id: 'output-1',
      type: 'output',
      position: { x: 700, y: 700 },
      data: {
        label: '小说输出',
        outputType: 'text',
        outputFormat: 'markdown',
        autoSave: true
      }
    }
  ],
  edges: [
    { id: 'edge-1-2', source: 'character-1', target: 'personality-1', sourceHandle: 'character', targetHandle: 'character' },
    { id: 'edge-1-3', source: 'character-1', target: 'short-term-memory-1', sourceHandle: 'character', targetHandle: 'character' },
    { id: 'edge-3-6', source: 'short-term-memory-1', target: 'prompt-template-1', sourceHandle: 'filtered', targetHandle: 'variables' },
    { id: 'edge-2-6', source: 'personality-1', target: 'prompt-template-1', sourceHandle: 'personality', targetHandle: 'variables' },
    { id: 'edge-5-6', source: 'scene-1', target: 'prompt-template-1', sourceHandle: 'scene', targetHandle: 'variables' },
    { id: 'edge-6-8', source: 'prompt-template-1', target: 'llm-execution-1', sourceHandle: 'prompt', targetHandle: 'prompt' },
    { id: 'edge-7-8', source: 'llm-config-1', target: 'llm-execution-1', sourceHandle: 'config', targetHandle: 'config' },
    { id: 'edge-8-9', source: 'llm-execution-1', target: 'output-1', sourceHandle: 'response', targetHandle: 'content' }
  ]
};
```

## 7. 结论与建议 (Conclusions and Recommendations)

基于对Flowgram节点系统和小说生成器需求的分析，我们提出以下建议：

1. **采用模块化设计**: 将16种节点类型分为四大类，每类负责特定功能领域。

2. **标准化数据结构**: 为每种节点类型定义清晰的数据结构，确保数据一致性和可预测性。

3. **类型化端口系统**: 实现类型化的端口系统，确保只有兼容的端口可以连接。

4. **UI与逻辑分离**: 节点渲染组件负责UI展示，节点数据处理逻辑在业务层实现。

5. **渐进式实现**: 先实现核心节点类型，再逐步扩展更多功能节点。

6. **提供模板工作流**: 为用户提供预设的模板工作流，便于快速开始创作。

7. **扩展性设计**: 设计插件化架构，允许将来添加更多自定义节点类型。

这个设计方案将Flowgram的强大功能与小说生成器的特定需求完美结合，创建了一个灵活、直观且功能丰富的小说生成系统。