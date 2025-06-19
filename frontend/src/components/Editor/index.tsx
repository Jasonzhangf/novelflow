import React, { useCallback, useState, useEffect } from 'react';
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
import { getInitialNodes, getInitialEdges } from '../../utils/initialLayout';
import './Editor.css';

const initialNodes: Node[] = getInitialNodes();
const initialEdges: Edge[] = getInitialEdges();

const EditorComponent: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showProjectList, setShowProjectList] = useState(false);
  
  const [showNodeToolbar, setShowNodeToolbar] = useState(true);
  const [defaultProjectId, setDefaultProjectId] = useState<string | null>(null);
  const reactFlowInstance = useReactFlow();
  
  const {
    saveProject,
    loadProject,
  } = useProject();

  // 初始化默认项目和视图
  useEffect(() => {
    const initializeDefaultProject = async () => {
      try {
        // 设置合适的初始视图
        reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 0.8 });
        
        const viewport = reactFlowInstance.getViewport();
        const projectId = await saveProject(initialNodes, initialEdges, {
          name: '未命名项目',
          description: '默认项目'
        }, viewport);
        setDefaultProjectId(projectId);
      } catch (error) {
        console.error('Failed to initialize default project:', error);
      }
    };

    // 延迟执行，确保ReactFlow实例完全初始化
    const timer = setTimeout(initializeDefaultProject, 100);
    return () => clearTimeout(timer);
  }, [reactFlowInstance, saveProject]);

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
    // 检查是否已有场景节点（场景节点唯一性）
    if (type === 'scene') {
      const existingSceneNode = nodes.find(node => node.type === 'scene');
      if (existingSceneNode) {
        alert('只能有一个场景节点！');
        return;
      }
    }

    const newNodeId = `${type}-${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      type,
      position,
      data: {
        label: getNodeLabel(type),
      },
    };

    // 查找场景节点
    const sceneNode = nodes.find(node => node.type === 'scene');
    
    setNodes((nds) => [...nds, newNode]);

    // 自动连接逻辑
    if (sceneNode && type !== 'scene') {
      const newEdgeId = `${newNodeId}-${sceneNode.id}`;
      let newEdge;

      if (type === 'llm') {
        // LLM节点：从场景节点输出连接到LLM输入
        newEdge = {
          id: newEdgeId,
          source: sceneNode.id,
          target: newNodeId,
          sourceHandle: 'bottom',
          targetHandle: 'top',
        };
      } else {
        // 其他节点：从新节点输出连接到场景节点输入
        newEdge = {
          id: newEdgeId,
          source: newNodeId,
          target: sceneNode.id,
          sourceHandle: 'bottom',
          targetHandle: 'top',
        };
      }

      setEdges((eds) => [...eds, newEdge]);
    }
  }, [setNodes, setEdges, nodes]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const duplicateNode = useCallback((nodeId: string) => {
    const nodeToDuplicate = nodes.find((node) => node.id === nodeId);
    if (!nodeToDuplicate) return;

    const newId = `${nodeToDuplicate.type}-${Date.now()}`;
    const newNode: Node = {
      ...nodeToDuplicate,
      id: newId,
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50,
      },
      selected: false,
    };

    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes]);

  const handleSaveProject = useCallback(async (
    metadata: { name: string; description?: string; id?: string }
  ) => {
    const viewport = reactFlowInstance.getViewport();
    // 如果没有提供id，使用默认项目ID
    const projectMetadata = {
      ...metadata,
      id: metadata.id || defaultProjectId || undefined,
      name: metadata.name || '未命名项目'
    };
    return await saveProject(nodes, edges, projectMetadata, viewport);
  }, [nodes, edges, reactFlowInstance, saveProject, defaultProjectId]);

  const handleLoadProject = useCallback(async (projectId: string) => {
    const project = await loadProject(projectId);
    if (project) {
      setNodes(project.flowData.nodes);
      setEdges(project.flowData.edges);
      if (project.flowData.viewport) {
        reactFlowInstance.setViewport(project.flowData.viewport);
      }
    }
  }, [loadProject, setNodes, setEdges, reactFlowInstance]);

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
      textOutput: '文本输出',
    };
    return labels[type] || '未知节点';
  };

  const handleProjectSelect = (projectId: string) => {
    handleLoadProject(projectId);
    setShowProjectList(false);
  };

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
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{
                padding: 0.2,
                includeHiddenNodes: false,
                minZoom: 0.5,
                maxZoom: 1.5,
              }}
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
              minZoom={0.3}
              maxZoom={2}
              attributionPosition="bottom-left"
            >
              <Controls />
              <MiniMap 
                nodeColor={(n) => n.data?.color || '#ff0072'}
                style={{ backgroundColor: '#2D3748' }}
              />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
              
              {showNodeToolbar && (
                <Panel position="top-left">
                  <NodeToolbar onAddNode={addNode} />
                </Panel>
              )}
            </ReactFlow>
          </div>
          {selectedNode && (
            <NodeEditor
              key={selectedNode.id}
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onDelete={deleteNode}
              onDuplicate={duplicateNode}
            />
          )}
        </div>
        
        <ProjectList
          isOpen={showProjectList}
          onClose={() => setShowProjectList(false)}
          onProjectSelect={handleProjectSelect}
        />
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