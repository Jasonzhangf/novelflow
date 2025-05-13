# 小说生成器记忆系统设计 (Memory System Design)

## 1. 记忆系统概述 (Memory System Overview)

小说生成器记忆系统是整个架构的核心组件之一，负责管理和处理角色的记忆信息，确保角色行为的连贯性和一致性。

### 1.1 记忆系统目标 (Memory System Objectives)

1. **记忆数据管理** (Memory Data Management)
   - 存储和检索角色记忆
   - 维护记忆时间线
   - 支持记忆导入/导出

2. **记忆层次结构** (Memory Hierarchy)
   - 短期记忆：详细且具体的事件记录
   - 长期记忆：概括且抽象的经历总结
   - 核心记忆：塑造角色性格的关键经历

3. **记忆智能压缩** (Memory Intelligent Compression)
   - 基于时间的记忆衰减
   - 基于情感影响的记忆保留
   - 基于事件关联的记忆整合

4. **记忆检索与应用** (Memory Retrieval and Application)
   - 情境相关的记忆提取
   - 记忆影响角色决策和反应
   - 记忆增强叙事连贯性

## 2. 记忆数据模型 (Memory Data Models)

### 2.1 共有属性 (Common Properties)

所有类型的记忆都包含以下基本属性：

```typescript
interface MemoryBase {
  id: string;                // 记忆唯一ID
  characterId: string;       // 所属角色ID
  createdAt: string;         // 记忆创建时间
  updatedAt: string;         // 记忆更新时间
  emotionalImpact: number;   // 情感影响值 (1-10)
  importance: number;        // 重要性 (1-10)
  tags: string[];            // 记忆标签
}
```

### 2.2 短期记忆模型 (Short-term Memory Model)

```typescript
interface ShortTermMemory extends MemoryBase {
  type: 'short-term';
  timestamp: string;         // 事件发生时间
  content: string;           // 事件内容
  location: string;          // 事件地点
  entities: Array<{          // 相关实体
    id: string;              // 实体ID
    name: string;            // 实体名称
    type: 'character' | 'object' | 'location'; // 实体类型
    relationship: string;    // 与主角的关系
    sentiment: number;       // 情感倾向 (-5到+5)
  }>;
  eventType: string;         // 事件类型
  eventOutcome: string;      // 事件结果
  personalReaction: string;  // 个人反应
}
```

### 2.3 长期记忆模型 (Long-term Memory Model)

```typescript
interface LongTermMemory extends MemoryBase {
  type: 'long-term';
  period: {                  // 时间段
    start: string;           // 开始时间
    end: string;             // 结束时间
  };
  summary: string;           // 概括总结
  keyEntities: Array<{       // 关键实体
    id: string;              // 实体ID
    name: string;            // 实体名称
    significance: string;    // 重要性描述
    sentiment: number;       // 整体情感 (-5到+5)
  }>;
  emotionalSignificance: string; // 情感意义
  lessonLearned: string;     // 经验教训
  sourceMemories: string[];  // 源短期记忆IDs
}
```

### 2.4 核心记忆模型 (Core Memory Model)

```typescript
interface CoreMemory extends MemoryBase {
  type: 'core';
  formationPeriod: {         // 形成时期
    start: string;           // 开始时间
    end: string;             // 结束时间
  };
  description: string;       // 详细描述
  impact: {                  // 对人格的影响
    traits: Array<{          // 影响的特质
      trait: string;         // 特质名称
      impact: number;        // 影响程度 (-5到+5)
      description: string;   // 影响描述
    }>;
    beliefs: string[];       // 形成的信念
    values: string[];        // 形成的价值观
  };
  associatedMemories: {      // 关联记忆
    longTerm: string[];      // 长期记忆IDs
    shortTerm: string[];     // 关键短期记忆IDs
  };
}
```

## 3. 记忆处理机制 (Memory Processing Mechanisms)

### 3.1 短期记忆管理 (Short-term Memory Management)

1. **记忆创建流程** (Memory Creation Process)
   - 事件输入 → 实体识别 → 情感分析 → 重要性评估 → 记忆存储
   - 支持手动输入和自动生成两种方式

