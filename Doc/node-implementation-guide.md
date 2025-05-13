# 小说生成器节点实现指南 (Node Implementation Guide)

## 1. 节点开发流程 (Node Development Process)

遵循Flowgram.ai自由布局编辑器的开发流程，为小说生成器实现各类节点。

### 1.1 节点开发步骤 (Node Development Steps)

1. **节点数据结构定义** (Define Node Data Structure)
   - 确定节点输入/输出
   - 定义节点属性

2. **节点UI组件开发** (Develop Node UI Components)
   - 创建节点渲染器
   - 设计节点样式

3. **节点业务逻辑实现** (Implement Node Business Logic)
   - 编写节点操作方法
   - 处理数据转换

4. **节点注册到系统** (Register Node to System)
   - 添加到节点注册表
   - 配置节点元数据

## 2. 人物节点实现 (Character Node Implementation)

### 2.1 节点数据结构 (Node Data Structure)

```typescript
// 人物节点数据
interface CharacterNodeData {
  label: string;
  character: Character | null;
  showDetails: boolean;
  isEditing: boolean;
}

// 人物节点属性面板数据
interface CharacterNodeProps {
  name: string;
  age: number;
  background: {
    origin: string;
    occupation: string;
    history: string;
  };
  language: string;
}
```

### 2.2 节点组件实现 (Node Component Implementation)

```jsx
// 人物节点渲染器
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
            <span className="detail-label">年龄:</span>
            <span className="detail-value">{character.age}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">职业:</span>
            <span className="detail-value">{character.background.occupation}</span>
          </div>
          {/* 更多详情项 */}
        </div>
      )}
    </div>
  );
};
```

### 2.3 属性面板实现 (Property Panel Implementation)

```jsx
// 人物节点属性面板
const CharacterNodePropertyPanel = (props) => {
  const { node, updateNodeData } = props;
  const [form, setForm] = useState({
    name: node.data.character?.name || '',
    age: node.data.character?.age || 0,
    // 其他字段
  });

  const handleChange = (field, value) => {
    setForm({
      ...form,
      [field]: value
    });
  };

  const handleSubmit = () => {
    // 更新节点数据
    const updatedCharacter = {
      ...node.data.character,
      name: form.name,
      age: form.age,
      // 更新其他字段
    };
    
    updateNodeData(node.id, {
      ...node.data,
      character: updatedCharacter
    });
  };

  return (
    <div className="property-panel">
      <h3>人物属性</h3>
      <div className="form-group">
        <label>名称</label>
        <input 
          type="text" 
          value={form.name} 
          onChange={(e) => handleChange('name', e.target.value)} 
        />
      </div>
      <div className="form-group">
        <label>年龄</label>
        <input 
          type="number" 
          value={form.age} 
          onChange={(e) => handleChange('age', parseInt(e.target.value))} 
        />
      </div>
      {/* 其他表单字段 */}
      <button onClick={handleSubmit}>保存</button>
    </div>
  );
};
```

### 2.4 节点注册 (Node Registration)

```typescript
// 人物节点注册
const registerCharacterNode = (registry) => {
  registry.registerNode({
    type: 'character',
    label: '人物节点 | Character Node',
    category: 'character',
    defaults: {
      width: 200,
      height: 100,
      data: {
        label: '人物节点',
        character: null,
        showDetails: false,
        isEditing: false
      }
    },
    inputs: [
      { id: 'input', label: '输入' }
    ],
    outputs: [
      { id: 'output', label: '输出' }
    ],
    renderer: CharacterNodeRenderer,
    propertyPanel: CharacterNodePropertyPanel
  });
};
```

## 3. 记忆节点实现 (Memory Node Implementation)

### 3.1 短期记忆节点 (Short-term Memory Node)

```typescript
// 短期记忆节点数据
interface ShortTermMemoryNodeData {
  label: string;
  memories: ShortTermMemory[];
  filter: {
    timeRange: [string, string] | null;
    entities: string[];
    importanceMin: number;
  };
}

// 短期记忆节点注册
const registerShortTermMemoryNode = (registry) => {
  registry.registerNode({
    type: 'short-term-memory',
    label: '短期记忆节点 | Short-term Memory Node',
    category: 'memory',
    defaults: {
      width: 240,
      height: 160,
      data: {
        label: '短期记忆节点',
        memories: [],
        filter: {
          timeRange: null,
          entities: [],
          importanceMin: 1
        }
      }
    },
    inputs: [
      { id: 'character', label: '人物' },
      { id: 'new-memory', label: '新记忆' }
    ],
    outputs: [
      { id: 'memories', label: '记忆集' },
      { id: 'filtered', label: '过滤后' }
    ],
    renderer: ShortTermMemoryNodeRenderer,
    propertyPanel: ShortTermMemoryPropertyPanel
  });
};
```

