import React, { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Panel,
  ReactFlowProvider,
  type Node,
  type Edge,
  type Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FlowContext } from './FlowContext';
import { Sidebar } from './Sidebar';
import { nodeTypes } from './nodeTypes';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'scene',
    position: { x: 250, y: 100 },
    data: { 
      label: '场景节点',
      sceneName: '序章',
      sceneData: {}
    },
  },
];

const initialEdges: Edge[] = [];

const EditorComponent: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const addNode = useCallback((type: string, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: {
        label: getNodeLabel(type),
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const getNodeLabel = (type: string) => {
    const labels: Record<string, string> = {
      scene: '场景节点',
      character: '角色节点',
      environment: '环境节点',
      world: '世界设定',
      systemPrompt: '系统提示词',
      userPrompt: '用户提示词',
      memory: '记忆节点',
      llm: 'LLM节点',
      styleControl: '文风控制',
    };
    return labels[type] || '未知节点';
  };

  return (
    <FlowContext.Provider value={{ updateNodeData, addNode }}>
      <div className="h-screen flex">
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <MiniMap 
              nodeColor="#374151"
              nodeStrokeWidth={3}
              zoomable
              pannable
            />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1}
              color="#e5e7eb"
            />
            <Panel position="top-left">
              <div className="bg-white rounded-lg shadow-lg p-4 space-y-2">
                <h3 className="font-semibold text-gray-800">节点工具栏</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addNode('scene', { x: Math.random() * 500, y: Math.random() * 500 })}
                    className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    场景
                  </button>
                  <button
                    onClick={() => addNode('character', { x: Math.random() * 500, y: Math.random() * 500 })}
                    className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    角色
                  </button>
                  <button
                    onClick={() => addNode('environment', { x: Math.random() * 500, y: Math.random() * 500 })}
                    className="px-3 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                  >
                    环境
                  </button>
                  <button
                    onClick={() => addNode('systemPrompt', { x: Math.random() * 500, y: Math.random() * 500 })}
                    className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                  >
                    系统提示
                  </button>
                  <button
                    onClick={() => addNode('userPrompt', { x: Math.random() * 500, y: Math.random() * 500 })}
                    className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    用户提示
                  </button>
                  <button
                    onClick={() => addNode('llm', { x: Math.random() * 500, y: Math.random() * 500 })}
                    className="px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                  >
                    LLM
                  </button>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
        <Sidebar selectedNode={selectedNode} />
      </div>
    </FlowContext.Provider>
  );
};

const EditorWithProvider: React.FC = () => {
  return (
    <ReactFlowProvider>
      <EditorComponent />
    </ReactFlowProvider>
  );
};

export default EditorWithProvider;