2. **记忆查询机制** (Memory Query Mechanism)
   - 时间范围查询：根据事件发生时间
   - 实体关联查询：根据相关人物/物品/地点
   - 情感强度查询：根据情感影响程度
   - 关键词查询：根据内容关键词

3. **记忆排序规则** (Memory Sorting Rules)
   - 时间顺序：从近到远或从远到近
   - 重要性顺序：从高到低或从低到高
   - 情感强度顺序：从强到弱或从弱到强
   - 复合排序：多条件组合排序

### 3.2 长期记忆生成 (Long-term Memory Generation)

1. **记忆压缩触发条件** (Memory Compression Triggers)
   ```typescript
   // 时间触发规则
   interface TimeBasedTrigger {
     type: 'time-based';
     thresholdDays: number;     // 短期记忆转长期记忆的天数阈值
     scanFrequency: number;     // 扫描频率(小时)
   }

   // 数量触发规则
   interface CountBasedTrigger {
     type: 'count-based';
     thresholdCount: number;    // 短期记忆条数阈值
     minAge: number;            // 最小记忆年龄(小时)
   }

   // 重要性触发规则
   interface ImportanceBasedTrigger {
     type: 'importance-based';
     importanceThreshold: number; // 重要性阈值
     emotionalThreshold: number;  // 情感影响阈值
   }
   ```

2. **记忆压缩策略** (Memory Compression Strategies)
   - 时间聚类：将同一时间段内的记忆聚合
   - 主题聚类：将相同主题的记忆聚合
   - 实体聚类：围绕特定实体的记忆聚合
   - 混合聚类：结合多种聚类方法

3. **LLM压缩流程** (LLM Compression Process)
   ```
   短期记忆集合 → 预处理(聚类/排序) → 生成压缩提示词 → LLM调用 → 解析响应 → 长期记忆存储
   ```

4. **压缩提示词模板** (Compression Prompt Template)
   ```
   系统提示: 你是一个记忆整合专家，负责将一系列短期记忆事件压缩为有意义的长期记忆概括。保留关键情感影响和重要事件，同时提炼出核心经验和教训。

   输入: 以下是角色{CHARACTER_NAME}在{TIME_PERIOD}期间的一系列记忆:
   {SHORT_TERM_MEMORIES}

   相关背景信息:
   {CHARACTER_BACKGROUND}
   {RELEVANT_RELATIONSHIPS}

   输出要求:
   1. 提供一个简洁的概括，总结这段时期的关键经历
   2. 识别这些事件中的关键人物/物品/地点及其重要性
   3. 描述这些经历的情感意义
   4. 提取角色可能从这些经历中学到的经验教训
   5. 评估这些事件对角色性格和信念的潜在影响
   ```

### 3.3 记忆检索机制 (Memory Retrieval Mechanism)

1. **相关性计算** (Relevance Calculation)
   - 关键词匹配相关性
   - 实体重叠相关性
   - 时间接近相关性
   - 情感关联相关性

2. **检索算法** (Retrieval Algorithms)
   ```typescript
   // 基于上下文的记忆检索请求
   interface MemoryRetrievalRequest {
     currentContext: {
       time: string;             // 当前时间点
       location: string;         // 当前地点
       characters: string[];     // 当前场景中的角色
       topics: string[];         // 当前讨论的话题
       recentEvents: string[];   // 最近发生的事件
     };
     retrievalParams: {
       maxResults: number;       // 最大结果数
       minRelevance: number;     // 最小相关度阈值
       includeShortTerm: boolean;// 包含短期记忆
       includeLongTerm: boolean; // 包含长期记忆
       includeCoreMemory: boolean;// 包含核心记忆
     };
   }
   ```

3. **检索结果处理** (Retrieval Result Processing)
   - 去重合并
   - 时间排序
   - 重要性加权
   - 摘要生成

### 3.4 记忆应用机制 (Memory Application Mechanism)

1. **记忆与性格特质交互** (Memory-Personality Trait Interaction)
   - 特定记忆触发相关性格特质
   - 性格特质影响记忆解释和情感反应
   - 记忆强化或改变性格特质

