import React, { useCallback, useState, useEffect, useMemo } from 'react';
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
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FlowContext } from './FlowContext';
import { NodeEditor } from './NodeEditor';
import { NodeToolbar } from './NodeToolbar';
import { nodeTypes } from './nodeTypes';
import { ProjectToolbar } from '../ProjectManager/ProjectToolbar';
import { ProjectList } from '../ProjectManager/ProjectList';
import { useProject } from '../../hooks/useProject';
import { getLayoutedElements } from '../../utils/layout';
import './Editor.css';

const EditorComponent: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showProjectList, setShowProjectList] = useState(false);
  const reactFlowInstance = useReactFlow();
  
  const {
    currentProject,
    saveProject,
    loadProject,
  } = useProject();

  // This effect syncs the editor's state with the central project state
  useEffect(() => {
    if (currentProject) {
      const projectNodes = currentProject.flowData.nodes || [];
      const projectEdges = currentProject.flowData.edges || [];
      
      setNodes(projectNodes);
      setEdges(projectEdges);
      
      // 自动排版并适应视图
      setTimeout(() => {
        if (projectNodes.length > 0) {
          const layoutedNodes = getLayoutedElements(projectNodes, projectEdges, 'TB');
          setNodes(layoutedNodes);
          // 排版后适应视图
          setTimeout(() => {
            reactFlowInstance.fitView();
          }, 50);
        } else if (currentProject.flowData.viewport) {
          reactFlowInstance.setViewport(currentProject.flowData.viewport);
        } else {
          reactFlowInstance.fitView();
        }
      }, 100);
    }
  }, [currentProject, setNodes, setEdges, reactFlowInstance]);

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
            data: { ...node.data, ...newData },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const addNode = useCallback((type: string, position: { x: number; y: number }) => {
    if (type === 'scene' && nodes.some(node => node.type === 'scene')) {
      alert('只能有一个场景节点！');
      return;
    }

    const newNodeId = `${type}-${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      type,
      position,
      data: { label: getNodeLabel(type) },
    };

    setNodes((nds) => [...nds, newNode]);
    
    const sceneNode = nodes.find(node => node.type === 'scene');
    const llmNode = nodes.find(node => node.type === 'llm');
    
    // 根据节点类型设置正确的连接关系
    if (type === 'character' || type === 'environment' || type === 'world') {
      // 角色、环境、世界设定 -> 场景节点
      if (sceneNode) {
        const newEdgeId = `${newNodeId}-${sceneNode.id}`;
        const newEdge = {
          id: newEdgeId,
          source: newNodeId,
          target: sceneNode.id,
          sourceHandle: 'bottom',
          targetHandle: 'top',
        };
        setEdges((eds) => [...eds, newEdge]);
      }
    } else if (type === 'systemPrompt' || type === 'userPrompt') {
      // 系统提示词、用户提示词 -> LLM节点
      if (llmNode) {
        const newEdgeId = `${newNodeId}-${llmNode.id}`;
        const newEdge = {
          id: newEdgeId,
          source: newNodeId,
          target: llmNode.id,
          sourceHandle: 'bottom',
          targetHandle: 'top',
        };
        setEdges((eds) => [...eds, newEdge]);
      }
    } else if (type === 'textOutput') {
      // LLM节点 -> 文本输出节点
      if (llmNode) {
        const newEdgeId = `${llmNode.id}-${newNodeId}`;
        const newEdge = {
          id: newEdgeId,
          source: llmNode.id,
          target: newNodeId,
          sourceHandle: 'bottom',
          targetHandle: 'top',
        };
        setEdges((eds) => [...eds, newEdge]);
      }
    }
    // 场景节点 -> LLM节点的连接已在初始化时设置，新添加的场景节点不需要额外处理
  }, [nodes, setNodes, setEdges]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  const duplicateNode = useCallback((nodeId: string) => {
    const nodeToDuplicate = nodes.find((node) => node.id === nodeId);
    if (!nodeToDuplicate) return;

    const newId = `${nodeToDuplicate.type}-${Date.now()}`;
    const newNode: Node = {
      ...nodeToDuplicate,
      id: newId,
      position: { x: nodeToDuplicate.position.x + 50, y: nodeToDuplicate.position.y + 50 },
      selected: false,
    };

    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes]);

  const handleSaveProject = useCallback(async (
    metadata: { name: string; description?: string; id?: string | null }
  ) => {
    const viewport = reactFlowInstance.getViewport();
    const projectMetadata = {
      ...metadata,
      id: currentProject?.metadata.id,
      name: metadata.name || currentProject?.metadata.name || '未命名项目'
    };
    return await saveProject(nodes, edges, projectMetadata, viewport);
  }, [nodes, edges, reactFlowInstance, saveProject, currentProject]);

  const handleLoadProject = useCallback(async (projectId: string) => {
    await loadProject(projectId);
  }, [loadProject]);

  const getNodeLabel = (type: string) => {
    const labels: Record<string, string> = {
      scene: '场景节点', character: '角色节点', environment: '环境节点',
      world: '世界设定', systemPrompt: '系统提示词', userPrompt: '用户提示词',
      memory: '记忆节点', llm: 'LLM节点', styleControl: '文风控制',
      textOutput: '文本输出',
    };
    return labels[type] || '未知节点';
  };

  const handleProjectSelect = (projectId: string) => {
    handleLoadProject(projectId);
    setShowProjectList(false);
  };

  const handleAutoLayout = useCallback(() => {
    const layoutedNodes = getLayoutedElements(nodes, edges, 'TB');
    setNodes(layoutedNodes);
    // 自动排版后适应视图
    setTimeout(() => {
      reactFlowInstance.fitView();
    }, 100);
  }, [nodes, edges, setNodes, reactFlowInstance]);

  // Memoize nodeTypes to prevent React Flow warning
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  return (
    <FlowContext.Provider value={{ updateNodeData, addNode, deleteNode, duplicateNode }}>
      <div className="editor-layout">
        <ProjectToolbar 
          onProjectLoad={handleLoadProject}
          onSaveProject={handleSaveProject}
          nodes={nodes}
          edges={edges}
          onShowProjectList={() => setShowProjectList(true)}
        />
        <div className="editor-main">
          <div className="react-flow-wrapper">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              onPaneClick={handlePaneClick}
              nodeTypes={memoizedNodeTypes}
              fitView
              minZoom={0.3}
              maxZoom={2}
              attributionPosition="bottom-left"
            >
              <Controls />
              <MiniMap />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
              <Panel position="top-left">
                <NodeToolbar onAddNode={addNode} />
              </Panel>
              <Panel position="top-right">
                <button
                  onClick={handleAutoLayout}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                  title="自动排版节点"
                >
                  自动排版
                </button>
              </Panel>
            </ReactFlow>
          </div>
          
          <NodeEditor
            key={selectedNode ? selectedNode.id : 'no-node-selected'}
            selectedNode={selectedNode}
          />

          {showProjectList && (
            <ProjectList
              isOpen={showProjectList}
              onClose={() => setShowProjectList(false)}
              onProjectSelect={handleProjectSelect}
            />
          )}
        </div>
      </div>
    </FlowContext.Provider>
  );
};

const EditorWithProvider: React.FC = () => (
  <ReactFlowProvider>
    <EditorComponent />
  </ReactFlowProvider>
);

export default EditorWithProvider;