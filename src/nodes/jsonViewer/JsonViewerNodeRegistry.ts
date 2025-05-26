/**
 * @en Registration information for the JSON Viewer node.
 * @cn JSON查看器节点的注册信息。
 */
import { FlowNodeRegistry, FlowNodeJSON } from '../../typings';
import { WorkflowNodeType } from '../constants';
import { JsonViewerNodeCanvas } from './JsonViewerNodeCanvas';
// Assuming form-meta.tsx exports renderJsonViewerForm
import { renderJsonViewerForm } from './form-meta'; 
// @ts-ignore
import iconJsonViewer from '../../assets/icon-json-viewer.png'; // You might need to create/assign an icon. Placeholder: ../../assets/icon-llm.jpg

export const JsonViewerNodeRegistry: FlowNodeRegistry = {
  type: WorkflowNodeType.JSONVIEWER, // Or 'jsonviewer' if that's the string literal type
  name: 'JSON Viewer / JSON 查看器',
  info: {
    description: 'Displays JSON data from an input. / 显示来自输入的JSON数据。',
    icon: iconJsonViewer, 
  },
  canvas: JsonViewerNodeCanvas,
  inputs: [
    {
      key: 'jsonDataIn',
      label: 'JSON Data / JSON数据',
      type: 'object', // Or 'string', depending on what it usually receives
      required: true,
      description: 'The JSON data to be displayed. / 要显示的JSON数据。',
    },
  ],
  outputs: [], // JSON Viewer typically doesn't have outputs
  defaultData: {
    title: 'JSON Viewer / JSON 查看器',
    inputsValues: {
      jsonDataIn: null as any, // Using FlowNodeJSON here for defaultData structure is fine if it matches
    },
  } as FlowNodeJSON['data'], // Cast defaultData to ensure it matches the expected data structure
  // renderNode: JsonViewerNodeCanvas, // For direct canvas component rendering
  meta: {
    renderKey: 'JsonViewerNodeCanvasKey', // For lookup in use-editor-props.tsx
    size: { width: 200, height: 100 }, // Default size
  },
  formMeta: {
    render: renderJsonViewerForm,
  },
  // Add onAdd if necessary, though for a viewer it might not do much beyond default setup
  // onAdd: (): FlowNodeJSON => {
  //   const nodeId = `jsonviewer_${Math.random().toString(36).substring(2, 7)}`;
  //   return {
  //     id: nodeId,
  //     type: WorkflowNodeType.JSONVIEWER,
  //     data: {
  //       title: 'JSON Viewer / JSON 查看器',
  //       inputsValues: { jsonDataIn: null },
  //     },
  //     meta: { title: 'JSON Viewer / JSON 查看器' },
  //     inputs: { 
  //        jsonDataIn: { key: 'jsonDataIn', label: 'JSON Data / JSON数据', type: 'object', required: true } 
  //     },
  //     outputs: {},
  //   };
  // },
};
