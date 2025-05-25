# 变量数据流：从start节点到LLM节点

## 概述 | Overview

在Flowgram应用中，从start节点定义的变量（如"query"）到LLM节点的数据流是一个关键流程。本文档详细说明了如何在运行时捕获并使用start节点中定义的查询值，特别是在模拟运行过程中。

*In Flowgram applications, the data flow from variables defined in the start node (such as "query") to the LLM node is a critical process. This document provides a detailed explanation of how to capture and utilize the query value defined in the start node during runtime, especially during simulation.*

## 实现方案 | Implementation Approach

我们的解决方案集中在RunningService服务中，通过以下步骤实现：

*Our solution focuses on the RunningService service, implemented through the following steps:*

### 1. 存储查询值 | Storing the Query Value

在RunningService中，我们添加了一个专用字段来存储start节点的查询值：

*In RunningService, we added a dedicated field to store the query value from the start node:*

```typescript
export class RunningService implements BaseService {
  private _nodes: HTMLElement[] = [];
  private _edges: HTMLElement[] = [];
  private _startNodeQueryValue: string = 'Hello Flow.'; // 默认值 | Default value
  
  // 其他服务代码 | Other service code
}
```

### 2. 捕获查询值 | Capturing the Query Value

当开始运行模拟时，我们从start节点获取查询值：

*When starting the simulation, we retrieve the query value from the start node:*

```typescript
public async startRun() {
  // 获取当前文档中的所有节点和边 | Get all nodes and edges in the current document
  const { nodes, edges } = await this._getFlowElements();
  
  // 寻找start节点 | Find the start node
  const startNode = nodes.find(node => node.id.startsWith('start_'));
  
  if (startNode) {
    // 从节点数据中获取查询值 | Get query value from node data
    const formData = startNode.data?.formData || {};
    const queryActualValue = formData.query?.value;
    const queryDefaultValue = formData.query?.default;
    
    // 存储查询值，优先使用实际值，其次是默认值，最后是硬编码的默认值
    // Store query value, prioritizing actual value, then default value, finally the hardcoded default
    this._startNodeQueryValue = queryActualValue || queryDefaultValue || 'Hello Flow.';
  }
  
  // 继续处理流程 | Continue processing the flow
  await this._processFlow(nodes, edges);
}
```

### 3. 在LLM节点中使用查询值 | Using the Query Value in LLM Node

当处理到LLM节点时，我们使用存储的查询值：

*When processing the LLM node, we use the stored query value:*

```typescript
private async _processNode(node: FlowNodeEntity) {
  // 获取节点类型 | Get node type
  const nodeType = node.id.split('_')[0];
  
  // 处理不同类型的节点 | Handle different node types
  switch (nodeType) {
    case 'llm':
      // 打印并使用start节点的查询值 | Log and use the query value from start node
      console.log('Processing LLM node with query:', this._startNodeQueryValue);
      
      // 创建包含查询值的prompt | Create prompt with query value
      const prompt = `User query: ${this._startNodeQueryValue}\nPlease respond to this query.`;
      
      // 使用prompt进行LLM处理 | Process with LLM using the prompt
      await this._procesLLMRequest(node, prompt);
      break;
      
    // 其他节点类型处理 | Other node type processing
  }
}
```

### 4. 确保变量可用性 | Ensuring Variable Availability

为确保变量在整个流程中可用，我们在sync-variable-plugin中进行了修改：

*To ensure variable availability throughout the flow, we modified the sync-variable-plugin:*

```typescript
// 在sync-variable-plugin.ts中 | In sync-variable-plugin.ts

// 在创建ASTStringNode后设置默认值和值 | Set default value and value after creating ASTStringNode
export function createSyncVariablePlugin() {
  return (flowDocument: FlowDocument) => {
    flowDocument.onNodeCreate(({ node }) => {
      const variableData = node.getData<FlowNodeVariableData>(FlowNodeVariableData);
      
      // 对于start节点 | For start nodes
      if (node.id.startsWith('start_')) {
        const formData = node.data?.formData || {};
        
        // 如果有query字段 | If there's a query field
        if (formData.query) {
          const defaultValue = formData.query.default || 'Hello Flow.';
          
          // 创建具有默认值的字符串变量 | Create string variable with default value
          const stringNode = ASTFactory.createString();
          
          // 设置默认值和当前值 | Set default value and current value
          stringNode.default = defaultValue;
          stringNode.value = formData.query.value || defaultValue;
          
          // 设置变量 | Set variable
          variableData.setVar(
            ASTFactory.createVariableDeclaration({
              meta: {
                title: 'Query',
              },
              key: `query_${node.id}`,
              type: stringNode,
              // 确保value和default属性被设置 | Ensure value and default properties are set
              value: formData.query.value || defaultValue,
              default: defaultValue,
            })
          );
        }
      }
    });
  };
}
```

## 实现效果 | Implementation Results

通过上述实现，我们成功地：

*Through the above implementation, we successfully:*

1. 捕获了start节点中定义的query值（无论是默认值还是用户设置的值）
   *Captured the query value defined in the start node (whether default or user-set)*

2. 在RunningService中存储了这个值，使其在整个模拟过程中可用
   *Stored this value in RunningService, making it available throughout the simulation process*

3. 在处理LLM节点时能够访问并使用这个值
   *Accessed and utilized this value when processing the LLM node*

4. 确保了即使在变量系统中没有正确配置的情况下，也能通过降级机制获取到query值
   *Ensured that even without proper configuration in the variable system, the query value could be obtained through a fallback mechanism*

## 最佳实践 | Best Practices

在Flowgram中处理节点间变量传递时，建议：

*When handling variable passing between nodes in Flowgram, it is recommended to:*

1. 在服务中明确存储关键变量，便于跨节点访问
   *Explicitly store key variables in services for cross-node access*

2. 实现多层次的降级策略（实际值 → 默认值 → 硬编码值）
   *Implement multi-level fallback strategies (actual value → default value → hardcoded value)*

3. 在处理节点时打印关键变量值，便于调试
   *Print key variable values when processing nodes for easier debugging*

4. 在sync-variable-plugin中确保变量的type、value和default属性都被正确设置
   *Ensure that the type, value, and default properties of variables are all correctly set in the sync-variable-plugin*

5. 考虑变量的生命周期，从定义、输出到消费的全过程
   *Consider the entire lifecycle of variables, from definition and output to consumption*

这种方法确保了在Flowgram应用中，从start节点到LLM节点的数据流可靠且可预测。

*This approach ensures that in Flowgram applications, the data flow from start nodes to LLM nodes is reliable and predictable.*