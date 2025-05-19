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
  type: WorkflowNodeType.JSON_VIEWER,
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
  },
  render: JsonViewerNodeCanvas, // Custom canvas renderer
  formMeta: {
    render: renderJsonViewerForm, // Custom form renderer for settings panel
  },
  onAdd() {
    viewerNodeIndex++;
    const nodeId = `json_viewer_${nanoid(5)}`;

    return {
      id: nodeId,
      type: WorkflowNodeType.JSON_VIEWER,
      data: {
        title: `JSON Viewer ${viewerNodeIndex} / JSON 查看器 ${viewerNodeIndex}`,
        inputs: {
          type: 'object', // Defines the overall input structure type
          properties: {
            jsonDataIn: {
              // Name of the input port
              type: 'object', // Expects an object (JSON)
              title: 'JSON Data In / JSON数据输入',
              // No specific schema here means it accepts any object structure
            },
          },
        },
        outputs: {
          type: 'object',
          properties: {
            // This node primarily displays, but could pass through the JSON if needed
            // jsonDataOut: {
            //   type: 'object',
            //   title: 'JSON Data Out / JSON数据输出'
            // }
          },
        },
        properties: {
          // No specific editable properties for the viewer itself needed in this simple version
          // content: {} // Could store the last received JSON here if needed for other purposes
        },
        inputsValues: {
          // jsonDataIn will be populated by the workflow engine when a connection is made
        },
      },
    };
  },
};