### 3.2 长期记忆节点 (Long-term Memory Node)

```typescript
// 长期记忆节点数据
interface LongTermMemoryNodeData {
  label: string;
  memories: LongTermMemory[];
  compressionRules: {
    timeThreshold: number; // 天数
    countThreshold: number; // 短期记忆条数
    importanceThreshold: number; // 重要性阈值
  };
}

// 长期记忆节点注册
const registerLongTermMemoryNode = (registry) => {
  registry.registerNode({
    type: 'long-term-memory',
    label: '长期记忆节点 | Long-term Memory Node',
    category: 'memory',
    defaults: {
      width: 240,
      height: 160,
      data: {
        label: '长期记忆节点',
        memories: [],
        compressionRules: {
          timeThreshold: 7, // 7天
          countThreshold: 20, // 20条
          importanceThreshold: 8 // 重要性>=8
        }
      }
    },
    inputs: [
      { id: 'short-term', label: '短期记忆' }
    ],
    outputs: [
      { id: 'long-term', label: '长期记忆' }
    ],
    renderer: LongTermMemoryNodeRenderer,
    propertyPanel: LongTermMemoryPropertyPanel
  });
};
```

## 4. LLM节点实现 (LLM Node Implementation)

### 4.1 LLM配置节点 (LLM Configuration Node)

```typescript
// LLM配置节点数据
interface LLMConfigNodeData {
  label: string;
  provider: 'gemini' | 'ollama';
  apiKey?: string;
  model: string;
  parameters: {
    temperature: number;
    maxTokens: number;
    topP: number;
    // 其他参数
  };
}

// LLM配置节点注册
const registerLLMConfigNode = (registry) => {
  registry.registerNode({
    type: 'llm-config',
    label: 'LLM配置节点 | LLM Configuration Node',
    category: 'llm',
    defaults: {
      width: 220,
      height: 140,
      data: {
        label: 'LLM配置',
        provider: 'gemini',
        model: 'gemini-pro',
        parameters: {
          temperature: 0.7,
          maxTokens: 1024,
          topP: 0.9
        }
      }
    },
    outputs: [
      { id: 'config', label: '配置' }
    ],
    renderer: LLMConfigNodeRenderer,
    propertyPanel: LLMConfigPropertyPanel
  });
};
```

### 4.2 LLM执行节点 (LLM Execution Node)

```typescript
// LLM执行节点数据
interface LLMExecutionNodeData {
  label: string;
  systemPrompt: string;
  contextStrategy: 'append' | 'summarize' | 'selective';
  lastResponse: string | null;
  isProcessing: boolean;
  error: string | null;
}

// LLM执行节点注册
const registerLLMExecutionNode = (registry) => {
  registry.registerNode({
    type: 'llm-execution',
    label: 'LLM执行节点 | LLM Execution Node',
    category: 'llm',
    defaults: {
      width: 280,
      height: 180,
      data: {
        label: 'LLM执行',
        systemPrompt: '',
        contextStrategy: 'append',
        lastResponse: null,
        isProcessing: false,
        error: null
      }
    },
    inputs: [
      { id: 'config', label: 'LLM配置' },
      { id: 'prompt', label: '提示词' },
      { id: 'character', label: '人物' },
      { id: 'memory', label: '记忆' }
    ],
    outputs: [
      { id: 'response', label: '响应' },
      { id: 'error', label: '错误' }
    ],
    renderer: LLMExecutionNodeRenderer,
    propertyPanel: LLMExecutionPropertyPanel
  });
};
```

## 5. 提示词节点实现 (Prompt Node Implementation)

### 5.1 提示词模板节点 (Prompt Template Node)

