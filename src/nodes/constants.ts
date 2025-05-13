export enum WorkflowNodeType {
  Start = 'start',
  End = 'end',
  LLM = 'llm',
  Condition = 'condition',
  Loop = 'loop',
  Comment = 'comment',
  // Novel generator specific node types
  // 小说生成器特定节点类型
  Character = 'character',
  Memory = 'memory',
  ShortTermMemory = 'short-term-memory',
  LongTermMemory = 'long-term-memory',
  Plot = 'plot',
  Scene = 'scene',
  Chapter = 'chapter',
  Prompt = 'prompt',
  Output = 'output',
}

export enum NodeCategory {
  Flow = 'flow',
  Logic = 'logic',
  Character = 'character',
  Memory = 'memory',
  Plot = 'plot',
  Generation = 'generation',
  Output = 'output',
}
