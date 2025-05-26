import React, { useState, useEffect, useRef } from 'react';
import { FormRenderProps, useNodeRender } from '@flowgram.ai/free-layout-editor';
import { JsonInputNode } from './jsonInputNode'; // Import the typed node entity

/**
 * @en Renders the form for the JSON Input node's settings panel.
 * @cn 渲染JSON输入节点设置面板的表单。
 * @param props - Properties for rendering the form.
 * @returns {JSX.Element}
 */
export const renderJsonInputForm = (props: FormRenderProps<any>): JSX.Element => {
  // useNodeRender provides access to the current node instance.
  // Typing it with JsonInputNode gives access to custom methods like updateJsonData.
  const { node } = useNodeRender<JsonInputNode>(); 
  const [jsonString, setJsonString] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to initialize and synchronize the textarea with the node's jsonData
  useEffect(() => {
    if (node && node.data && node.data.jsonData) {
      try {
        const currentJsonData = node.data.jsonData;
        // Only update local state if it's different, to avoid cursor jumps and re-renders
        const stringifiedNodeData = JSON.stringify(currentJsonData, null, 2);
        // console.log(`[FormMeta ${node.id}] useEffect - Node data:`, stringifiedNodeData);
        // console.log(`[FormMeta ${node.id}] useEffect - Current textarea:`, jsonString);
        if (jsonString !== stringifiedNodeData) {
          // Check if the current jsonString is valid JSON and represents the same object
          // This is to prevent updates if the user is typing and the node data updates from elsewhere
          // but results in the same logical object (though potentially different string format)
          let currentTextIsEquivalent = false;
          try {
            if (JSON.stringify(JSON.parse(jsonString), null, 2) === stringifiedNodeData) {
              currentTextIsEquivalent = true;
            }
          } catch { /* ignore parse error, means it's not equivalent */ }

          if (!currentTextIsEquivalent) {
            // console.log(`[FormMeta ${node.id}] Discrepancy found. Updating textarea from node data.`);
            setJsonString(stringifiedNodeData);
          }
        }
        if ((currentJsonData as any).error) {
            setError(`Error in JSON data: ${(currentJsonData as any).error}`);
        } else {
            setError(null); // Clear previous errors if data is valid from node
        }
      } catch (e) {
        console.error(`[FormMeta ${node.id}] Error stringifying JSON from node data:`, e);
        setError("Failed to display current JSON data. / 无法显示当前JSON数据。");
        setJsonString("Error: Could not display JSON. / 错误：无法显示JSON。");
      }
    } else if (node) { // Node exists but no jsonData or it's null/undefined
        // console.log(`[FormMeta ${node.id}] No jsonData on node, setting textarea to {}.`);
        if (jsonString !== '{}') {
             setJsonString('{}'); 
        }
        setError(null);
    }
  }, [node, node?.data?.jsonData]); // Dependency on node and its jsonData

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newJsonString = event.target.value;
    setJsonString(newJsonString); // Update textarea content immediately for responsiveness
    try {
      const parsedJson = JSON.parse(newJsonString);
      if (node) {
        node.updateJsonData(parsedJson); // Update the actual node data
      }
      setError(null); // Clear error if JSON is valid
    } catch (e: any) {
      // Don't update node data if JSON is invalid, but show error to user
      setError(`Invalid JSON: ${e.message} / 无效JSON: ${e.message}`);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click(); // Trigger hidden file input
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && node) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const fileContent = e.target?.result as string;
          // setJsonString(fileContent); // Update textarea - this will be handled by node.updateJsonData and useEffect
          const parsedJson = JSON.parse(fileContent);
          node.updateJsonData(parsedJson); // Update node data, which will trigger useEffect to update jsonString
          setError(null);
        } catch (err: any) {
          console.error(`[FormMeta ${node.id}] Error parsing imported JSON file:`, err);
          setError(`Import Error: ${err.message} / 导入错误: ${err.message}`);
          // Optionally, update node with error state: node.updateJsonData({ error: `Import failed: ${err.message}` });
        }
      };
      reader.onerror = () => {
        setError("Failed to read file. / 读取文件失败。");
        console.error(`[FormMeta ${node.id}] FileReader error`);
      };
      reader.readAsText(file, 'UTF-8'); // Specify UTF-8 encoding
    }
    // Reset file input to allow importing the same file again if needed
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleExportClick = () => {
    if (node && node.data && node.data.jsonData) {
      try {
        // Use the jsonString from state if it's valid and represents node.data.jsonData
        // Otherwise, fall back to stringifying node.data.jsonData directly.
        // This ensures exported JSON matches what user sees if they typed valid JSON not yet fully processed by a rapid setData cycle.
        let dataToExport;
        try {
            JSON.parse(jsonString); // check if current jsonString is valid
            dataToExport = jsonString; // if yes, use it
        } catch (e) {
            dataToExport = JSON.stringify(node.data.jsonData, null, 2); // fallback to node data
        }

        const blob = new Blob([dataToExport], { type: 'application/json;charset=utf-8' }); // Ensure UTF-8
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        let filename = "exported_data.json";
        const currentJsonData = node.data.jsonData as any;
        if (typeof currentJsonData === 'object' && currentJsonData !== null) {
            if (currentJsonData.Name && typeof currentJsonData.Name === 'string' && currentJsonData.Name.trim() !== '') {
                filename = `${currentJsonData.Name.replace(/[^a-z0-9\u4e00-\u9fa5_\s-]/gi, '').substring(0,50)}.json`;
            } else if (node.data.title && typeof node.data.title === 'string' && node.data.title.trim() !== 'JSON Input / JSON输入') {
                 filename = `${node.data.title.replace(/[^a-z0-9\u4e00-\u9fa5_\s-]/gi, '').substring(0,50)}.json`;
            }
        }
        a.download = filename.trim() === '.json' ? 'exported_data.json' : filename; // Ensure filename is not just .json

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setError(null);
      } catch (e) {
        console.error(`[FormMeta ${node.id}] Error exporting JSON:`, e);
        setError("Failed to export JSON. / 导出JSON失败。");
      }
    } else {
      setError("No JSON data to export. / 无JSON数据可导出。");
    }
  };

  // Basic styling
  const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: '15px', fontFamily: 'sans-serif' },
    buttonContainer: { marginBottom: '15px', display: 'flex', gap: '10px' },
    button: { 
        padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', 
        backgroundColor: '#f0f0f0', fontSize: '13px' 
    },
    textarea: {
      width: '100%', minHeight: '300px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px',
      fontFamily: 'monospace', fontSize: '13px', boxSizing: 'border-box', whiteSpace: 'pre', overflow: 'auto'
    },
    error: { color: 'red', marginTop: '10px', fontSize: '12px', whiteSpace: 'pre-wrap' },
    label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' },
    helpText: { marginTop: '15px', fontSize: '12px', color: '#555', lineHeight: '1.6' }
  };

  if (!node) {
    return <div style={styles.container}>Loading node data... / 正在加载节点数据...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.buttonContainer}>
        <button onClick={handleImportClick} style={{...styles.button, backgroundColor: '#e0e0e0'}} title="Import JSON from a .json file / 从.json文件导入JSON">
          Import / 导入
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".json,application/json"
          onChange={handleFileChange}
        />
        <button onClick={handleExportClick} style={{...styles.button, backgroundColor: '#e0e0e0'}} title="Export current JSON to a .json file / 将当前JSON导出到.json文件">
          Export / 导出
        </button>
      </div>

      <label htmlFor={`jsonTextArea-${node.id}`} style={styles.label}>JSON Content / JSON内容:</label>
      <textarea
        id={`jsonTextArea-${node.id}`}
        style={styles.textarea}
        value={jsonString}
        onChange={handleTextareaChange}
        placeholder="Enter JSON data here, or import from file. / 在此处输入JSON数据，或从文件导入。"
      />
      {error && <div style={styles.error}>{error}</div>}
      
      <div style={styles.helpText}>
        <p>
          <strong>@en:</strong> Edit JSON directly or use Import/Export. The node's output port `jsonDataOut` will provide this JSON data. The canvas display is a summary.
        </p>
        <p>
          <strong>@cn:</strong> 可直接编辑JSON或使用导入/导出功能。节点的输出端口 `jsonDataOut` 将提供此JSON数据。画布上显示的是摘要信息。
        </p>
      </div>
    </div>
  );
};