2. **记忆与决策影响** (Memory-Decision Influence)
   ```typescript
   // 基于记忆的决策影响评估
   interface MemoryDecisionInfluence {
     memoryId: string;           // 相关记忆ID
     decisionContext: string;    // 决策上下文
     suggestedImpact: {
       inclination: number;      // 倾向度 (-5到+5)
       reasoning: string;        // 推理过程
       confidenceLevel: number;  // 置信度 (0-1)
     };
   }
   ```

3. **记忆情感触发** (Memory Emotional Trigger)
   - 相似场景触发历史情感反应
   - 情感强度随时间自然衰减
   - 重复触发可强化或减弱情感反应

## 4. 记忆节点交互设计 (Memory Node Interaction Design)

### 4.1 记忆节点组件 (Memory Node Components)

1. **短期记忆节点** (Short-term Memory Node)
   - 记忆列表展示
   - 记忆创建表单
   - 记忆筛选控件
   - 记忆导入/导出

2. **长期记忆节点** (Long-term Memory Node)
   - 长期记忆概览
   - 压缩规则配置
   - 源记忆追溯
   - 手动压缩触发

3. **记忆检索节点** (Memory Retrieval Node)
   - 上下文输入区
   - 检索参数配置
   - 结果预览区
   - 相关性解释

4. **记忆应用节点** (Memory Application Node)
   - 应用场景定义
   - 记忆权重调整
   - 情感响应预测
   - 决策影响可视化

### 4.2 节点间数据流 (Inter-node Data Flow)

1. **人物-记忆流** (Character-Memory Flow)
   ```
   人物节点 → 短期记忆节点 → 长期记忆节点 → 核心记忆节点
   ```

2. **记忆-提示词流** (Memory-Prompt Flow)
   ```
   记忆检索节点 → 记忆应用节点 → 提示词组装节点 → LLM节点
   ```

3. **反馈循环流** (Feedback Loop Flow)
   ```
   LLM节点 → 记忆创建节点 → 短期记忆节点 → 记忆检索节点 → LLM节点
   ```

### 4.3 节点交互示例 (Node Interaction Examples)

1. **记忆创建交互** (Memory Creation Interaction)
   ```javascript
   // 创建短期记忆的节点交互示例
   const handleCreateMemory = (nodeId, memoryData) => {
     // 验证记忆数据
     if (!validateMemoryData(memoryData)) {
       setNodeError(nodeId, '记忆数据不完整或格式错误');
       return;
     }
     
     // 生成唯一ID
     const memoryId = generateUniqueId();
     
     // 处理情感和重要性评分
     const processedMemory = {
       ...memoryData,
       id: memoryId,
       createdAt: new Date().toISOString(),
       updatedAt: new Date().toISOString(),
       type: 'short-term'
     };
     
     // 添加到节点数据
     updateNodeData(nodeId, (prevData) => ({
       ...prevData,
       memories: [...prevData.memories, processedMemory]
     }));
     
     // 触发下游节点更新
     triggerDownstreamNodes(nodeId);
   };
   ```

2. **记忆压缩交互** (Memory Compression Interaction)
   ```javascript
   // 触发记忆压缩的节点交互示例
   const handleMemoryCompression = async (nodeId, shortTermMemories, llmConfig) => {
     // 设置处理状态
     updateNodeData(nodeId, (prevData) => ({
       ...prevData,
       isProcessing: true,
       error: null
     }));
     
     try {
       // 对记忆进行预处理和聚类
       const memoryGroups = clusterMemories(shortTermMemories);
       
       // 处理每个记忆组
       const longTermMemories = [];
       
       for (const group of memoryGroups) {
         // 生成压缩提示词
         const prompt = generateCompressionPrompt(group);
         
         // 调用LLM服务
         const llmResponse = await callLLMService(llmConfig, prompt);
         
         // 解析LLM响应
         const longTermMemory = parseLLMResponseToLongTermMemory(llmResponse, group);
         
         longTermMemories.push(longTermMemory);
       }
       
       // 更新节点数据
       updateNodeData(nodeId, (prevData) => ({
         ...prevData,
         memories: [...prevData.memories, ...longTermMemories],
         isProcessing: false
       }));
       
       // 触发下游节点更新
       triggerDownstreamNodes(nodeId);
       
     } catch (error) {
       // 处理错误
       updateNodeData(nodeId, (prevData) => ({
         ...prevData,
         isProcessing: false,
         error: error.message
       }));
     }
   };
   ```

