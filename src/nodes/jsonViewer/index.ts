import { nanoid } from 'nanoid';

import { WorkflowNodeType } from '../constants';
import { FlowNodeRegistry, FlowNodeMeta } from '../../typings'; // Assuming these types are in typings
import iconJsonViewerPlaceholder from '../../assets/icon-llm.jpg'; // Using a common placeholder icon
import { JsonViewerNodeCanvas } from './JsonViewerNodeCanvas';
import { renderJsonViewerForm } from './form-meta';

let viewerNodeIndex = 0;

/**
 * @en Registry for the JSON Viewer node.
 * @cn JSON查看器节点的注册信息。
 */
export const JsonViewerNodeRegistry: FlowNodeRegistry = {
  type: WorkflowNodeType.JSONVIEWER,
  info: {
    icon: iconJsonViewerPlaceholder,
    description:
      'Displays incoming JSON data, e.g., from a Character node. / 显示传入的JSON数据，例如来自角色节点的数据。',
  },
  meta: {
    size: {
      width: 200, // Default size, can be adjusted
      height: 80, // Default size
    },
    renderKey: 'JsonViewerNodeCanvasKey',
  },
  formMeta: {
    render: renderJsonViewerForm, // Custom form renderer for settings panel
  },
  onAdd() {
    viewerNodeIndex++;
    const nodeId = `jsonviewer_${nanoid(5)}`;

    return {
      id: nodeId,
      type: WorkflowNodeType.JSONVIEWER,
      data: {
        type: WorkflowNodeType.JSONVIEWER,
        title: `JSON Viewer ${viewerNodeIndex} / JSON 查看器 ${viewerNodeIndex}`,
        inputs: {
          type: 'object',
          properties: {
            jsonDataIn: {
              type: 'object',
              title: 'Input / 输入',
            },
          },
        },
        outputs: {
          type: 'object',
          properties: {
            jsonDataOut: {
              type: 'object',
              title: 'Output / 输出',
            },
          },
        },
        properties: {},
        inputsValues: {},
      },
    };
  },
};
