# 小说生成器系统产品需求文档 (Novel Generator PRD)

## 1. 项目概述 (Project Overview)

本项目旨在构建一个基于Flowgram.ai的小说生成器系统，利用自由布局编辑器(Free Layout Editor)实现可视化的流程设计。系统将界面与业务逻辑分离，采用动态JSON解析与组合作为核心，并提供完整的项目管理功能。

This project aims to build a novel generation system based on Flowgram.ai, using the Free Layout Editor for visual flow design. The system features UI/business logic separation, dynamic JSON parsing/composition as its core, and comprehensive project management capabilities.

## 2. 系统架构 (System Architecture)

### 2.1 分层架构 (Layered Architecture)

```
┌─────────────────────────────────────────────┐
│ 界面层 (UI Layer)                            │
│ - Flowgram.ai Free Layout Editor            │
│ - React组件                                 │
├─────────────────────────────────────────────┤
│ 业务逻辑层 (Business Logic Layer)            │
│ - JSON解析/组合引擎                          │
│ - 节点执行器                                 │
│ - LLM接口适配器                              │
├─────────────────────────────────────────────┤
│ 数据层 (Data Layer)                          │
│ - 项目管理                                   │
│ - 文件存取                                   │
│ - 配置管理                                   │
└─────────────────────────────────────────────┘
```

### 2.2 核心组件 (Core Components)

1. **自由布局编辑器 (Free Layout Editor)**
   - 基于@flowgram.ai/free-layout-editor
   - 支持自定义节点类型和样式
   - 提供节点面板、工具栏和小地图

2. **节点系统 (Node System)**
   - 自定义节点类型和行为
   - 节点数据结构标准化
   - 支持节点间连接和数据流

3. **插件系统 (Plugin System)**
   - 使用@flowgram.ai各类插件增强功能
   - 包括历史记录、自动布局、容器管理等

4. **项目管理器 (Project Manager)**
   - 项目存储和检索
   - 版本控制
   - 导入/导出功能

## 3. 数据结构 (Data Structure)

### 3.1 节点JSON结构 (Node JSON Structure)

```typescript
interface FlowNodeJSON {
  id: string;                 // 节点唯一标识 (Node ID)
  type: string;               // 节点类型 (Node Type)
  position: {                 // 节点位置 (Node Position)
    x: number;
    y: number;
  };
  size: {                     // 节点大小 (Node Size)
    width: number;
    height: number;
  };
  data: {                     // 节点数据 (Node Data)
    label: string;            // 节点标签 (Node Label)
    inputs: Array<{           // 输入端口 (Input Ports)
      id: string;
      type: string;
    }>;
    outputs: Array<{          // 输出端口 (Output Ports)
      id: string;
      type: string;
    }>;
    properties: Record<string, any>; // 节点属性 (Node Properties)
  };
  style: Record<string, any>; // 节点样式 (Node Style)
}
```

### 3.2 连接结构 (Connection Structure)

```typescript
interface FlowConnectionJSON {
  id: string;                 // 连接ID (Connection ID)
  sourceNodeId: string;       // 源节点ID (Source Node ID)
  sourcePortId: string;       // 源端口ID (Source Port ID)
  targetNodeId: string;       // 目标节点ID (Target Node ID)
  targetPortId: string;       // 目标端口ID (Target Port ID)
  data?: {                    // 连接数据 (Connection Data)
    label?: string;           // 连接标签 (Connection Label)
  };
  style?: Record<string, any>; // 连接样式 (Connection Style)
}
```

### 3.3 项目结构 (Project Structure)

```typescript
interface NovelProject {
  id: string;                 // 项目ID (Project ID)
  name: string;               // 项目名称 (Project Name)
  description: string;        // 项目描述 (Project Description)
  createdAt: string;          // 创建时间 (Created Time)
  updatedAt: string;          // 更新时间 (Updated Time)
  version: string;            // 版本号 (Version)
  nodes: FlowNodeJSON[];      // 节点列表 (Node List)
  connections: FlowConnectionJSON[]; // 连接列表 (Connection List)
  variables: Record<string, any>; // 全局变量 (Global Variables)
  settings: {                 // 项目设置 (Project Settings)
    llmProvider: string;      // LLM提供商 (LLM Provider)
    apiKey: string;           // API密钥 (API Key)
    outputFormat: string;     // 输出格式 (Output Format)
    language: string;         // 语言设置 (Language Setting)
    maxTokens: number;        // 最大Token数 (Max Tokens)
  };
}
```