3. **记忆检索交互** (Memory Retrieval Interaction)
   ```javascript
   // 记忆检索的节点交互示例
   const handleMemoryRetrieval = (nodeId, context, memories, retrievalParams) => {
     // 设置处理状态
     updateNodeData(nodeId, (prevData) => ({
       ...prevData,
       isProcessing: true,
       error: null
     }));
     
     try {
       // 计算每条记忆的相关性
       const scoredMemories = memories.map(memory => ({
         memory,
         relevanceScore: calculateRelevance(memory, context)
       }));
       
       // 筛选和排序记忆
       const filteredMemories = scoredMemories
         .filter(item => item.relevanceScore >= retrievalParams.minRelevance)
         .sort((a, b) => b.relevanceScore - a.relevanceScore)
         .slice(0, retrievalParams.maxResults);
       
       // 更新节点数据
       updateNodeData(nodeId, (prevData) => ({
         ...prevData,
         retrievedMemories: filteredMemories,
         isProcessing: false
       }));
       
       // 触发下游节点更新
       triggerDownstreamNodes(nodeId);
       
     } catch (error) {
       // 处理错误
       updateNodeData(nodeId, (prevData) => ({
         ...prevData,
         isProcessing: false,
         error: error.message
       }));
     }
   };
   ```

## 5. 记忆系统实现细节 (Memory System Implementation Details)

### 5.1 短期记忆处理流水线 (Short-term Memory Processing Pipeline)

```typescript
// 短期记忆处理流水线
class ShortTermMemoryPipeline {
  // 处理新记忆
  async processNewMemory(rawMemory: Partial<ShortTermMemory>, character: Character): Promise<ShortTermMemory> {
    // 1. 基础信息准备
    const memoryBase = this.prepareMemoryBase(rawMemory, character);
    
    // 2. 实体识别和处理
    const entitiesProcessed = await this.processEntities(rawMemory, character);
    
    // 3. 情感分析
    const emotionProcessed = await this.analyzeEmotionalImpact(
      {...memoryBase, ...entitiesProcessed}, 
      character
    );
    
    // 4. 重要性评估
    const importanceProcessed = await this.assessImportance(
      {...memoryBase, ...entitiesProcessed, ...emotionProcessed}, 
      character
    );
    
    // 5. 事件分类
    const eventTypeProcessed = await this.categorizeEventType(
      {...memoryBase, ...entitiesProcessed, ...emotionProcessed, ...importanceProcessed}, 
      character
    );
    
    // 6. 标签生成
    const tagsProcessed = await this.generateTags(
      {...memoryBase, ...entitiesProcessed, ...emotionProcessed, ...importanceProcessed, ...eventTypeProcessed}, 
      character
    );
    
    // 组合所有处理结果
    const processedMemory: ShortTermMemory = {
      ...memoryBase,
      ...entitiesProcessed,
      ...emotionProcessed,
      ...importanceProcessed,
      ...eventTypeProcessed,
      ...tagsProcessed,
      type: 'short-term'
    };
    
    return processedMemory;
  }
  
  // 各处理步骤的具体实现...
}
```

### 5.2 长期记忆生成算法 (Long-term Memory Generation Algorithm)

