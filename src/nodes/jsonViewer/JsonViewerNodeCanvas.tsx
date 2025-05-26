console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
console.log('!!!! EXECUTING JsonViewerNodeCanvas.tsx MODULE (TOP LEVEL) !!!!');
console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

import React, { useEffect } from 'react';

import { NodeRenderProps, useNodeRender, useRefresh, WorkflowNodeLinesData } from '@flowgram.ai/free-layout-editor';

// Import NodeWrapper and NodeRenderContext
import { NodeRenderContext } from '../../context';
import { NodeWrapper } from '../../components/base-node/node-wrapper';

// import iconJsonViewerPlaceholder from '../../assets/icon-default.png'; // Placeholder
import iconJsonViewerPlaceholder from '../../assets/icon-llm.jpg'; // Using a common placeholder icon

// 声明一个全局函数来打印 JSON Viewer 节点的输入值
// 这将在控制台中清晰可见
// Declare a global function to print JSON Viewer node input values
// This will be clearly visible in the console
declare global {
  interface Window {
    logJsonViewerInput: (nodeId: string, data: any) => any;
  }
}

(window as any).logJsonViewerInput = function(nodeId: string, data: any) {
  console.log('======================================');
  console.log(`‼️ JSON VIEWER ${nodeId} INPUT VALUE: `, data);
  console.log(`‼️ TYPE: ${typeof data}`);
  if (typeof data === 'string') {
    console.log(`‼️ STRING LENGTH: ${data.length}`);
    console.log(`‼️ CONTAINS CHINESE: ${/[一-\u9fa5]/.test(data)}`); 
    console.log(`‼️ VALUE: "${data}"`);
  } else if (typeof data === 'object' && data !== null) {
    console.log(`‼️ JSON: ${JSON.stringify(data, null, 2)}`);
  }
  console.log('======================================');
  return data;
};

/**
 * @en Canvas component for the JSON Viewer node.
 * @cn JSON查看器节点的画布组件。
 * @param {NodeRenderProps} props - Properties passed by the layout editor。
 * @returns {JSX.Element}
 */
