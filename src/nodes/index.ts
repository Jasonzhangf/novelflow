import { FlowNodeRegistry } from '../typings';
import { StartNodeRegistry } from './start';
import { LoopNodeRegistry } from './loop';
import { LLMNodeRegistry } from './llm';
import { JsonViewerNodeRegistry } from './jsonViewer';
import { EndNodeRegistry } from './end';
import { WorkflowNodeType } from './constants';
import { ConditionNodeRegistry } from './condition';
import { CommentNodeRegistry } from './comment';
import { CharacterNodeRegistry } from './character';
import { jsonMergerNodeDefinition } from './jsonMerger/jsonMergerNode';
export { WorkflowNodeType } from './constants';

export const nodeRegistries: FlowNodeRegistry[] = [
  ConditionNodeRegistry,
  StartNodeRegistry,
  EndNodeRegistry,
  LLMNodeRegistry,
  LoopNodeRegistry,
  CommentNodeRegistry,
  CharacterNodeRegistry,
  JsonViewerNodeRegistry,
  jsonMergerNodeDefinition,
];

export const visibleNodeRegistries = nodeRegistries.filter(
  (r) => r.type !== WorkflowNodeType.Comment
);
