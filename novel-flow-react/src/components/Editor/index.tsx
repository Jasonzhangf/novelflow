import { useCallback, useMemo, useContext, useRef } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import type { Node as ReactFlowNode, Edge, Connection, OnNodesChange, OnEdgesChange } from 'reactflow';
import 'reactflow/dist/style.css';
import CharacterNode from '../CustomNodes/CharacterNode';
import WorldNode from '../CustomNodes/WorldNode';
import EnvironmentNode from '../CustomNodes/EnvironmentNode';
import SceneNode from '../CustomNodes/SceneNode';
import LLMNode from '../CustomNodes/LLMNode';
import { FlowContext } from './FlowContext';

const initialNodes: ReactFlowNode[] = [
  {
    id: 'character_1',
    type: 'character',
    data: { label: 'Character 1', version: '1.0', characterInfo: {} },
    position: { x: 50, y: 50 },
  },
  {
    id: 'world_1',
    type: 'world',
    data: { label: 'World', version: '1.0', worldInfo: {} },
    position: { x: 50, y: 150 },
  },
  {
    id: 'environment_1',
    type: 'environment',
    data: { label: 'Environment', version: '1.0', environmentInfo: {} },
    position: { x: 50, y: 250 },
  },
  {
    id: 'scene_1',
    type: 'scene',
    data: { label: 'Scene Node' },
    position: { x: 400, y: 150 },
  },
  {
    id: 'llm_1',
    type: 'llm',
    data: { label: 'LLM Node' },
    position: { x: 750, y: 150 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e_char-scene', source: 'character_1', target: 'scene_1', targetHandle: 'character_input_1', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e_world-scene', source: 'world_1', target: 'scene_1', targetHandle: 'world', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e_env-scene', source: 'environment_1', target: 'scene_1', targetHandle: 'environment', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e_scene-llm', source: 'scene_1', target: 'llm_1', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e_llm-scene', source: 'llm_1', target: 'scene_1', targetHandle: 'llm_output', markerEnd: { type: MarkerType.ArrowClosed } },
];

function Sidebar() {
  const { toObject, setNodes, setEdges } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportProject = useCallback(() => {
    const flow = toObject();
    const jsonString = JSON.stringify(flow, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'novelflow-project.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [toObject]);

  const importProject = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const flow = JSON.parse(event.target?.result as string);
      if (flow) {
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
      }
    };
    reader.readAsText(file);
  }, [setNodes, setEdges]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importProject(file);
    }
  };

  return (
    <aside className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
      <button onClick={exportProject} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Export Project
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".json"
      />
      <button onClick={handleImportClick} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
        Import Project
      </button>
    </aside>
  );
}

const Editor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const addCharacterNode = useCallback(() => {
    const characterCount = nodes.filter(n => n.type === 'character').length;
    const newCharacterId = `character_${characterCount + 1}`;
    const targetHandleId = `character_input_${characterCount + 1}`;
    
    const newCharacterNode: ReactFlowNode = {
      id: newCharacterId,
      type: 'character',
      position: { x: 50, y: 50 + characterCount * 100 },
      data: { label: `Character ${characterCount + 1}`, version: '1.0', characterInfo: {} },
    };

    const newEdge: Edge = {
      id: `e_${newCharacterId}-scene_1`,
      source: newCharacterId,
      target: 'scene_1',
      targetHandle: targetHandleId,
      markerEnd: { type: MarkerType.ArrowClosed },
    };

    setNodes((nds) => nds.concat(newCharacterNode));
    setEdges((eds) => eds.concat(newEdge));
  }, [nodes, setNodes, setEdges]);

  const nodeTypes = useMemo(() => ({
    character: CharacterNode,
    world: WorldNode,
    environment: EnvironmentNode,
    scene: SceneNode,
    llm: LLMNode,
  }), []);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((els) => addEdge(params, els)),
    [setEdges]
  );
  
  const flowContextValue = {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addCharacterNode
  };

  return (
    <FlowContext.Provider value={flowContextValue}>
      <div style={{ height: '100vh', width: '100vw' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
        >
          <Background />
          <Sidebar />
        </ReactFlow>
      </div>
    </FlowContext.Provider>
  );
};

const EditorWithProvider = () => (
  <ReactFlowProvider>
    <Editor />
  </ReactFlowProvider>
);

export default EditorWithProvider; 