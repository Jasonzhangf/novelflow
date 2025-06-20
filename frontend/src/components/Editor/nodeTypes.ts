import { type NodeTypes } from 'reactflow';
import { SceneNode } from './Nodes/SceneNode';
import { CharacterNode } from './Nodes/CharacterNode';
import { EnvironmentNode } from './Nodes/EnvironmentNode';
import { LLMNode } from './Nodes/LLMNode';
import { SystemPromptNode } from './Nodes/SystemPromptNode';
import { UserPromptNode } from './Nodes/UserPromptNode';
import { TextOutputNode } from './Nodes/TextOutputNode';
import { WorldNode } from './Nodes/WorldNode';
import { RelationshipNode } from './Nodes/RelationshipNode';

export const nodeTypes: NodeTypes = {
  scene: SceneNode,
  character: CharacterNode,
  environment: EnvironmentNode,
  llm: LLMNode,
  systemPrompt: SystemPromptNode,
  userPrompt: UserPromptNode,
  textOutput: TextOutputNode,
  world: WorldNode,
  relationship: RelationshipNode,
};