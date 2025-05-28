/**
 * @en Defines the JSON Merger node type.
 * @cn 定义JSON合并器节点类型。
 */
// import { 
//     NodeRuntimeContext, 
//     VariableType, 
//     NodeExecutionEvent, 
//     NodeExecutionEventType 
// } from '@flowgram.ai/free-layout-editor'; // Types not found by linter, using 'any' for now
import { FlowNodeRegistry, FlowNodeJSON, FlowNodeMeta } from '../../typings'; 
import { WorkflowNodeType } from '../constants';
import { JsonMergerNodeCanvas } from './JsonMergerNodeCanvas';
import { JsonMergerNodeSidebar } from './JsonMergerNodeSidebar';
import iconJsonMerger from '../../assets/icon-llm.jpg';

// Define the structure for the node's data.
export interface JsonMergerNodeData { 
  title?: string;
  description?: string;
  inputsValues?: {
    jsonInput1?: any;
  };
  outputsValues?: { 
    mergedJsonData?: any;
  };
}

// Initial data for a new JsonMergerNode
const initialNodeData: JsonMergerNodeData = {
  title: 'JSON Merger / JSON 合并器',
  description: 'Merges a single JSON input (like JSON Viewer). / 合并单个JSON输入（与JSON Viewer一致）',
  inputsValues: {
    jsonInput1: undefined,
  },
  outputsValues: {
    mergedJsonData: undefined,
  },
};

export const jsonMergerNodeDefinition: FlowNodeRegistry = {
  type: WorkflowNodeType.JSONMERGER,
  name: 'JSON Merger / JSON 合并器',
  info: {
    icon: iconJsonMerger,
    description: 'Merges multiple JSON inputs into a single JSON array output. / 将多个JSON输入合并为单个JSON数组输出。',
  },
  meta: { 
    renderKey: 'JsonMergerNodeCanvasKey',
    size: { width: 220, height: 150 },    
    disableSideBar: false,
    defaultPorts: [
      { type: 'input' },
      { type: 'output' }
    ]
  } as FlowNodeMeta, 
  inputs: [
    { name: 'jsonInput1', label: 'JSON Input 1 / JSON输入1', type: 'any' as any, description: 'Single JSON input / 单个JSON输入' },
  ],
  outputs: [
    { name: 'mergedJsonData', label: 'Merged JSON / 合并后的JSON', type: 'object' as any, description: 'Output JSON (same as input) / 输出JSON（与输入一致）' },
  ],
  defaultData: initialNodeData as FlowNodeJSON['data'], 
  canvas: JsonMergerNodeCanvas,
  sidebarComponent: JsonMergerNodeSidebar,
  runtime: {
    onExecutionStart: async (context: any, event?: any) => {
      // @en Output the single input directly (same as JSON Viewer)
      // @cn 直接输出单个输入（与JSON Viewer一致）
      const nodeData = context.getCurrentData();
      const input = nodeData.inputsValues?.jsonInput1;
      let output = input;
      if (typeof input === 'string') {
        try {
          output = JSON.parse(input);
        } catch {}
      }
      context.setOutputValue('mergedJsonData', output, true);
      context.updateNodeData({ outputsValues: { mergedJsonData: output } });
    },
  },
  // Removed astConversion block
};

// console.log('[jsonMergerNode.ts] JSON Merger Node Definition (FlowNodeRegistry) created:', jsonMergerNodeDefinition);
