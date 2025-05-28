import React, { useEffect, useState } from 'react';
import { FormRenderProps, FlowNodeJSON, useNodeRender } from '@flowgram.ai/free-layout-editor';

/**
 * @en Renders the form for the JSON Merger node's settings panel.
 * @cn 渲染JSON合并器节点设置面板的表单。
 * @param props - Properties for rendering the form, includes the form model.
 * @returns {JSX.Element}
 */
export const renderJsonMergerForm = (props: FormRenderProps<FlowNodeJSON>): JSX.Element => {
  const { form: formInstance } = useNodeRender();
  const [displayJson, setDisplayJson] = useState('');

  useEffect(() => {
    if (!formInstance) {
      setDisplayJson('Form not available / 表单不可用');
      return;
    }

    const updateAndFormatDisplayJson = () => {
      // 在第一阶段，我们只关心 jsonInput1
      const dataToDisplay = formInstance.getValueIn('inputsValues.jsonInput1');

      let formattedJson = '';
      if (dataToDisplay !== undefined && dataToDisplay !== null) {
        try {
          if (typeof dataToDisplay === 'string') {
            try {
              JSON.parse(dataToDisplay);
              formattedJson = JSON.stringify(JSON.parse(dataToDisplay), null, 2);
            } catch (e) {
              formattedJson = dataToDisplay;
            }
          } else {
            formattedJson = JSON.stringify(dataToDisplay, null, 2);
          }
        } catch (error) {
          formattedJson = 'Error formatting JSON / JSON格式化错误';
        }
      } else {
        formattedJson = 'No JSON data received for jsonInput1 / jsonInput1 未收到JSON数据';
      }
      setDisplayJson(formattedJson);
    };

    updateAndFormatDisplayJson();

    const dispose = formInstance.onFormValuesChange(() => {
      updateAndFormatDisplayJson();
    });

    return () => {
      dispose.dispose();
    };
  }, [formInstance]);

  const preStyle: React.CSSProperties = {
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    padding: '10px',
    borderRadius: '4px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    maxHeight: '400px',
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '13px',
  };

  const containerStyle: React.CSSProperties = {
    padding: '10px',
  };

  const labelStyle: React.CSSProperties = {
    marginBottom: '8px',
    display: 'block',
    fontWeight: 'bold',
    fontSize: '14px',
  };

  return (
    <div style={containerStyle}>
      <label htmlFor="json-merger-display" style={labelStyle}>
        Received JSON Data (jsonInput1) / 接收到的JSON数据 (来自输入 'jsonInput1'):
      </label>
      <pre id="json-merger-display" style={preStyle}>
        {displayJson}
      </pre>
      {/* 
        @en This panel will show merged data in later stages.
        @cn 后续阶段此面板将显示合并后的数据。
      */}
    </div>
  );
};