```typescript
// 长期记忆生成器
class LongTermMemoryGenerator {
  // 检查是否需要生成长期记忆
  checkCompressionNeeded(shortTermMemories: ShortTermMemory[], rules: CompressionRules): boolean {
    // 检查时间触发条件
    if (rules.timeBasedTrigger.enabled) {
      const oldestAllowedDate = new Date();
      oldestAllowedDate.setDate(oldestAllowedDate.getDate() - rules.timeBasedTrigger.thresholdDays);
      
      const oldMemoriesCount = shortTermMemories.filter(memory => 
        new Date(memory.timestamp) < oldestAllowedDate
      ).length;
      
      if (oldMemoriesCount >= rules.timeBasedTrigger.minCount) {
        return true;
      }
    }
    
    // 检查数量触发条件
    if (rules.countBasedTrigger.enabled && 
        shortTermMemories.length >= rules.countBasedTrigger.thresholdCount) {
      return true;
    }
    
    // 检查重要性触发条件
    if (rules.importanceBasedTrigger.enabled) {
      const significantMemories = shortTermMemories.filter(memory => 
        memory.importance >= rules.importanceBasedTrigger.importanceThreshold ||
        memory.emotionalImpact >= rules.importanceBasedTrigger.emotionalThreshold
      );
      
      if (significantMemories.length >= rules.importanceBasedTrigger.minCount) {
        return true;
      }
    }
    
    return false;
  }
  
  // 将短期记忆聚类
  clusterMemories(memories: ShortTermMemory[]): ShortTermMemory[][] {
    // 按时间分组
    const timeGroups = this.groupByTimeProximity(memories);
    
    // 每个时间组内再按主题/实体分组
    const clusters: ShortTermMemory[][] = [];
    
    for (const timeGroup of timeGroups) {
      const thematicGroups = this.groupByThematicSimilarity(timeGroup);
      clusters.push(...thematicGroups);
    }
    
    return clusters;
  }
  
  // 为记忆集群生成长期记忆
  async generateLongTermMemory(
    memoriesCluster: ShortTermMemory[], 
    character: Character,
    llmConfig: LLMConfig
  ): Promise<LongTermMemory> {
    // 生成压缩提示词
    const prompt = this.createCompressionPrompt(memoriesCluster, character);
    
    // 调用LLM
    const llmResponse = await this.callLLMForCompression(prompt, llmConfig);
    
    // 解析LLM响应
    const parsedResponse = this.parseLLMResponse(llmResponse);
    
    // 创建长期记忆对象
    const longTermMemory: LongTermMemory = {
      id: generateUniqueId(),
      characterId: character.id,
      type: 'long-term',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      period: {
        start: this.findEarliestDate(memoriesCluster),
        end: this.findLatestDate(memoriesCluster)
      },
      summary: parsedResponse.summary,
      keyEntities: parsedResponse.keyEntities,
      emotionalSignificance: parsedResponse.emotionalSignificance,
      lessonLearned: parsedResponse.lessonLearned,
      importance: this.calculateImportance(memoriesCluster, parsedResponse),
      emotionalImpact: this.calculateEmotionalImpact(memoriesCluster, parsedResponse),
      tags: parsedResponse.tags,
      sourceMemories: memoriesCluster.map(memory => memory.id)
    };
    
    return longTermMemory;
  }
  
  // 其他辅助方法...
}
```

### 5.3 记忆检索实现 (Memory Retrieval Implementation)