## 4. 节点类型 (Node Types)

### 4.1 基础节点 (Basic Nodes)

1. **开始节点 (Start Node)**
   - 流程的起始点
   - 包含项目基本信息和全局设置

2. **输出节点 (Output Node)**
   - 生成最终小说文本
   - 支持多种格式输出

3. **条件节点 (Condition Node)**
   - 根据条件控制流程走向
   - 支持多分支逻辑

4. **循环节点 (Loop Node)**
   - 实现重复执行逻辑
   - 支持循环条件和计数器

### 4.2 功能节点 (Functional Nodes)

1. **提示词节点 (Prompt Node)**
   - 生成和管理提示词模板
   - 支持变量插入和条件拼接
   - 多语言提示词管理

2. **人物节点 (Character Node)**
   - 管理小说角色信息
   - 定义性格、背景、关系等
   - 生成角色描述

3. **场景节点 (Scene Node)**
   - 构建场景描述和环境
   - 时间、地点、氛围设置
   - 场景连贯性管理

4. **记忆节点 (Memory Node)**
   - 管理上下文和历史信息
   - 实现长期记忆和检索
   - 关键信息提取和保存

5. **LLM节点 (LLM Node)**
   - 配置和调用AI大模型
   - 处理响应和错误
   - 支持多种LLM服务商

6. **文本处理节点 (Text Processing Node)**
   - 文本格式化和修饰
   - 语法校对和优化
   - 文体风格调整

7. **变量节点 (Variable Node)**
   - 创建和管理变量
   - 支持基本类型和复杂结构
   - 变量作用域管理

## 5. 开发流程 (Development Process)

参照Flowgram.ai自由布局编辑器的构建流程:

### 5.1 环境搭建 (Environment Setup)

1. 安装Node.js和npm/yarn
2. 创建React项目
3. 安装Flowgram.ai相关依赖:
   ```
   npm install @flowgram.ai/free-layout-editor
   npm install @flowgram.ai/free-node-panel-plugin
   npm install @flowgram.ai/free-history-plugin
   npm install @flowgram.ai/free-lines-plugin
   npm install @flowgram.ai/free-auto-layout-plugin
   ```

### 5.2 开发步骤 (Development Steps)

1. **定义初始数据 (Define Initial Data)**
   - 创建基础节点和连接结构
   - 设定默认布局和样式

2. **注册节点类型 (Register Node Types)**
   - 实现各类节点的数据结构和UI渲染
   - 配置节点行为和交互方式

3. **创建编辑器配置 (Create Editor Configuration)**
   - 配置FlowDocumentOptions
   - 设置节点样式和标签格式化

4. **创建节点添加面板 (Create Node Addition Panel)**
   - 实现分类节点面板
   - 配置拖拽交互

5. **创建工具栏和小地图 (Create Toolbar and Minimap)**
   - 实现常用操作工具栏
   - 添加导航小地图

6. **组装编辑器主组件 (Assemble Editor Main Component)**
   - 整合各组件到主界面
   - 实现布局和响应式设计

7. **创建应用程序入口 (Create Application Entry)**
   - 实现主应用程序入口
   - 配置路由和状态管理

8. **添加样式和主题 (Add Styles and Themes)**
   - 实现自定义样式和主题
   - 优化用户界面

### 5.3 插件集成 (Plugin Integration)

利用Flowgram.ai提供的插件增强功能:

1. **历史插件 (History Plugin)**
   - @flowgram.ai/free-history-plugin
   - 实现撤销/重做功能

2. **线条插件 (Lines Plugin)**
   - @flowgram.ai/free-lines-plugin
   - 优化节点连接线显示

3. **自动布局插件 (Auto Layout Plugin)**
   - @flowgram.ai/free-auto-layout-plugin
   - 智能排列节点位置

