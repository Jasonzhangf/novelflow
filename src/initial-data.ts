import { FlowDocumentJSON } from './typings';
import { WorkflowNodeType } from './nodes'; // Ensure WorkflowNodeType is imported

export const initialData: FlowDocumentJSON = {
  nodes: [
    {
      id: 'start_0',
      type: WorkflowNodeType.Start, // Use enum for type safety
      meta: {
        position: {
          x: 100,
          y: 200,
        },
      },
      data: {
        title: 'Start / 开始',
        outputs: {
          type: 'object',
          properties: {
            query: { // Default output for start node
              type: 'string',
              default: '',
            },
          },
        },
      },
    },
    {
      id: 'character_0', // New character node
      type: WorkflowNodeType.CHARACTER, // Use enum for type safety
      meta: {
        position: {
          x: 400,
          y: 200,
        },
      },
      data: {
        title: 'Character / 角色',
        // inputs, outputs, properties will be set by onAdd or form initialization
        // For initialData, we can set properties to ensure it's structured for the form.
        // The form's useEffect will merge this with defaultCharacterTemplate.
        properties: {
          characterName: '新角色', // Default name
          characterFilePath: '',
          characterJSON: {
            // Minimal structure, or rely on default template merge in form-meta
            // name: "新角色",
            // age: null,
            // background: { origin: "", occupation: "", history: "" }
            // Let's keep it minimal and let form-meta handle the full default structure.
          }, 
          loadError: '',
        },
        inputsValues: {},
         // Define basic inputs/outputs if needed for direct connection,
         // otherwise, ports might be dynamically added or inferred by the editor.
         // For now, let's assume default ports are handled by the node registration.
      },
    },
    {
      id: 'end_0',
      type: WorkflowNodeType.End, // Use enum for type safety
      meta: {
        position: {
          x: 700,
          y: 200,
        },
      },
      data: {
        title: 'End / 结束',
        inputs: { // Default input for end node
          type: 'object',
          properties: {
            result: {
              type: 'string',
            },
          },
        },
      },
    },
  ],
  edges: [
    {
      sourceNodeID: 'start_0',
      targetNodeID: 'character_0',
      // sourcePortID and targetPortID might be needed if nodes have multiple ports
      // Assuming default output of start connects to default input of character
    },
    {
      sourceNodeID: 'character_0',
      targetNodeID: 'end_0',
      // Assuming default output of character connects to default input of end
    },
  ],
};