```typescript
// 记忆检索系统
class MemoryRetrievalSystem {
  // 基于上下文检索记忆
  retrieveMemories(
    character: Character,
    allMemories: (ShortTermMemory | LongTermMemory | CoreMemory)[],
    context: MemoryRetrievalContext,
    params: RetrievalParameters
  ): RankedMemory[] {
    // 根据params筛选记忆类型
    const eligibleMemories = allMemories.filter(memory => {
      if (memory.type === 'short-term' && !params.includeShortTerm) return false;
      if (memory.type === 'long-term' && !params.includeLongTerm) return false;
      if (memory.type === 'core' && !params.includeCoreMemory) return false;
      return true;
    });
    
    // 计算每条记忆的相关性分数
    const scoredMemories = eligibleMemories.map(memory => {
      const relevanceScore = this.calculateRelevanceScore(memory, context, character);
      return {
        memory,
        relevanceScore
      };
    });
    
    // 筛选超过相关性阈值的记忆
    const filteredMemories = scoredMemories
      .filter(item => item.relevanceScore >= params.minRelevance);
    
    // 排序并限制数量
    const rankedMemories = filteredMemories
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, params.maxResults);
    
    return rankedMemories;
  }
  
  // 计算记忆与上下文的相关性分数
  calculateRelevanceScore(
    memory: ShortTermMemory | LongTermMemory | CoreMemory,
    context: MemoryRetrievalContext,
    character: Character
  ): number {
    let score = 0;
    
    // 1. 时间相关性
    score += this.calculateTimeRelevance(memory, context) * 0.15;
    
    // 2. 实体相关性
    score += this.calculateEntityRelevance(memory, context) * 0.30;
    
    // 3. 主题相关性
    score += this.calculateTopicalRelevance(memory, context) * 0.25;
    
    // 4. 情感相关性
    score += this.calculateEmotionalRelevance(memory, context, character) * 0.20;
    
    // 5. 重要性加权
    score *= (0.5 + (memory.importance / 20)); // 重要性最多提升50%相关性
    
    return score;
  }
  
  // 其他相关性计算方法...
}
```

### 5.4 记忆规则引擎 (Memory Rule Engine)

```typescript
// 记忆管理规则引擎
class MemoryRuleEngine {
  // 定期运行规则检查
  async runRuleCheck(character: Character, allMemories: AllMemoryTypes[]) {
    // 1. 检查短期记忆压缩规则
    await this.checkCompressionRules(character, allMemories);
    
    // 2. 检查记忆衰减规则
    await this.applyDecayRules(character, allMemories);
    
    // 3. 检查核心记忆形成规则
    await this.checkCoreMemoryFormation(character, allMemories);
    
    // 4. 检查记忆冲突规则
    await this.resolveMemoryConflicts(character, allMemories);
  }
  
  // 应用记忆衰减规则
  async applyDecayRules(character: Character, allMemories: AllMemoryTypes[]) {
    const shortTermMemories = allMemories.filter(
      memory => memory.type === 'short-term'
    ) as ShortTermMemory[];
    
    // 记忆衰减公式：重要性和情感影响会随时间减弱
    const now = new Date();
    
    for (const memory of shortTermMemories) {
      const memoryDate = new Date(memory.timestamp);
      const daysPassed = Math.floor((now.getTime() - memoryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // 计算衰减系数
      const decayRate = 0.05; // 每天5%的衰减率
      const emotionalDecayFactor = Math.max(0.3, 1 - (decayRate * daysPassed)); // 最多衰减到30%
      
      // 应用衰减
      memory.emotionalImpact = Math.max(
        memory.emotionalImpact * emotionalDecayFactor,
        memory.emotionalImpact * 0.3 // 保留至少30%的初始情感影响
      );
      
      // 重要性衰减较慢
      const importanceDecayFactor = Math.max(0.5, 1 - (decayRate * 0.5 * daysPassed)); // 最多衰减到50%
      memory.importance = Math.max(
        memory.importance * importanceDecayFactor,
        memory.importance * 0.5 // 保留至少50%的初始重要性
      );
      
      // 更新记忆
      await this.memoryStorage.updateMemory(memory);
    }
  }
  
  // 其他规则检查方法...
}
```

## 6. 记忆系统接口 (Memory System Interfaces)

### 6.1 记忆服务API (Memory Service API)

