# 小说生成器系统架构设计 (Novel Generator Architecture)

## 1. 系统整体架构 (System Architecture)

小说生成器系统采用模块化设计，严格分离UI和业务逻辑。核心功能基于JSON解析和组合，通过Flowgram.ai的自由布局编辑器实现可视化流程设计。

```
┌────────────────────────────────────────────────────┐
│                    UI Layer                         │
│  (Flowgram.ai Free Layout Editor / React Components)│
├────────────────────────────────────────────────────┤
│                Business Logic Layer                 │
│     ┌──────────────┐          ┌──────────────┐     │
│     │ Prompt 生成器 │          │  LLM 通信器   │     │
│     └──────────────┘          └──────────────┘     │
│     ┌──────────────┐          ┌──────────────┐     │
│     │   人物管理    │          │   记忆管理    │     │
│     └──────────────┘          └──────────────┘     │
│     ┌──────────────┐          ┌──────────────┐     │
│     │   场景管理    │          │  JSON解析器   │     │
│     └──────────────┘          └──────────────┘     │
├────────────────────────────────────────────────────┤
│                   Data Layer                        │
│    (Project Files, Templates, Config, Output)       │
└────────────────────────────────────────────────────┘
```

## 2. 节点类型和数据结构 (Node Types and Data Structures)

### 2.1 基础节点类型 (Basic Node Types)

1. **开始节点 (Start Node)**
   - 流程起点
   - 配置项目基本信息

2. **输出节点 (Output Node)**
   - 生成最终文本
   - 支持多种格式输出

3. **LLM节点 (LLM Node)**
   - 支持Gemini和Ollama
   - 管理API密钥和参数

4. **提示词节点 (Prompt Node)**
   - 组装最终提示词
   - 变量插入和模板管理

### 2.2 人物相关节点 (Character Related Nodes)

1. **人物节点 (Character Node)**
   - 导入/导出人物JSON
   - 编辑人物基本信息

2. **性格节点 (Personality Node)**
   - 编辑固定结构的性格属性
   - 可视化性格特征

3. **短期记忆节点 (Short-term Memory Node)**
   - 按条目管理事件记忆
   - 记录事件和关系

4. **长期记忆节点 (Long-term Memory Node)**
   - 压缩短期记忆
   - 抽象化记忆内容

5. **记忆检索节点 (Memory Retrieval Node)**
   - 检索相关记忆
   - 关联度排序

### 2.3 场景相关节点 (Scene Related Nodes)

1. **场景节点 (Scene Node)**
   - 管理场景描述
   - 设置环境参数

2. **情节节点 (Plot Node)**
   - 设计故事情节
   - 管理剧情进展

## 3. 关键数据结构 (Key Data Structures)

### 3.1 人物数据结构 (Character Data Structure)

参考李观一.json模板，扩展为统一规范：

```typescript
interface Character {
  name: string;                // 角色名称 (中文/英文)
  age: number;                 // 年龄
  background: {                // 背景
    origin: string;            // 出身/居住地
    occupation: string;        // 职业
    history: string;           // 历史背景
  };
  personality: {               // 性格 (固定结构)
    CoreTemperament: Record<string, PersonalityTrait>;    // 核心气质
    InternalValues: Record<string, PersonalityTrait>;     // 内在价值观
    ThinkingStyle: Record<string, PersonalityTrait>;      // 思考方式
    InternalMotivation: Record<string, PersonalityTrait>; // 内在动机
    SelfPerception: Record<string, PersonalityTrait>;     // 自我认知
  };
  relationships: Array<{       // 关系网络
    character: string;         // 关联角色
    type: string;              // 关系类型
    description: string;       // 关系描述
  }>;
  language: string;            // 主要语言
}

interface PersonalityTrait {
  Value: number;               // 数值 (0-100)
  Caption: string;             // 中文说明
}
```

### 3.2 记忆数据结构 (Memory Data Structure)

```typescript
// 短期记忆结构
interface ShortTermMemory {
  id: string;                  // 记忆唯一ID
  timestamp: string;           // 时间戳
  eventType: string;           // 事件类型
  content: string;             // 事件内容
  entities: Array<{            // 相关实体
    name: string;              // 实体名称
    type: string;              // 实体类型 (人物/物品/地点)
    relationship: string;      // 与主角关系
  }>;
  emotionalImpact: number;     // 情感影响 (1-10)
  importance: number;          // 重要性 (1-10)
}

// 长期记忆结构
interface LongTermMemory {
  id: string;                  // 记忆唯一ID
  period: {                    // 时间段
    start: string;             // 开始时间
    end: string;               // 结束时间
  };
  summary: string;             // 概括总结
  keyEntities: string[];       // 关键实体
  emotionalSignificance: string; // 情感意义
  sourceMemories: string[];    // 源短期记忆IDs
}
```

### 3.3 场景数据结构 (Scene Data Structure)

```typescript
interface Scene {
  id: string;                  // 场景ID
  name: string;                // 场景名称
  location: {                  // 地点
    name: string;              // 地点名称
    description: string;       // 地点描述
  };
  time: {                      // 时间
    period: string;            // 时间段 (如"日出"、"午夜")
    season: string;            // 季节
    weather: string;           // 天气
  };
  ambience: {                  // 氛围
    mood: string;              // 情绪基调
    sights: string[];          // 视觉元素
    sounds: string[];          // 听觉元素
    smells: string[];          // 嗅觉元素
  };
  characters: string[];        // 场景中的角色
  objects: string[];           // 场景中的物品
}
```

