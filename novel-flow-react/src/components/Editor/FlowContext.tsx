import { createContext } from 'react';
import type { Node as ReactFlowNode, Edge, OnNodesChange, OnEdgesChange, OnConnect } from 'reactflow';

interface FlowContextType {
  nodes: ReactFlowNode[];
  edges: Edge[];
  addCharacterNode: () => void;
}

export const FlowContext = createContext<FlowContextType | null>(null); 