```typescript
// 提示词模板节点数据
interface PromptTemplateNodeData {
  label: string;
  template: PromptTemplate | null;
  variables: Record<string, string>;
  showPreview: boolean;
}

// 提示词模板节点注册
const registerPromptTemplateNode = (registry) => {
  registry.registerNode({
    type: 'prompt-template',
    label: '提示词模板节点 | Prompt Template Node',
    category: 'prompt',
    defaults: {
      width: 260,
      height: 160,
      data: {
        label: '提示词模板',
        template: null,
        variables: {},
        showPreview: false
      }
    },
    inputs: [
      { id: 'variable-source', label: '变量源' }
    ],
    outputs: [
      { id: 'prompt', label: '提示词' }
    ],
    renderer: PromptTemplateNodeRenderer,
    propertyPanel: PromptTemplatePropertyPanel
  });
};
```

### 5.2 提示词组合节点 (Prompt Composition Node)

```typescript
// 提示词组合节点数据
interface PromptCompositionNodeData {
  label: string;
  sections: Array<{
    id: string;
    name: string;
    content: string;
    enabled: boolean;
    order: number;
  }>;
  finalPrompt: string | null;
}

// 提示词组合节点注册
const registerPromptCompositionNode = (registry) => {
  registry.registerNode({
    type: 'prompt-composition',
    label: '提示词组合节点 | Prompt Composition Node',
    category: 'prompt',
    defaults: {
      width: 280,
      height: 200,
      data: {
        label: '提示词组合',
        sections: [],
        finalPrompt: null
      }
    },
    inputs: [
      { id: 'character', label: '人物' },
      { id: 'scene', label: '场景' },
      { id: 'memory', label: '记忆' },
      { id: 'template', label: '模板' }
    ],
    outputs: [
      { id: 'prompt', label: '最终提示词' }
    ],
    renderer: PromptCompositionNodeRenderer,
    propertyPanel: PromptCompositionPropertyPanel
  });
};
```

## 6. 场景节点实现 (Scene Node Implementation)

```typescript
// 场景节点数据
interface SceneNodeData {
  label: string;
  scene: Scene | null;
  showDetails: boolean;
}

// 场景节点注册
const registerSceneNode = (registry) => {
  registry.registerNode({
    type: 'scene',
    label: '场景节点 | Scene Node',
    category: 'scene',
    defaults: {
      width: 220,
      height: 140,
      data: {
        label: '场景节点',
        scene: null,
        showDetails: false
      }
    },
    inputs: [
      { id: 'input', label: '输入' }
    ],
    outputs: [
      { id: 'output', label: '输出' }
    ],
    renderer: SceneNodeRenderer,
    propertyPanel: ScenePropertyPanel
  });
};
```

## 7. 导入/导出节点实现 (Import/Export Node Implementation)

### 7.1 JSON导入节点 (JSON Import Node)

```typescript
// JSON导入节点数据
interface JSONImportNodeData {
  label: string;
  targetType: 'character' | 'scene' | 'memory' | 'prompt';
  jsonContent: string | null;
  parseError: string | null;
  importedData: any | null;
}

// JSON导入节点注册
const registerJSONImportNode = (registry) => {
  registry.registerNode({
    type: 'json-import',
    label: 'JSON导入节点 | JSON Import Node',
    category: 'utility',
    defaults: {
      width: 220,
      height: 140,
      data: {
        label: 'JSON导入',
        targetType: 'character',
        jsonContent: null,
        parseError: null,
        importedData: null
      }
    },
    outputs: [
      { id: 'output', label: '输出数据' },
      { id: 'error', label: '错误' }
    ],
    renderer: JSONImportNodeRenderer,
    propertyPanel: JSONImportPropertyPanel
  });
};
```

### 7.2 JSON导出节点 (JSON Export Node)

```typescript
// JSON导出节点数据
interface JSONExportNodeData {
  label: string;
  sourceType: 'character' | 'scene' | 'memory' | 'prompt';
  prettyPrint: boolean;
  exportedJSON: string | null;
}

// JSON导出节点注册
const registerJSONExportNode = (registry) => {
  registry.registerNode({
    type: 'json-export',
    label: 'JSON导出节点 | JSON Export Node',
    category: 'utility',
    defaults: {
      width: 220,
      height: 140,
      data: {
        label: 'JSON导出',
        sourceType: 'character',
        prettyPrint: true,
        exportedJSON: null
      }
    },
    inputs: [
      { id: 'input', label: '输入数据' }
    ],
    renderer: JSONExportNodeRenderer,
    propertyPanel: JSONExportPropertyPanel
  });
};
```

