import { nanoid } from 'nanoid';

import { WorkflowNodeType } from '../constants';
import { FlowNodeRegistry } from '../../typings';
// 使用一个通用占位符图标，后续可以替换
import iconJsonMergerPlaceholder from '../../assets/icon-llm.jpg';
import { JsonMergerNodeCanvas } from './JsonMergerNodeCanvas';
import { renderJsonMergerForm } from './form-meta';

let mergerNodeIndex = 0;

/**
 * @en Registry for the JSON Merger node.
 * @cn JSON合并器节点的注册信息。
 */
export const JsonMergerNodeRegistry: FlowNodeRegistry = {
  type: WorkflowNodeType.JSONMERGER, // 假设 WorkflowNodeType.JSONMERGER 已定义或将定义
  name: 'JSON Merger / JSON 合并器',
  info: {
    icon: iconJsonMergerPlaceholder,
    description:
      'Merges multiple JSON inputs into a single JSON output. / 将多个JSON输入合并为单个JSON输出。',
  },
  meta: {
    size: {
      width: 220, // 默认大小，可以调整
      height: 100, // 默认大小
    },
    renderKey: 'JsonMergerNodeCanvasKey', // 指定 renderKey
  },
  formMeta: {
    render: renderJsonMergerForm, // 指定自定义表单渲染器
  },
  canvas: JsonMergerNodeCanvas, // 指定画布组件
  onAdd() {
    mergerNodeIndex++;
    const nodeId = `jsonmerger_${nanoid(5)}`;

    return {
      id: nodeId,
      type: WorkflowNodeType.JSONMERGER,
      data: {
        type: WorkflowNodeType.JSONMERGER,
        title: `JSON Merger ${mergerNodeIndex} / JSON 合并器 ${mergerNodeIndex}`,
        inputs: {
          type: 'object',
          properties: {
            jsonInput1: { // 第一个输入端口
              type: 'object', // 期望接收 JSON 对象
              title: 'JSON Input 1 / JSON 输入 1',
            },
          },
        },
        outputs: {
          type: 'object',
          properties: {
            mergedJsonOutput: { // 输出端口
              type: 'object',
              title: 'Merged Output / 合并输出',
            },
          },
        },
        properties: {}, // 节点自身的可配置属性
        inputsValues: {}, // 存储输入端口的当前值, 初始化为空对象
      },
    };
  },
};