4. **节点面板插件 (Node Panel Plugin)**
   - @flowgram.ai/free-node-panel-plugin
   - 实现节点添加面板

5. **容器插件 (Container Plugin)**
   - @flowgram.ai/free-container-plugin
   - 支持节点分组和嵌套

## 6. 用户界面设计 (UI Design)

### 6.1 主界面布局 (Main Interface Layout)

```
┌─────────────────────────────────────────────────────────┐
│ 工具栏 (Toolbar)                                        │
├────────────┬────────────────────────────┬───────────────┤
│            │                            │               │
│            │                            │               │
│ 节点面板    │      编辑器主区域           │  属性面板      │
│ (Node      │    (Editor Main Area)      │ (Properties   │
│  Panel)    │                            │  Panel)       │
│            │                            │               │
│            │                            │               │
│            │                            │               │
├────────────┴────────────────────────────┴───────────────┤
│ 状态栏 (Status Bar)             小地图 (Minimap)         │
└─────────────────────────────────────────────────────────┘
```

### 6.2 节点样式 (Node Styles)

为不同类型节点设计差异化样式:
- 使用不同颜色区分节点类型
- 图标表示节点功能
- 清晰的输入/输出端口标识
- 折叠/展开功能节约空间

### 6.3 交互设计 (Interaction Design)

- 拖拽添加节点
- 点击选择和多选
- 连接线自动吸附
- 右键菜单快捷操作
- 键盘快捷键支持

## 7. 系统能力 (System Capabilities)

### 7.1 核心能力 (Core Capabilities)

1. **可视化流程设计 (Visual Flow Design)**
   - 拖拽式节点添加和连接
   - 所见即所得的编辑体验

2. **动态JSON解析 (Dynamic JSON Parsing)**
   - 灵活处理复杂JSON结构
   - 支持运行时结构变更

3. **多模型支持 (Multi-Model Support)**
   - 集成多种AI大模型
   - 统一接口和响应处理

4. **可扩展架构 (Extensible Architecture)**
   - 插件化设计
   - 自定义节点和功能

### 7.2 小说生成能力 (Novel Generation Capabilities)

1. **智能情节生成 (Intelligent Plot Generation)**
   - 基于提示词和角色生成连贯情节
   - 支持多种文学体裁和风格

2. **角色塑造 (Character Development)**
   - 深度角色背景生成
   - 一致性人物性格维护

3. **场景描写 (Scene Description)**
   - 丰富细节的场景描绘
   - 环境与情节的有机结合

4. **对话生成 (Dialogue Generation)**
   - 符合角色特性的对话内容
   - 自然流畅的对话节奏

5. **长文本一致性 (Long Text Consistency)**
   - 维护整体故事一致性
   - 管理长篇小说的上下文连贯

## 8. 部署要求 (Deployment Requirements)

### 8.1 打包与分发 (Packaging and Distribution)

- 使用Electron打包为可执行文件(.exe)
- 提供Windows和macOS版本
- 自动更新机制

### 8.2 系统要求 (System Requirements)

- 操作系统: Windows 10/11 或 macOS 10.15+
- 处理器: Intel Core i5/AMD Ryzen 5 或更高
- 内存: 8GB RAM (推荐16GB)
- 存储: 500MB可用空间
- 网络: 稳定的互联网连接

### 8.3 依赖项 (Dependencies)

- Node.js 16+
- Electron 20+
- React 18+
- Flowgram.ai相关包
- 第三方LLM API访问

## 9. 未来扩展 (Future Extensions)

1. **模板市场 (Template Marketplace)**
   - 分享和下载预设模板
   - 社区贡献的节点和流程

2. **协作编辑 (Collaborative Editing)**
   - 多用户实时协作
   - 版本合并和冲突解决

3. **高级分析 (Advanced Analytics)**
   - 文本质量分析
   - 风格一致性检查
   - 创作建议生成

4. **多语言支持 (Multi-language Support)**
   - 扩展支持更多语言
   - 跨语言翻译和适配

5. **AI辅助创作 (AI-Assisted Writing)**
   - 智能写作建议
   - 自动完成功能
   - 风格调整辅助