export const JsonViewerNodeCanvas: React.FC<NodeRenderProps> = ({ node }) => {
  console.log(`!!!!!!!!!!!! [JsonViewerNodeCanvas ${node.id}] COMPONENT FUNCTION BODY START !!!!!!!!!!!!!`);
  const title = (node as any).data?.title || 'JSON Viewer / JSON 查看器';
  const nodeId = node.id;

  const refresh = useRefresh();
  const nodeRender = useNodeRender(); // Changed from: const { form: nodeForm, node: renderNodeInstance } = useNodeRender();
  const { form: nodeForm } = nodeRender; // Extract nodeForm from nodeRender

  console.log(`[JsonViewerNodeCanvas ${nodeId}] Using props.node:`, node);
  console.log(`[JsonViewerNodeCanvas ${nodeId}] nodeRender from useNodeRender():`, nodeRender); // Updated log
  console.log(`[JsonViewerNodeCanvas ${nodeId}] nodeForm from nodeRender:`, nodeForm); // Updated log

  useEffect(() => {
    console.log(`[JsonViewerNodeCanvas ${nodeId}] Subscribing to props.node.onDataChange. Node ID: ${node.id}`);
    const dispose = node.onDataChange(() => {
      console.log(`[JsonViewerNodeCanvas ${nodeId}] <<< props.node.onDataChange triggered! Timestamp: ${Date.now()} >>>`);
      const nodeDataAtEventImmediate = (node as any).data;
      const inputsValuesAtEventImmediate = nodeDataAtEventImmediate?.inputsValues;
      const jsonDataInImmediate = inputsValuesAtEventImmediate?.jsonDataIn;
      console.log(`[JsonViewerNodeCanvas ${nodeId}] Immediate props.node.data:`, nodeDataAtEventImmediate ? JSON.stringify(nodeDataAtEventImmediate, null, 2) : 'props.node.data is null/undefined');
      console.log(`[JsonViewerNodeCanvas ${nodeId}] Immediate jsonDataIn from props.node.data:`, jsonDataInImmediate, `(Type: ${typeof jsonDataInImmediate})`);

      setTimeout(() => {
        const nodeDataAfterTimeout = (node as any).data;
        const inputsValuesAfterTimeout = nodeDataAfterTimeout?.inputsValues;
        const jsonDataInAfterTimeout = inputsValuesAfterTimeout?.jsonDataIn;
        console.log(`[JsonViewerNodeCanvas ${nodeId}] props.node.data (after 0ms timeout):`, nodeDataAfterTimeout ? JSON.stringify(nodeDataAfterTimeout, null, 2) : 'props.node.data is null/undefined');
        console.log(`[JsonViewerNodeCanvas ${nodeId}] jsonDataIn from props.node.data (after 0ms timeout):`, jsonDataInAfterTimeout, `(Type: ${typeof jsonDataInAfterTimeout})`);
      }, 0);

      setTimeout(() => {
        const nodeDataAfterTimeout100 = (node as any).data;
        const inputsValuesAfterTimeout100 = nodeDataAfterTimeout100?.inputsValues;
        const jsonDataInAfterTimeout100 = inputsValuesAfterTimeout100?.jsonDataIn;
        console.log(`[JsonViewerNodeCanvas ${nodeId}] props.node.data (after 100ms timeout):`, nodeDataAfterTimeout100 ? JSON.stringify(nodeDataAfterTimeout100, null, 2) : 'props.node.data is null/undefined');
        console.log(`[JsonViewerNodeCanvas ${nodeId}] jsonDataIn from props.node.data (after 100ms timeout):`, jsonDataInAfterTimeout100, `(Type: ${typeof jsonDataInAfterTimeout100})`);
      }, 100);
      
      console.log(`[JsonViewerNodeCanvas ${nodeId}] Calling refresh due to props.node.onDataChange. Node ID: ${node.id}`);
      refresh();
    });
    return () => {
      console.log(`[JsonViewerNodeCanvas ${nodeId}] Unsubscribing from props.node.onDataChange. Node ID: ${node.id}`);
      dispose.dispose();
    };
  }, [node, refresh, nodeId]);

  useEffect(() => {
    if (nodeForm) {
      console.log(`[JsonViewerNodeCanvas ${nodeId}] Subscribing to nodeForm.onFormValuesChange. Node ID: ${node.id}`);
      const dispose = nodeForm.onFormValuesChange(() => {
        console.log(`[JsonViewerNodeCanvas ${nodeId}] <<< nodeForm.onFormValuesChange triggered! Timestamp: ${Date.now()} >>>`);
        const formValuesImmediate = nodeForm.values;
        const formInputsValuesImmediate = formValuesImmediate?.inputsValues;
        const jsonDataInFromFormImmediate = formInputsValuesImmediate?.jsonDataIn;
        console.log(`[JsonViewerNodeCanvas ${nodeId}] Immediate nodeForm.values:`, formValuesImmediate ? JSON.stringify(formValuesImmediate, null, 2) : 'nodeForm.values is null/undefined');
        console.log(`[JsonViewerNodeCanvas ${nodeId}] Immediate jsonDataIn from nodeForm.values:`, jsonDataInFromFormImmediate, `(Type: ${typeof jsonDataInFromFormImmediate})`);

        setTimeout(() => {
          const formValuesAfterTimeout = nodeForm.values;
          const formInputsValuesAfterTimeout = formValuesAfterTimeout?.inputsValues;
          const jsonDataInFromFormAfterTimeout = formInputsValuesAfterTimeout?.jsonDataIn;
          console.log(`[JsonViewerNodeCanvas ${nodeId}] nodeForm.values (after 0ms timeout):`, formValuesAfterTimeout ? JSON.stringify(formValuesAfterTimeout, null, 2) : 'nodeForm.values is null/undefined');
          console.log(`[JsonViewerNodeCanvas ${nodeId}] jsonDataIn from nodeForm.values (after 0ms timeout):`, jsonDataInFromFormAfterTimeout, `(Type: ${typeof jsonDataInFromFormAfterTimeout})`);
        }, 0);

        setTimeout(() => {
          const formValuesAfterTimeout100 = nodeForm.values;
          const formInputsValuesAfterTimeout100 = formValuesAfterTimeout100?.inputsValues;
          const jsonDataInFromFormAfterTimeout100 = formInputsValuesAfterTimeout100?.jsonDataIn;
          console.log(`[JsonViewerNodeCanvas ${nodeId}] nodeForm.values (after 100ms timeout):`, formValuesAfterTimeout100 ? JSON.stringify(formValuesAfterTimeout100, null, 2) : 'nodeForm.values is null/undefined');
          console.log(`[JsonViewerNodeCanvas ${nodeId}] jsonDataIn from nodeForm.values (after 100ms timeout):`, jsonDataInFromFormAfterTimeout100, `(Type: ${typeof jsonDataInFromFormAfterTimeout100})`);
        }, 100);

        console.log(`[JsonViewerNodeCanvas ${nodeId}] Calling refresh due to nodeForm.onFormValuesChange. Node ID: ${node.id}`);
        refresh();
      });
      return () => {
        console.log(`[JsonViewerNodeCanvas ${nodeId}] Unsubscribing from nodeForm.onFormValuesChange. Node ID: ${node.id}`);
        dispose.dispose();
      };
    }
  }, [nodeForm, refresh, nodeId]);

  useEffect(() => {
    let linesDataInstance: any = null;
    if (node && typeof (node as any).get === 'function') {
      try {
        linesDataInstance = (node as any).get(WorkflowNodeLinesData);
        console.log(`[JsonViewerNodeCanvas ${nodeId}] Successfully called node.get(WorkflowNodeLinesData). Instance:`, linesDataInstance);
      } catch (e) {
        console.error(`[JsonViewerNodeCanvas ${nodeId}] Error calling node.get(WorkflowNodeLinesData):`, e);
        return;
      }
    } else {
      console.warn(`[JsonViewerNodeCanvas ${nodeId}] node.get is not a function or node is not available when trying to get WorkflowNodeLinesData.`);
      return;
    }

    if (linesDataInstance) {
      console.log(`[JsonViewerNodeCanvas ${nodeId}] Subscribing to linesDataInstance.onDataChange. Node ID: ${node.id}`);
      const dispose = linesDataInstance.onDataChange(() => {
        console.log(`[JsonViewerNodeCanvas ${nodeId}] <<< linesDataInstance.onDataChange triggered! >>> Calling refresh. Node ID: ${node.id}`);
        refresh();
      });
      return () => {
        console.log(`[JsonViewerNodeCanvas ${nodeId}] Unsubscribing from linesDataInstance.onDataChange. Node ID: ${node.id}`);
        dispose.dispose();
      };
    }
  }, [node, refresh, nodeId]);

  const formValues = nodeForm?.values;
  const currentDataFromForm = formValues || {};

  const currentInputsValuesFromForm = currentDataFromForm?.inputsValues || {};
  const jsonDataToDisplay = currentInputsValuesFromForm.jsonDataIn;

  let finalJsonDataToDisplay = jsonDataToDisplay;
  let dataSourceForDisplay = "nodeForm.values";

  if (jsonDataToDisplay === undefined) {
    console.warn(`[JsonViewerNodeCanvas ${nodeId}] jsonDataIn is undefined in nodeForm.values. Checking props.node.data as fallback.`);
    const propsNodeData = (node as any).data;
    const propsNodeInputsValues = propsNodeData?.inputsValues;
    finalJsonDataToDisplay = propsNodeInputsValues?.jsonDataIn;
    if (finalJsonDataToDisplay !== undefined) {
      dataSourceForDisplay = "props.node.data (fallback)";
    } else {
      dataSourceForDisplay = "nodeForm.values (and props.node.data fallback also undefined)";
    }
  }

  console.log(`[JsonViewerNodeCanvas ${nodeId}] --- Rendering Cycle --- Node ID: ${node.id}`);
  console.log(`[JsonViewerNodeCanvas ${nodeId}] nodeForm.values:`, JSON.stringify(currentDataFromForm, null, 2));
  console.log(`[JsonViewerNodeCanvas ${nodeId}] currentInputsValues from nodeForm.values:`, JSON.stringify(currentInputsValuesFromForm, null, 2));
  console.log(`[JsonViewerNodeCanvas ${nodeId}] Value for jsonDataIn (from ${dataSourceForDisplay}):`, finalJsonDataToDisplay);
  console.log(`[JsonViewerNodeCanvas ${nodeId}] Type of jsonDataIn (from ${dataSourceForDisplay}):`, typeof finalJsonDataToDisplay);

  return (
    <NodeRenderContext.Provider value={nodeRender}>
      <NodeWrapper>
        <div style={{ padding: 10, fontFamily: 'monospace', fontSize: 13, width: '100%', height: '100%', boxSizing: 'border-box', background: '#fff' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{title} (ID: {nodeId})</div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Received JSON Data / 接收到的JSON数据 (from input 'jsonDataIn'):</div>
          <pre style={{ background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 4, padding: 8, minHeight: 40, whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 'calc(100% - 70px)', overflowY: 'auto' }}>
            {typeof finalJsonDataToDisplay === 'string' ? finalJsonDataToDisplay : (finalJsonDataToDisplay !== undefined && finalJsonDataToDisplay !== null ? JSON.stringify(finalJsonDataToDisplay, null, 2) : 'No JSON data received or input value not found / 未收到JSON数据或未找到输入值')}
          </pre>
        </div>
      </NodeWrapper>
    </NodeRenderContext.Provider>
  );
};
