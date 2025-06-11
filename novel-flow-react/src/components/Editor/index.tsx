import { useCallback, useMemo, useContext, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  type Node, // Use type-only import for Node
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
import CharacterForm from './CharacterForm'; // Import the new form component
import defaultCharacterTemplate from '../../../../Templates/default-character-template.json'; // Import the template

const nodeTypes = {
  character: CharacterNode,
  world: WorldNode,
  environment: EnvironmentNode,
  scene: SceneNode,
  llm: LLMNode,
};

const initialNodes = (handleNodeSelect: (node: Node) => void): ReactFlowNode[] => [ // Wrap initialNodes in a function to pass handler
  {
    id: 'char1', // Updated ID
    type: 'character',
    data: {
      label: '角色1',
      version: '1.0',
      characterInfo: defaultCharacterTemplate,
      onClick: handleNodeSelect // Pass the handler
    },
    position: { x: 50, y: 100 },
  },
  {
    id: 'world_1',
    type: 'world',
    data: { label: 'World', version: '1.0', worldInfo: {} },
    position: { x: 50, y: 250 },
  },
  {
    id: 'environment_1',
    type: 'environment',
    data: { label: 'Environment', version: '1.0', environmentInfo: {} },
    position: { x: 50, y: 400 },
  },
  {
    id: 'scene_1',
    type: 'scene',
    data: { label: 'Scene Node' },
    position: { x: 500, y: 250 },
  },
  {
    id: 'llm_1',
    type: 'llm',
    data: { label: 'LLM Node' },
    position: { x: 950, y: 250 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e_char1-scene', source: 'char1', target: 'scene_1', targetHandle: 'character_input_1', markerEnd: { type: MarkerType.ArrowClosed } }, // Updated source ID
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
  // Define handleNodeSelect first
  const handleNodeSelect = useCallback((node: Node) => {
    console.log('[Editor] handleNodeSelect called for node:', node); // Log selection
    setSelectedNode(node);
  }, []); // Dependency array is empty as setSelectedNode is stable

  // Initialize nodes state by calling the initialNodes function with the handler
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes(handleNodeSelect));
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  // Correctly destructure getViewport and setViewport alongside fitView
  const { screenToFlowPosition, fitView, getViewport, setViewport } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null); // State for selected node

  // Fit view on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("[Editor] Calling fitView...");
      fitView({ padding: 0.1, duration: 0 }); // Fit view quickly without animation

      // Immediately get the viewport calculated by fitView
      const currentViewport = getViewport();
      console.log("[Editor] Viewport after fitView:", currentViewport);

      // Set viewport to top-left (0, 0) while keeping the zoom level
      console.log("[Editor] Setting viewport to top-left with zoom:", currentViewport.zoom);
      setViewport({ x: 0, y: 0, zoom: currentViewport.zoom }, { duration: 200 }); // Smooth pan to top-left

    }, 100); // Small delay remains useful
    return () => clearTimeout(timer);
  }, [fitView, getViewport, setViewport]); // Add getViewport and setViewport to dependencies

  // Removed duplicate definition of handleNodeSelect

  // Wrap onNodesChange to reset selected node on delete
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChangeInternal(changes);
      changes.forEach(change => {
        if (change.type === 'remove' && selectedNode?.id === change.id) {
          setSelectedNode(null);
        }
      });
    },
    [onNodesChangeInternal, selectedNode]
  );


  const addCharacterNode = useCallback(() => {
    // Find the highest existing character number to avoid conflicts after deletions
    let maxNum = 0;
    nodes.forEach(n => {
      if (n.type === 'character' && n.id.startsWith('char')) {
        const num = parseInt(n.id.substring(4), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    const nextNum = maxNum + 1;
    const newCharacterId = `char${nextNum}`; // Updated ID generation
    const targetHandleId = `character_input_${nextNum}`; // Ensure target handle ID is unique if needed by SceneNode logic

    const newCharacterNode: ReactFlowNode = {
      id: newCharacterId,
      type: 'character',
      // Adjust position calculation if needed
      position: screenToFlowPosition ? screenToFlowPosition({ x: 100, y: 100 + nextNum * 50 }) : { x: 50, y: 100 + nextNum * 50 }, // Use nextNum for positioning
      data: {
        label: `角色${nextNum}`,
        version: '1.0',
        characterInfo: defaultCharacterTemplate,
        onClick: handleNodeSelect // Pass the handler to new nodes
      },
    };

    // Check if scene_1 exists before adding edge
    const sceneNodeExists = nodes.some(n => n.id === 'scene_1');
    let newEdge: Edge | null = null;
    if (sceneNodeExists) {
       newEdge = {
        id: `e_${newCharacterId}-scene_1`,
        source: newCharacterId,
        target: 'scene_1',
        targetHandle: targetHandleId, // Use dynamic targetHandleId
        markerEnd: { type: MarkerType.ArrowClosed },
      };
    }


    setNodes((nds) => nds.concat(newCharacterNode));
    if (newEdge) {
       setEdges((eds) => addEdge(newEdge as Connection, eds)); // Add edge only if scene exists
    }

  }, [nodes, setNodes, setEdges, screenToFlowPosition, handleNodeSelect]); // Added handleNodeSelect dependency


  // Remove the unused onNodeClick definition
  // const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
  //   console.log('[Editor] onNodeClick triggered for node:', node); // Log when node is clicked
  //   setSelectedNode(node);
  // }, []);

  // Function to update node data from the form
  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId && node.type === 'character') { // Ensure it's a character node
          // Extract the new character name from the imported data, if available
          const newLabel = newData?.['基本信息']?.['姓名']?.Value || node.data.label; // Fallback to existing label

          // Update both characterInfo and the node's label
          return {
            ...node,
            data: {
              ...node.data, // Keep other data like version, onClick
              label: newLabel, // Update the label
              characterInfo: newData // Update the detailed info
            }
          };
        }
        return node;
      })
    );
     // Optionally, update selectedNode state if it's the one being edited
     if (selectedNode?.id === nodeId && selectedNode.type === 'character') {
        const newLabel = newData?.['基本信息']?.['姓名']?.Value || selectedNode.data.label;
        setSelectedNode((prevNode) =>
            prevNode ? { ...prevNode, data: { ...prevNode.data, label: newLabel, characterInfo: newData } } : null
        );
     }
  }, [setNodes, selectedNode]);


  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((els) => addEdge(params, els)),
    [setEdges]
  );

  // Define flowContextValue *before* the return statement
  const flowContextValue = {
    nodes,
    edges,
    onNodesChange, // Use the wrapped version
    onEdgesChange,
    onConnect,
    addCharacterNode
  };

  // Log selectedNode state on each render
  console.log('[Editor] Rendering, selectedNode:', selectedNode);

  return (
    // Use the flowContextValue defined above
    <FlowContext.Provider value={flowContextValue}>
      {/* Main container: Use flex, ensure it takes full height and prevents horizontal overflow */}
      <div style={{ height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden' }}> {/* Added overflow: hidden */}
        {/* ReactFlow container: Use flex: 1 to allow shrinking and growing, add minWidth: 0 */}
        <div style={{ flex: 1, height: '100%', minWidth: 0, position: 'relative' }}> {/* Changed flexGrow to flex, added minWidth, added position relative for Sidebar */}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange} // Use the wrapped version
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            // Restore onPaneClick
            onPaneClick={() => {
              console.log('[Editor] Pane clicked, deselecting node.');
              setSelectedNode(null);
            }}
            // Restore onNodeClick prop and point it to handleNodeSelect, add stopPropagation
            onNodeClick={(event, node) => {
                event.stopPropagation(); // Stop the event from bubbling up to the pane
                handleNodeSelect(node);
            }}
            // Restore default node dragging behavior
          >
            <Background />
            {/* Sidebar moved outside of ReactFlow */}
          </ReactFlow>
          {/* Keep Sidebar absolutely positioned relative to the ReactFlow container */}
           <Sidebar /> {/* Restore Sidebar */}
        </div>
        {/* Right Sidebar for Form */}
        {selectedNode && selectedNode.type === 'character' && (
          // Increase width from 400px to 600px
          <div style={{ width: '600px', height: '100vh', overflowY: 'auto', borderLeft: '1px solid #ccc', padding: '10px', boxSizing: 'border-box' }}> {/* Removed background color */}
             {/* Test Div Removed */}
             <CharacterForm
               key={selectedNode.id} // Use key to force re-render on node change
               nodeId={selectedNode.id}
               // Pass the actual node object to CharacterForm if needed, or just data
               // Assuming CharacterForm only needs initialData, nodeId, updateNodeData, onClose
               initialData={selectedNode.data.characterInfo || defaultCharacterTemplate}
               updateNodeData={updateNodeData}
               onClose={() => { // Wrap onClose for logging
                    console.log('[Editor] Closing form via onClose.')
                    setSelectedNode(null);
               }}
             />
          </div>
        )}
      </div>
    </FlowContext.Provider>
  );
}; // End of Editor component

// The rest of the file remains the same...

const EditorWithProvider = () => (
  <ReactFlowProvider>
    <Editor />
  </ReactFlowProvider>
);

export default EditorWithProvider;