### 3.4 提示词模板结构 (Prompt Template Structure)

```typescript
interface PromptTemplate {
  id: string;                  // 模板ID
  name: string;                // 模板名称
  description: string;         // 描述
  template: string;            // 模板内容 (支持变量占位符)
  variables: Array<{           // 变量列表
    name: string;              // 变量名
    description: string;       // 变量描述
    defaultValue: string;      // 默认值
  }>;
  category: string;            // 分类
  language: string;            // 语言
}
```

## 4. 记忆管理机制 (Memory Management Mechanism)

### 4.1 短期记忆管理 (Short-term Memory Management)

1. **事件记录** (Event Recording)
   - 固定格式记录事件
   - 关联人物和物品
   - 评估情感影响和重要性

2. **记忆检索** (Memory Retrieval)
   - 按时间/实体/情感检索
   - 相关度排序
   - 支持模糊匹配

### 4.2 长期记忆生成 (Long-term Memory Generation)

1. **记忆压缩规则** (Memory Compression Rules)
   - 时间触发：超过N天的短期记忆触发压缩
   - 数量触发：短期记忆超过M条触发压缩
   - 重要性触发：特别重要的事件立即形成长期记忆

2. **压缩流程** (Compression Process)
   - 收集相关短期记忆
   - 调用LLM进行抽象总结
   - 生成长期记忆
   - 关联原始短期记忆

## 5. LLM集成机制 (LLM Integration Mechanism)

### 5.1 支持的LLM模型 (Supported LLM Models)

1. **Gemini**
   - API密钥配置
   - 参数设置

2. **Ollama**
   - 本地模型配置
   - 模型参数调整

### 5.2 LLM节点功能 (LLM Node Functions)

1. **提示词处理** (Prompt Processing)
   - 变量替换
   - 上下文组装
   - 指令优化

2. **响应处理** (Response Processing)
   - 格式化输出
   - 错误处理
   - 结果解析

3. **记忆查询** (Memory Querying)
   - 相关性查询
   - 上下文增强
   - 记忆整合

## 6. JSON解析与组合机制 (JSON Parsing and Composition)

### 6.1 动态JSON解析器 (Dynamic JSON Parser)

1. **模式验证** (Schema Validation)
   - 验证JSON结构符合预定义模式
   - 处理缺失字段和默认值
   - 支持扩展字段

2. **数据转换** (Data Transformation)
   - JSON与内部对象互转
   - 格式标准化
   - 数据清理

### 6.2 JSON组合器 (JSON Composer)

1. **模板合并** (Template Merging)
   - 基于模板生成完整JSON
   - 支持部分覆盖
   - 保留原始数据完整性

2. **差异处理** (Difference Handling)
   - 计算JSON差异
   - 选择性更新
   - 冲突解决

## 7. 导入/导出功能 (Import/Export Functions)

### 7.1 人物导入/导出 (Character Import/Export)

1. **完整人物** (Complete Character)
   - JSON文件导入/导出
   - 模板应用

2. **部分属性** (Partial Attributes)
   - 选择性导入/导出
   - 属性合并

### 7.2 记忆导入/导出 (Memory Import/Export)

1. **批量操作** (Batch Operations)
   - 全部记忆导入/导出
   - 按时间段筛选

2. **单条记忆** (Single Memory)
   - 单条记忆导入/导出
   - 记忆编辑

## 8. Flowgram节点实现 (Flowgram Node Implementation)

### 8.1 节点注册配置 (Node Registration Configuration)

```typescript
// 人物节点注册示例
const characterNodeRegistry = {
  type: 'character',
  label: '人物节点 | Character Node',
  category: 'character',
  icon: 'user-icon',
  inputs: [
    { id: 'character-input', type: 'character' }
  ],
  outputs: [
    { id: 'character-output', type: 'character' }
  ],
  properties: {
    // 节点属性定义
  },
  render: CharacterNodeRenderer,
  operations: {
    // 节点操作定义
  }
};
```

### 8.2 节点连接规则 (Node Connection Rules)

1. **端口类型兼容性** (Port Type Compatibility)
   - 定义可连接的端口类型
   - 验证连接有效性

2. **数据流向** (Data Flow)
   - 定义节点间数据传递规则
   - 处理数据转换

### 8.3 节点UI组件 (Node UI Components)

1. **节点渲染器** (Node Renderers)
   - 自定义节点外观
   - 交互控件

2. **属性面板** (Property Panels)
   - 编辑节点属性
   - 配置节点行为

## 9. 示例流程 (Example Workflow)

### 9.1 角色创建流程 (Character Creation Workflow)

```
开始节点 → 人物节点(基本信息) → 性格节点 → 关系节点 → 导出节点
```

### 9.2 记忆管理流程 (Memory Management Workflow)

```
短期记忆节点 → 记忆过滤节点 → LLM节点(压缩) → 长期记忆节点 → 导出节点
```

### 9.3 小说生成流程 (Novel Generation Workflow)

```
开始节点 → 人物节点 → 场景节点 → 记忆检索节点 → 提示词组装节点 → LLM节点 → 输出节点
```