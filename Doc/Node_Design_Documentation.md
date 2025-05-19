# Node Design Documentation (节点设计文档)

## Table of Contents (目录)
1.  [Introduction (简介)](#introduction)
2.  [General Node Design Principles (通用节点设计原则)](#general-node-design-principles)
    *   [Data Structure (数据结构)](#data-structure)
    *   [Canvas Display (画布显示)](#canvas-display)
    *   [Sidebar Configuration (侧边栏配置)](#sidebar-configuration)
    *   [File-based Data (基于文件的数据)](#file-based-data)
3.  [Character Node (角色节点)](#character-node)
    *   [Overview (概述)](#overview)
    *   [Data Structure (`node.data.properties`) (数据结构)](#data-structure-character)
    *   [Canvas Display (`CharacterNodeCanvas.tsx`) (画布显示)](#canvas-display-character)
    *   [Sidebar Configuration (`form-meta.tsx`) (侧边栏配置)](#sidebar-configuration-character)
    *   [Output Handling (输出处理)](#output-handling-character)
    *   [Default Template (`default-character-template.json`) (默认模板)](#default-template-character)
4.  [Comment Node (注释节点)](#comment-node)
    *   [Overview (概述)](#overview-comment)
    *   [Data Structure (`node.data.properties`) (数据结构)](#data-structure-comment)
    *   [Canvas Display (画布显示)](#canvas-display-comment)
    *   [Sidebar Configuration (侧边栏配置)](#sidebar-configuration-comment)
5.  [Condition Node (条件节点)](#condition-node)
    *   [Overview (概述)](#overview-condition)
    *   [Data Structure (`node.data.properties`) (数据结构)](#data-structure-condition)
    *   [Canvas Display (画布显示)](#canvas-display-condition)
    *   [Sidebar Configuration (侧边栏配置)](#sidebar-configuration-condition)
6.  [Start Node (开始节点)](#start-node)
    *   [Overview (概述)](#overview-start)
    *   [Data Structure (`node.data.properties`) (数据结构)](#data-structure-start)
    *   [Canvas Display (画布显示)](#canvas-display-start)
    *   [Sidebar Configuration (侧边栏配置)](#sidebar-configuration-start)
7.  [End Node (结束节点)](#end-node)
    *   [Overview (概述)](#overview-end)
    *   [Data Structure (`node.data.properties`) (数据结构)](#data-structure-end)
    *   [Canvas Display (画布显示)](#canvas-display-end)
    *   [Sidebar Configuration (侧边栏配置)](#sidebar-configuration-end)
8.  [LLM Node (大语言模型节点)](#llm-node)
    *   [Overview (概述)](#overview-llm)
    *   [Data Structure (`node.data.properties`) (数据结构)](#data-structure-llm)
    *   [Canvas Display (画布显示)](#canvas-display-llm)
    *   [Sidebar Configuration (侧边栏配置)](#sidebar-configuration-llm)
    *   [Default Template (e.g., `default-llm-prompt-template.json`) (默认模板)](#default-template-llm)
9.  [Loop Node (循环节点)](#loop-node)
    *   [Overview (概述)](#overview-loop)
    *   [Data Structure (`node.data.properties`) (数据结构)](#data-structure-loop)
    *   [Canvas Display (画布显示)](#canvas-display-loop)
    *   [Sidebar Configuration (侧边栏配置)](#sidebar-configuration-loop)
10. [JSON Viewer Node (JSON 查看器节点)](#json-viewer-node)
    *   [Overview (概述)](#overview-jsonviewer)
    *   [Data Structure (`node.data.properties`) (数据结构)](#data-structure-jsonviewer)
    *   [Canvas Display (画布显示)](#canvas-display-jsonviewer)
    *   [Sidebar Configuration (侧边栏配置)](#sidebar-configuration-jsonviewer)

---

## Introduction (简介)

This document details the design for various nodes within the NovelFlow application. It covers their data structures, how they are displayed on the canvas, and how their properties are configured in the sidebar. The goal is to maintain a consistent design philosophy across all nodes, drawing inspiration from the `Character Node` implementation.

本文档详细介绍了 NovelFlow 应用中各种节点的设计。它涵盖了它们的数据结构、在画布上的显示方式以及在侧边栏中配置其属性的方式。目标是在所有节点中保持一致的设计理念，并从"角色节点"的实现中汲取灵感。

## General Node Design Principles (通用节点设计原则)

These principles apply to all nodes unless specified otherwise.
这些原则适用于所有节点，除非另有说明。

### Data Structure (数据结构)

Each node's specific data is stored within the `node.data.properties` object. This object contains all configurable aspects of the node. The `node.data.title` field is often synchronized with a primary name or identifier from `node.data.properties`.

每个节点的特定数据存储在 `node.data.properties` 对象中。此对象包含节点的所有可配置方面。`node.data.title` 字段通常与 `node.data.properties` 中的主要名称或标识符同步。

### Canvas Display (画布显示)

The canvas component for a node (e.g., `[NodeName]NodeCanvas.tsx`) is responsible for rendering a summarized or essential view of the node.
-   It should display a concise representation of the node's purpose or key data.
-   Information hiding is crucial: only display what is necessary for an at-a-glance understanding on the canvas.
-   Typically, it will read a few key fields from `node.data.properties` for display.
-   It will use the `NodeWrapper` component for consistent styling and structure.

节点的画布组件（例如 `[NodeName]NodeCanvas.tsx`）负责渲染节点的摘要或基本视图。
-   它应显示节点用途或关键数据的简洁表示。
-   信息隐藏至关重要：仅显示画布上一目了然所需的内容。
-   通常，它会从 `node.data.properties` 中读取一些关键字段以供显示。
-   它将使用 `NodeWrapper` 组件以获得一致的样式和结构。

### Sidebar Configuration (侧边栏配置)

The sidebar form (defined in a `form-meta.tsx`-like file) provides the interface for detailed configuration of the node.
-   It should expose all fields within `node.data.properties` for editing.
-   For complex data (objects, arrays), it should provide user-friendly ways to manage them (e.g., dynamic forms, JSON editors, file load/save).
-   It leverages `useNodeRender()` and associated form utilities from `@flowgram.ai/free-layout-editor`.
-   Changes in the sidebar form directly update the `node.data.properties` object.

侧边栏表单（在类似 `form-meta.tsx` 的文件中定义）提供了节点详细配置的界面。
-   它应公开 `node.data.properties` 中的所有字段以供编辑。
-   对于复杂数据（对象、数组），它应提供用户友好的管理方式（例如，动态表单、JSON 编辑器、文件加载/保存）。
-   它利用 `@flowgram.ai/free-layout-editor` 中的 `useNodeRender()` 和相关的表单实用程序。
-   侧边栏表单中的更改直接更新 `node.data.properties` 对象。

### File-based Data (基于文件的数据)

For nodes that manage significant amounts of structured data (like the Character node), a pattern of loading from and saving to JSON files is encouraged.
-   The `node.data.properties` would include a `filePath` field to store the associated file.
-   The sidebar would provide "Load", "Save", and "Export" functionalities.
-   A default template (e.g., `default-[nodetype]-template.json`) stored in the `./Templates` directory can be used to initialize the node's data structure.

对于管理大量结构化数据的节点（如角色节点），鼓励使用从 JSON 文件加载和保存到 JSON 文件的模式。
-   `node.data.properties` 将包含一个 `filePath` 字段来存储关联的文件。
-   侧边栏将提供"加载"、"保存"和"导出"功能。
-   存储在 `./Templates` 目录中的默认模板（例如 `default-[nodetype]-template.json`）可用于初始化节点的数据结构。

---

## Character Node (角色节点)

### Overview (概述)
The Character Node allows users to define, manage, and store detailed information about characters in their story. It supports loading character data from and saving to JSON files, and utilizes a template for structuring character information.

角色节点允许用户定义、管理和存储故事中角色的详细信息。它支持从 JSON 文件加载和保存角色数据，并利用模板来结构化角色信息。

### Data Structure (`node.data.properties`) (数据结构) <a name="data-structure-character"></a>
The `node.data.properties` for a Character Node contains:
角色节点的 `node.data.properties` 包含：

```typescript
interface CharacterNodeDataProperties {
  characterName: string;        // Character's name, also used for node title. (角色名称，也用作节点标题)
  characterFilePath: string;    // Path to the .json file for this character. (此角色 .json 文件的路径)
  characterJSON: {              // Object containing all character details. (包含所有角色详细信息的对象)
    name?: string;              // (姓名)
    age?: number | null;        // (年龄)
    background?: {              // (背景)
      origin?: string;          // (出身)
      occupation?: string;      // (职业)
      history?: string;         // (经历)
    };
    personality?: Record<string, any>; // (性格 - 可嵌套的键值对)
                                     // e.g., { "CoreTemperament": { "OptimismLevel": { "Value": 7, "Caption": "乐观程度" } } }
    relationships?: Array<{     // (人际关系 - 对象数组)
      character?: string;       // (关联角色)
      type?: string;            // (关系类型)
      description?: string;     // (关系描述)
    }>;
    language?: string;          // (语言习惯)
    // ... other custom fields defined in the template or added by the user
    // (模板中定义的或用户添加的其他自定义字段)
  };
  loadError?: string;           // Error message if file loading fails. (文件加载失败时的错误消息)
  outputVariableName?: string; // Optional: Name to make the character data available under in the flow context (e.g., "loadedCharacter").
                                // (可选：在流程上下文中使角色数据可用的名称（例如，"loadedCharacter"))
  characterOutput?: CharacterNodeDataProperties['characterJSON']; // Stores a snapshot of characterJSON for output, populated when the node is "run" or data is finalized. (存储 characterJSON 的快照以供输出，在节点"运行"或数据最终确定时填充)
}
```

### Canvas Display (`CharacterNodeCanvas.tsx`) (画布显示) <a name="canvas-display-character"></a>
-   **Displayed Information (显示信息):**
    -   `characterName` (or "Unknown Character / 未知角色")
    -   `age` from `characterJSON.age` (or "??")
-   **Interaction (交互):** Primarily visual; detailed editing occurs in the sidebar.
-   **Hiding Information (信息隐藏):** Most of the `characterJSON` data is not shown directly on the canvas node to keep it clean. It's accessible via the sidebar.

### Sidebar Configuration (`form-meta.tsx`) (侧边栏配置) <a name="sidebar-configuration-character"></a>
-   **File Management (文件管理):**
    -   "Browse..." button to load a character from a `.json` file. Updates `characterFilePath` and `characterJSON`.
    -   "Save" button to save current `characterJSON` to the path in `characterFilePath`.
    -   "Export" button to save current `characterJSON` to a new `.json` file (filename derived from `characterName`).
-   **Fields (字段):**
    -   **Name (名称):** Input for `characterJSON.name`. Updates `characterName` and `node.data.title`.
    *   **Age (年龄):** Input for `characterJSON.age`.
    *   **Dynamic Properties (动态属性):** Other fields from `characterJSON` (e.g., `background`, `personality`, `relationships`, `language`, custom fields) are rendered dynamically.
        *   Nested objects are traversable.
        *   `personality` subgroups (e.g., `CoreTemperament`) are rendered as tables of traits, where each trait is an object like `{ Value: number, Caption: string }`.
        *   `relationships` are managed as a list of editable objects, with "Add Relationship" and "Delete" buttons.
        *   Other arrays and complex objects can be edited via a JSON textarea or recursively rendered fields.
-   **Error Display (错误显示):** Displays `loadError` if file operations fail.

### Output Handling (输出处理) <a name="output-handling-character"></a>
Similar to how the LLM Node makes its response available, the Character Node can output its current `characterJSON` data to the flow's context.
-   The `outputVariableName` property in `node.data.properties` allows you to specify a name (e.g., `loadedCharacter`).
-   When the node is processed or its data is considered finalized (e.g., after a "Save" or "Load" operation, or explicitly triggered), the content of `characterJSON` will be copied to `node.data.properties.characterOutput`.
-   This `characterOutput` can then be accessed by other nodes in the flow using a path like `nodes.[CharacterNodeID].data.properties.characterOutput.name` or `global.[outputVariableName].name` if the output is mapped to the global context. This allows other nodes, like an LLM node, to use the character details dynamically.

(中文翻译)
与 LLM 节点使其响应可用的方式类似，角色节点可以将其当前的 `characterJSON` 数据输出到流程的上下文中。
-   `node.data.properties` 中的 `outputVariableName` 属性允许您指定一个名称（例如 `loadedCharacter`）。
-   当节点被处理或其数据被视为最终确定时（例如，在"保存"或"加载"操作之后，或被明确触发时），`characterJSON` 的内容将被复制到 `node.data.properties.characterOutput`。
-   然后，流程中的其他节点可以使用诸如 `nodes.[CharacterNodeID].data.properties.characterOutput.name` 或 `global.[outputVariableName].name` (如果输出已映射到全局上下文) 之类的路径来访问此 `characterOutput`。这使得其他节点（如 LLM 节点）能够动态使用角色详细信息。

### Default Template (`default-character-template.json`) (默认模板) <a name="default-template-character"></a>
Located at `./Templates/default-character-template.json`.
-   Provides the initial structure for `characterJSON` when a new character node is created or when merging loaded data.
-   Example structure:
    ```json
    {
      "name": "新角色",
      "age": null,
      "background": {
        "origin": "",
        "occupation": "",
        "history": ""
      },
      "personality": {
        "CoreTemperament": {
            "OptimismLevel": {"Value": 5, "Caption": "乐观程度"},
            "PatienceLevel": {"Value": 5, "Caption": "耐心程度"}
        }
        // ... other personality aspects
      },
      "relationships": [],
      "language": "chinese"
    }
    ```

---
## Comment Node (注释节点)

### Overview (概述) <a name="overview-comment"></a>
The Comment Node allows users to add explanatory text or notes within the flow. It does not affect the execution of the flow but serves as an annotation tool.

注释节点允许用户在流程中添加解释性文本或笔记。它不影响流程的执行，而是作为一种注释工具。

### Data Structure (`node.data.properties`) (数据结构) <a name="data-structure-comment"></a>
```typescript
interface CommentNodeDataProperties {
  commentText: string;    // The content of the comment. (注释的内容)
  fontSize?: number;      // Optional: font size for the comment text. (可选：注释文本的字号)
  textColor?: string;     // Optional: color of the comment text. (可选：注释文本的颜色)
  backgroundColor?: string; // Optional: background color for the comment node. (可选：注释节点的背景颜色)
}
```
The `node.data.title` could be a truncated version of `commentText` or a fixed string like "Comment".

`node.data.title` 可以是 `commentText` 的截断版本或固定字符串（如"注释"）。

### Canvas Display (画布显示) <a name="canvas-display-comment"></a>
-   **Displayed Information (显示信息):**
    -   Displays the `commentText`.
    -   Applies `fontSize`, `textColor`, and `backgroundColor` if provided.
-   **Interaction (交互):** Primarily visual. The text might be directly editable on the canvas for short comments, or via the sidebar for longer ones.
-   **Hiding Information (信息隐藏):** All relevant information is usually displayed.

### Sidebar Configuration (侧边栏配置) <a name="sidebar-configuration-comment"></a>
-   **Fields (字段):**
    -   **Comment Text (注释文本):** A textarea for `commentText`.
    -   **Font Size (字号):** (Optional) Number input for `fontSize`.
    -   **Text Color (文本颜色):** (Optional) Color picker for `textColor`.
    -   **Background Color (背景颜色):** (Optional) Color picker for `backgroundColor`.

---
## Condition Node (条件节点)

### Overview (概述) <a name="overview-condition"></a>
The Condition Node directs the flow based on evaluating one or more conditions. It will have at least two output handles (e.g., "True" and "False").

条件节点根据一个或多个条件的评估来指导流程。它将至少有两个输出句柄（例如，"True"和"False"）。

### Data Structure (`node.data.properties`) (数据结构) <a name="data-structure-condition"></a>
```typescript
interface ConditionItem {
  id: string;                     // Unique ID for the condition item. (条件项的唯一ID)
  variablePath: string;           // Path to the variable to check (e.g., "global.plotPoint.eventOccurred", "nodes.character_1.data.properties.characterJSON.age"). (要检查的变量路径)
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'not_contains' | 'is_empty' | 'is_not_empty'; // Comparison operator. (比较运算符)
  valueToCompare?: any;           // Value to compare against (not needed for 'is_empty', 'is_not_empty'). (用于比较的值)
  valueType?: 'string' | 'number' | 'boolean' | 'variable'; // Type of valueToCompare, or if it refers to another variable.
}

interface ConditionGroup {
    id: string;
    type: 'AND' | 'OR';             // How conditions in this group are combined. (组内条件的组合方式)
    conditions: Array<ConditionItem | ConditionGroup>; // Nested conditions or groups. (嵌套的条件或组)
}

interface ConditionNodeDataProperties {
  conditionName?: string;         // Optional name for the condition node. (可选的条件节点名称)
  conditionLogic: ConditionGroup; // Root group for the condition logic. (条件逻辑的根组)
  // outputConfiguration: Array<{handleId: string, label: string}>; // Defines outputs beyond true/false if needed for complex branching.
}
```
The `node.data.title` could be `conditionName` or "Condition".

`node.data.title` 可以是 `conditionName` 或"条件"。

### Canvas Display (画布显示) <a name="canvas-display-condition"></a>
-   **Displayed Information (显示信息):**
    -   `conditionName` or a summary of the primary condition.
    -   Clearly labeled output handles (e.g., "If True", "If False", or custom labels based on `outputConfiguration`).
-   **Hiding Information (信息隐藏):** The detailed logic of `conditionLogic` is complex and best managed in the sidebar.

### Sidebar Configuration (侧边栏配置) <a name="sidebar-configuration-condition"></a>
-   **Fields (字段):**
    -   **Condition Name (条件名称):** Input for `conditionName`.
    -   **Logic Builder (逻辑构建器):** A UI for constructing the `conditionLogic` tree:
        -   Add/remove conditions and groups.
        -   Select `variablePath` (potentially with a variable picker that browses the flow's data context).
        -   Choose `operator`.
        -   Input `valueToCompare` and select its `valueType`.
        -   Define `AND`/`OR` for groups.
    -   **(Optional) Output Configuration (输出配置):** If more than two outputs are needed, a way to define custom output handles and their corresponding evaluation criteria (though this might imply a more switch-like behavior).

---
## Start Node (开始节点)

### Overview (概述) <a name="overview-start"></a>
The Start Node marks the beginning of a flow or a sub-flow. There should typically be one primary Start Node in a main flow. It can define initial parameters or inputs for the flow.

开始节点标记流程或子流程的开始。主流程中通常应该有一个主开始节点。它可以为流程定义初始参数或输入。

### Data Structure (`node.data.properties`) (数据结构) <a name="data-structure-start"></a>
```typescript
interface FlowInputParameter {
  id: string;
  name: string;             // Parameter name (e.g., "scenarioDescription", "protagonistId"). (参数名称)
  type: 'string' | 'number' | 'boolean' | 'json'; // Parameter type. (参数类型)
  description?: string;     // Optional description. (可选描述)
  defaultValue?: any;       // Optional default value. (可选默认值)
  required?: boolean;       // If the parameter is required. (参数是否必需)
}

interface StartNodeDataProperties {
  flowName?: string;          // Name for this flow. (此流程的名称)
  flowDescription?: string;   // Description of what the flow does. (流程功能的描述)
  inputParameters?: FlowInputParameter[]; // Parameters the flow expects. (流程期望的参数)
}
```
The `node.data.title` is often "Start" or could incorporate `flowName`.

`node.data.title` 通常是"开始"，或者可以包含 `flowName`。

### Canvas Display (画布显示) <a name="canvas-display-start"></a>
-   **Displayed Information (显示信息):**
    -   Typically "Start" or the `flowName`.
    -   Maybe an icon indicating it's the starting point.
-   **Hiding Information (信息隐藏):** `flowDescription` and `inputParameters` details are configured in the sidebar.

### Sidebar Configuration (侧边栏配置) <a name="sidebar-configuration-start"></a>
-   **Fields (字段):**
    -   **Flow Name (流程名称):** Input for `flowName`.
    -   **Flow Description (流程描述):** Textarea for `flowDescription`.
    -   **Input Parameters (输入参数):**
        -   A list editor to define `inputParameters`.
        -   For each parameter: input for `name`, dropdown for `type`, input for `description`, input for `defaultValue`, checkbox for `required`.
        -   "Add Parameter" / "Remove Parameter" buttons.

---
## End Node (结束节点)

### Overview (概述) <a name="overview-end"></a>
The End Node marks the termination of a flow or a branch. It can define output values for the flow.

结束节点标记流程或分支的终止。它可以为流程定义输出值。

### Data Structure (`node.data.properties`) (数据结构) <a name="data-structure-end"></a>
```typescript
interface FlowOutputValue {
  id: string;
  name: string;                 // Name of the output value (e.g., "generatedStory", "characterStatus"). (输出值的名称)
  type: 'string' | 'number' | 'boolean' | 'json'; // Type of the output. (输出类型)
  description?: string;         // Optional description. (可选描述)
  valueSource: string;          // Path to the variable in the flow context that provides this output value (e.g., "nodes.llm_1.data.properties.generatedText", "global.finalOutcome"). (流程上下文中提供此输出值的变量路径)
}

interface EndNodeDataProperties {
  endNodeName?: string;         // Optional name for the end node (e.g., "Successful Completion", "Error Exit"). (可选的结束节点名称)
  flowStatus?: string;          // Optional status to report (e.g., "Success", "Failure"). (可选报告的状态)
  outputValues?: FlowOutputValue[]; // Values the flow outputs. (流程输出的值)
}
```
The `node.data.title` is often "End" or `endNodeName`.

`node.data.title` 通常是"结束"或 `endNodeName`。

### Canvas Display (画布显示) <a name="canvas-display-end"></a>
-   **Displayed Information (显示信息):**
    -   Typically "End" or `endNodeName`.
    -   Maybe an icon indicating it's an endpoint.
-   **Hiding Information (信息隐藏):** `flowStatus` and `outputValues` details are configured in the sidebar.

### Sidebar Configuration (侧边栏配置) <a name="sidebar-configuration-end"></a>
-   **Fields (字段):**
    -   **End Node Name (结束节点名称):** Input for `endNodeName`.
    -   **Flow Status (流程状态):** Input for `flowStatus`.
    -   **Output Values (输出值):**
        -   A list editor to define `outputValues`.
        -   For each output: input for `name`, dropdown for `type`, input for `description`, input for `valueSource` (potentially with a variable picker).
        -   "Add Output" / "Remove Output" buttons.

---
## LLM Node (大语言模型节点)

### Overview (概述) <a name="overview-llm"></a>
The LLM Node interacts with a Large Language Model (e.g., GPT, Claude). It takes a prompt (potentially constructed from various inputs) and outputs the LLM's response.

LLM 节点与大语言模型（例如 GPT、Claude）交互。它接收一个提示（可能由各种输入构成）并输出 LLM 的响应。

### Data Structure (`node.data.properties`) (数据结构) <a name="data-structure-llm"></a>
```typescript
interface LLMParameter {
  name: string;               // Parameter name (e.g., "temperature", "max_tokens"). (参数名称)
  value: any;                 // Parameter value. (参数值)
  type: 'number' | 'string' | 'boolean'; // Value type. (值类型)
}

interface LLMNodeDataProperties {
  llmNodeName?: string;       // Name for this LLM interaction. (此 LLM 交互的名称)
  selectedLLM: string;        // Identifier for the chosen LLM (e.g., "openai_gpt4", "anthropic_claude2"). (所选 LLM 的标识符)
  promptTemplate?: string;    // The prompt template string, can include placeholders like {{variablePath}}. (提示模板字符串，可包含占位符如 {{variablePath}})
  promptFilePath?: string;    // Optional: path to a .txt or .md file containing the prompt. (可选：包含提示的 .txt 或 .md 文件路径)
  parameters?: LLMParameter[];// LLM-specific parameters. (LLM 特定参数)
  inputVariables?: Array<{    // Variables from the flow to inject into the prompt. (从流程中注入提示的变量)
    placeholderName: string;  // e.g., "characterBrief" (将在提示模板中用作 {{characterBrief}})
    variablePath: string;     // e.g., "nodes.character_1.data.properties.characterJSON.summary"
  }>;
  outputVariableName?: string; // Name to store the LLM's response under (e.g., "generatedPlotTwist"). (存储 LLM 响应的名称)
                               // The actual response will be stored like: nodes.this_node_id.data.properties.llmResponse
  llmResponse?: string;       // Stores the last response from the LLM (read-only in sidebar, populated at runtime). (存储 LLM 的最新响应)
  llmConfigFilePath?: string; // Path to a JSON file for LLM settings (model, parameters)
  llmConfigJSON?: Record<string, any>; // Actual LLM config data from file or defaults
}
```
The `node.data.title` could be `llmNodeName` or related to the `selectedLLM`.

`node.data.title` 可以是 `llmNodeName` 或与 `selectedLLM` 相关。

### Canvas Display (画布显示) <a name="canvas-display-llm"></a>
-   **Displayed Information (显示信息):**
    -   `llmNodeName` or "LLM Call".
    -   Maybe an icon for the `selectedLLM`.
    -   A brief summary of the prompt or purpose.
-   **Hiding Information (信息隐藏):** Full `promptTemplate`, `parameters`, `inputVariables`, `outputVariableName`, and `llmResponse` are in the sidebar.

### Sidebar Configuration (侧边栏配置) <a name="sidebar-configuration-llm"></a>
-   **Fields (字段):**
    -   **LLM Node Name (LLM 节点名称):** Input for `llmNodeName`.
    -   **Select LLM (选择 LLM):** Dropdown for `selectedLLM` (populated from system configuration).
    -   **LLM Configuration File (LLM 配置文件):**
        -   Input for `llmConfigFilePath` (e.g., for loading API key, model name, default parameters).
        -   "Browse..." button to load a `.json` config file.
        -   Display of loaded `llmConfigJSON` (perhaps in a read-only JSON viewer or editable fields).
    -   **Prompt (提示):**
        -   Textarea for `promptTemplate`.
        -   (Optional) File input for `promptFilePath` to load prompt from a file.
    -   **Input Variables (输入变量):**
        -   List editor for `inputVariables`. For each: `placeholderName`, `variablePath` (with variable picker).
    -   **Parameters (参数):**
        -   List editor or dynamic fields for `parameters` based on `selectedLLM`'s capabilities (e.g., temperature, max tokens).
    -   **Output Variable Name (输出变量名称):** Input for `outputVariableName`.
    -   **Last Response (最新响应):** Read-only display of `llmResponse`.

### Default Template (e.g., `default-llm-config-template.json`) (默认模板) <a name="default-template-llm"></a>
Could be stored in `./Templates/default-llm-config-template.json`.
-   Provides a default structure for `llmConfigJSON` if no file is loaded.
-   Example:
    ```json
    {
      "model": "default-gpt-model",
      "temperature": 0.7,
      "max_tokens": 500
      // ... other common parameters
    }
    ```

---
## Loop Node (循环节点)

### Overview (概述) <a name="overview-loop"></a>
The Loop Node allows a section of the flow to be executed multiple times. It can iterate over a list of items or run a set number of times. It will have at least two outputs: one for the loop body ("Iterate") and one for when the loop finishes ("End Loop").

循环节点允许流程的一部分执行多次。它可以遍历项目列表或运行设定的次数。它将至少有两个输出：一个用于循环体（"迭代"），一个用于循环结束时（"结束循环"）。

### Data Structure (`node.data.properties`) (数据结构) <a name="data-structure-loop"></a>
```typescript
type LoopType = 'count' | 'forEach';

interface LoopNodeDataProperties {
  loopName?: string;            // Optional name for the loop. (可选的循环名称)
  loopType: LoopType;           // Type of loop. (循环类型)

  // For 'count' type
  iterationCount?: number;      // Number of times to iterate. (迭代次数)
  countVariableName?: string;   // Optional: name for the current iteration index variable (e.g., "loop_index"). (可选：当前迭代索引变量的名称)

  // For 'forEach' type
  listVariablePath?: string;    // Path to the array/list to iterate over (e.g., "nodes.character_loader.data.properties.characters"). (要迭代的数组/列表的路径)
  itemVariableName?: string;    // Name for the current item variable in each iteration (e.g., "current_character"). (每次迭代中当前项变量的名称)
  indexVariableName?: string;   // Optional: name for the current item's index variable (e.g., "item_index"). (可选：当前项索引变量的名称)

  // Runtime state (managed by the execution engine, not typically user-set)
  // currentIteration?: number;
  // currentItem?: any;
}
```
The `node.data.title` could be `loopName` or a summary like "Loop X times" or "For Each item in Y".

`node.data.title` 可以是 `loopName` 或类似"循环 X 次"或"对于 Y 中的每个项目"的摘要。

### Canvas Display (画布显示) <a name="canvas-display-loop"></a>
-   **Displayed Information (显示信息):**
    -   `loopName` or a summary of the loop condition (e.g., "Loop 5 times", "For Each character").
    -   Clearly labeled output handles: "Iterate" (or "Loop Body") and "End Loop".
-   **Hiding Information (信息隐藏):** Specific variable names and paths are configured in the sidebar.

### Sidebar Configuration (侧边栏配置) <a name="sidebar-configuration-loop"></a>
-   **Fields (字段):**
    -   **Loop Name (循环名称):** Input for `loopName`.
    -   **Loop Type (循环类型):** Dropdown to select `loopType` ('Count', 'For Each Item').
    -   **Conditional fields based on `loopType`:**
        -   If 'Count':
            -   **Iteration Count (迭代次数):** Number input for `iterationCount`.
            -   **(Optional) Count Variable Name (计数变量名):** Input for `countVariableName`.
        -   If 'For Each Item':
            -   **List Variable Path (列表变量路径):** Input for `listVariablePath` (with variable picker).
            -   **Item Variable Name (项目变量名):** Input for `itemVariableName`.
            -   **(Optional) Index Variable Name (索引变量名):** Input for `indexVariableName`.

---
## JSON Viewer Node (JSON 查看器节点)

### Overview (概述) <a name="overview-jsonviewer"></a>
The JSON Viewer Node is a utility node used for debugging or inspecting data within the flow. It takes a variable path as input and displays the JSON content of that variable.

JSON 查看器节点是一个实用程序节点，用于调试或检查流程中的数据。它以变量路径作为输入，并显示该变量的 JSON 内容。

### Data Structure (`node.data.properties`) (数据结构) <a name="data-structure-jsonviewer"></a>
```typescript
interface JSONViewerNodeDataProperties {
  viewerTitle?: string;          // Optional title for this viewer instance. (此查看器实例的可选标题)
  dataPath: string;             // Path to the data to be viewed (e.g., "global.settings", "nodes.character_1.data.properties.characterJSON"). (要查看的数据路径)
  maxDepth?: number;             // Optional: maximum depth to expand JSON. (可选：展开 JSON 的最大深度)
  showReadOnly?: boolean;        // Display as read-only (true by default). (是否显示为只读，默认为 true)

  // Displayed JSON (populated at runtime or on demand, not user-set in sidebar)
  // jsonData?: Record<string, any> | Array<any>;
}
```
The `node.data.title` could be `viewerTitle` or "JSON Viewer".

`node.data.title` 可以是 `viewerTitle` 或 "JSON 查看器"。

### Canvas Display (画布显示) <a name="canvas-display-jsonviewer"></a>
-   **Displayed Information (显示信息):**
    -   `viewerTitle` or "JSON Viewer".
    -   A summary of the `dataPath` being watched.
    -   Perhaps a small preview or a button to open a modal/larger view of the JSON.
-   **Hiding Information (信息隐藏):** The full JSON content is typically too large for the canvas node. It would be shown in the sidebar or a modal.

### Sidebar Configuration (侧边栏配置) <a name="sidebar-configuration-jsonviewer"></a>
-   **Fields (字段):**
    -   **Viewer Title (查看器标题):** Input for `viewerTitle`.
    -   **Data Path (数据路径):** Input for `dataPath` (with variable picker).
    -   **Max Depth (最大深度):** (Optional) Number input for `maxDepth`.
    -   **Display Area (显示区域):**
        -   A read-only, formatted JSON viewer component (like `react-json-view` or similar) that displays the content of the variable at `dataPath`.
        -   A "Refresh" button might be needed if the data is expected to change during flow design without re-running.

---

This document provides a foundational design for the nodes. Specific implementations may require adjustments and further details.
本文档为节点提供了基础设计。具体实现可能需要调整和进一步的细节。
