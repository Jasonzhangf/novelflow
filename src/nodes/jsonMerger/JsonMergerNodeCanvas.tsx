import React, { useEffect } from 'react';
import { NodeRenderProps, useNodeRender, useRefresh } from '@flowgram.ai/free-layout-editor';
import { NodeRenderContext } from '../../context';
import { NodeWrapper } from '../../components/base-node/node-wrapper';
// 使用一个通用占位符图标，后续可以替换
// import iconJsonMergerPlaceholder from '../../assets/icon-default.png';

/**
 * @en Canvas component for the JSON Merger node.
 * @cn JSON合并器节点的画布组件。
 * @param {NodeRenderProps} props - Properties passed by the layout editor.
 * @returns {JSX.Element}
 */
export const JsonMergerNodeCanvas: React.FC<NodeRenderProps> = ({ node }) => {
  const title = (node as any).data?.title || 'JSON Merger / JSON 合并器';
  const nodeId = node.id;

  const refresh = useRefresh();
  const nodeRender = useNodeRender();
  const { form: nodeForm } = nodeRender;

  useEffect(() => {
    const dispose = node.onDataChange(() => {
      refresh();
    });
    return () => {
      dispose.dispose();
    };
  }, [node, refresh]);

  useEffect(() => {
    if (nodeForm) {
      const dispose = nodeForm.onFormValuesChange(() => {
        refresh();
      });
      return () => {
        dispose.dispose();
      };
    }
  }, [nodeForm, refresh]);

  const formValues = nodeForm?.values;
  const currentDataFromForm = formValues || {};
  const currentInputsValuesFromForm = currentDataFromForm?.inputsValues || {};
  
  // 在第一阶段，我们只关心 jsonInput1
  const jsonInput1Data = currentInputsValuesFromForm.jsonInput1;

  let displayData = jsonInput1Data;
  let dataSourceForDisplay = "nodeForm.values.inputsValues.jsonInput1";

  if (jsonInput1Data === undefined) {
    // console.warn(`[JsonMergerNodeCanvas ${nodeId}] jsonInput1 is undefined in nodeForm.values. Checking props.node.data as fallback.`);
    const propsNodeData = (node as any).data;
    const propsNodeInputsValues = propsNodeData?.inputsValues;
    displayData = propsNodeInputsValues?.jsonInput1;
    if (displayData !== undefined) {
      dataSourceForDisplay = "props.node.data.inputsValues.jsonInput1 (fallback)";
    } else {
      dataSourceForDisplay = "nodeForm.values (and props.node.data fallback also undefined for jsonInput1)";
    }
  }

  // console.log(`[JsonMergerNodeCanvas ${nodeId}] --- Rendering Cycle --- Node ID: ${node.id}`);
  // console.log(`[JsonMergerNodeCanvas ${nodeId}] Displaying data from ${dataSourceForDisplay}:`, displayData);

  return (
    <NodeRenderContext.Provider value={nodeRender}>
      <NodeWrapper>
        <div style={{ padding: 10, fontFamily: 'monospace', fontSize: 13, width: '100%', height: '100%', boxSizing: 'border-box', background: '#fff' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{title} (ID: {nodeId})</div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Received JSON Data (jsonInput1) / 接收到的JSON数据 (来自输入 'jsonInput1'):</div>
          <pre style={{ background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 4, padding: 8, minHeight: 40, whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 'calc(100% - 70px)', overflowY: 'auto' }}>
            {typeof displayData === 'string'
              ? displayData
              : (displayData !== undefined && displayData !== null
                  ? JSON.stringify(displayData, null, 2)
                  : 'No JSON data received for jsonInput1 / jsonInput1 未收到JSON数据')}
          </pre>
          {/* 后续将添加合并逻辑和多输入显示 */}
        </div>
      </NodeWrapper>
    </NodeRenderContext.Provider>
  );
};