## 8. 节点通信与数据流 (Node Communication and Data Flow)

### 8.1 节点连接处理 (Node Connection Handling)

```typescript
// 处理节点连接事件
const handleNodeConnection = (edge, edges, nodes) => {
  const sourceNode = nodes.find(node => node.id === edge.source);
  const targetNode = nodes.find(node => node.id === edge.target);
  
  if (!sourceNode || !targetNode) return;
  
  // 根据节点类型和端口处理数据流
  const sourceOutput = edge.sourceHandle;
  const targetInput = edge.targetHandle;
  
  // 示例：从人物节点到记忆节点的连接
  if (sourceNode.type === 'character' && targetNode.type === 'short-term-memory' && 
      sourceOutput === 'output' && targetInput === 'character') {
    // 更新目标节点数据
    const character = sourceNode.data.character;
    // ...处理逻辑
  }
  
  // 其他类型的连接处理
};
```

### 8.2 数据传递机制 (Data Transfer Mechanism)

1. **直接数据传递** (Direct Data Transfer)
   - 节点间直接传递数据对象
   - 用于简单数据流

2. **事件驱动传递** (Event-driven Transfer)
   - 基于事件的数据更新机制
   - 用于复杂数据流和异步操作

3. **状态同步传递** (State Synchronization Transfer)
   - 使用共享状态管理
   - 用于多节点数据同步

## 9. 示例工作流实现 (Example Workflow Implementation)

### 9.1 记忆压缩工作流 (Memory Compression Workflow)

```typescript
// 工作流数据结构
const memoryCompressionWorkflow = {
  id: 'memory-compression-workflow',
  name: '记忆压缩工作流',
  description: '将短期记忆压缩为长期记忆',
  nodes: [
    {
      id: 'node-1',
      type: 'short-term-memory',
      position: { x: 100, y: 100 },
      data: {
        label: '短期记忆',
        memories: [], // 初始为空
        filter: {
          timeRange: ['2023-01-01', '2023-01-31'],
          entities: [],
          importanceMin: 5
        }
      }
    },
    {
      id: 'node-2',
      type: 'llm-config',
      position: { x: 100, y: 300 },
      data: {
        label: 'LLM配置',
        provider: 'gemini',
        model: 'gemini-pro',
        parameters: {
          temperature: 0.3, // 较低温度以获得更确定性的结果
          maxTokens: 512,
          topP: 0.9
        }
      }
    },
    {
      id: 'node-3',
      type: 'llm-execution',
      position: { x: 400, y: 200 },
      data: {
        label: 'LLM记忆压缩',
        systemPrompt: '你是一个记忆压缩器。请将以下短期记忆事件总结为一个抽象的长期记忆。保留关键情感和重要事件，但简化细节。',
        contextStrategy: 'append',
        lastResponse: null,
        isProcessing: false,
        error: null
      }
    },
    {
      id: 'node-4',
      type: 'long-term-memory',
      position: { x: 700, y: 100 },
      data: {
        label: '长期记忆',
        memories: [], // 初始为空
        compressionRules: {
          timeThreshold: 30, // 30天
          countThreshold: 50, // 50条
          importanceThreshold: 7 // 重要性>=7
        }
      }
    },
    {
      id: 'node-5',
      type: 'json-export',
      position: { x: 700, y: 300 },
      data: {
        label: '记忆导出',
        sourceType: 'memory',
        prettyPrint: true,
        exportedJSON: null
      }
    }
  ],
  edges: [
    {
      id: 'edge-1-3',
      source: 'node-1',
      target: 'node-3',
      sourceHandle: 'filtered',
      targetHandle: 'memory'
    },
    {
      id: 'edge-2-3',
      source: 'node-2',
      target: 'node-3',
      sourceHandle: 'config',
      targetHandle: 'config'
    },
    {
      id: 'edge-3-4',
      source: 'node-3',
      target: 'node-4',
      sourceHandle: 'response',
      targetHandle: 'short-term'
    },
    {
      id: 'edge-4-5',
      source: 'node-4',
      target: 'node-5',
      sourceHandle: 'long-term',
      targetHandle: 'input'
    }
  ]
};
```