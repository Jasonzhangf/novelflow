import { createContext, useContext } from 'react';

interface FlowContextType {
  updateNodeData: (nodeId: string, newData: any) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
}

export const FlowContext = createContext<FlowContextType | null>(null);

export const useFlowContext = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlowContext must be used within a FlowProvider');
  }
  return context;
};