```typescript
// 记忆系统服务接口
interface MemoryService {
  // 短期记忆操作
  createShortTermMemory(characterId: string, memoryData: Partial<ShortTermMemory>): Promise<ShortTermMemory>;
  getShortTermMemories(characterId: string, filters?: MemoryFilters): Promise<ShortTermMemory[]>;
  updateShortTermMemory(memoryId: string, updates: Partial<ShortTermMemory>): Promise<ShortTermMemory>;
  deleteShortTermMemory(memoryId: string): Promise<boolean>;
  
  // 长期记忆操作
  getLongTermMemories(characterId: string, filters?: MemoryFilters): Promise<LongTermMemory[]>;
  updateLongTermMemory(memoryId: string, updates: Partial<LongTermMemory>): Promise<LongTermMemory>;
  deleteLongTermMemory(memoryId: string): Promise<boolean>;
  
  // 记忆压缩操作
  triggerMemoryCompression(characterId: string, memoryIds?: string[]): Promise<LongTermMemory[]>;
  
  // 记忆检索操作
  retrieveRelevantMemories(
    characterId: string, 
    context: MemoryRetrievalContext, 
    params: RetrievalParameters
  ): Promise<RankedMemory[]>;
  
  // 记忆导入/导出
  exportMemories(characterId: string, filters?: MemoryFilters): Promise<AllMemoryTypes[]>;
  importMemories(characterId: string, memories: AllMemoryTypes[]): Promise<number>;
  
  // 规则管理
  getMemoryRules(characterId: string): Promise<MemoryRules>;
  updateMemoryRules(characterId: string, rules: Partial<MemoryRules>): Promise<MemoryRules>;
}
```

### 6.2 记忆UI组件接口 (Memory UI Component Interfaces)

```typescript
// 记忆创建表单属性
interface MemoryCreationFormProps {
  characterId: string;
  onSubmit: (memoryData: Partial<ShortTermMemory>) => void;
  onCancel: () => void;
  initialData?: Partial<ShortTermMemory>;
}

// 记忆列表属性
interface MemoryListProps {
  memories: (ShortTermMemory | LongTermMemory | CoreMemory)[];
  onMemorySelect: (memoryId: string) => void;
  onMemoryEdit?: (memoryId: string) => void;
  onMemoryDelete?: (memoryId: string) => void;
  filterControls?: boolean;
  sortControls?: boolean;
  showMemoryType?: boolean;
}

// 记忆详情属性
interface MemoryDetailProps {
  memory: ShortTermMemory | LongTermMemory | CoreMemory;
  onEdit?: (memoryId: string) => void;
  onDelete?: (memoryId: string) => void;
  onClose: () => void;
  showSourceMemories?: boolean;
  showRelatedEntities?: boolean;
}

// 记忆压缩控制属性
interface MemoryCompressionControlProps {
  characterId: string;
  shortTermMemories: ShortTermMemory[];
  compressionRules: CompressionRules;
  onRulesChange: (rules: Partial<CompressionRules>) => void;
  onCompressionTrigger: (memoryIds?: string[]) => void;
  compressionStatus: 'idle' | 'processing' | 'completed' | 'error';
  compressionError?: string;
}
```

### 6.3 记忆持久化接口 (Memory Persistence Interfaces)

```typescript
// 记忆存储接口
interface MemoryStorage {
  // 基础CRUD操作
  createMemory(memory: AllMemoryTypes): Promise<AllMemoryTypes>;
  getMemoryById(memoryId: string): Promise<AllMemoryTypes | null>;
  updateMemory(memory: Partial<AllMemoryTypes> & { id: string }): Promise<AllMemoryTypes>;
  deleteMemory(memoryId: string): Promise<boolean>;
  
  // 批量操作
  getMemoriesByCharacter(
    characterId: string, 
    filters?: MemoryFilters
  ): Promise<AllMemoryTypes[]>;
  
  bulkCreateMemories(memories: AllMemoryTypes[]): Promise<AllMemoryTypes[]>;
  bulkUpdateMemories(
    updates: Array<Partial<AllMemoryTypes> & { id: string }>
  ): Promise<AllMemoryTypes[]>;
  bulkDeleteMemories(memoryIds: string[]): Promise<number>;
  
  // 记忆导入/导出
  exportMemoriesToJSON(characterId: string, filters?: MemoryFilters): Promise<string>;
  importMemoriesFromJSON(characterId: string, jsonData: string): Promise<AllMemoryTypes[]>;
}

// 记忆过滤器接口
interface MemoryFilters {
  types?: Array<'short-term' | 'long-term' | 'core'>;
  timeRange?: {
    start?: string;
    end?: string;
  };
  entities?: string[];
  tags?: string[];
  minImportance?: number;
  minEmotionalImpact?: number;
  searchText?: string;
  limit?: number;
  offset?: number;
}
```