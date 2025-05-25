import { EditorRenderer, FreeLayoutEditorProvider } from '@flowgram.ai/free-layout-editor';

import '@flowgram.ai/free-layout-editor/index.css';
import './styles/index.css';
import { nodeRegistries } from './nodes';
import { initialData } from './initial-data';
import { useEditorProps } from './hooks';
import { DemoTools } from './components/tools';
import { SidebarProvider, SidebarRenderer } from './components/sidebar';

// 创建全局方法用于检查 Start 节点的变量
// Create global method to check Start node variables
declare global {
  interface Window {
    __debugStartNodeXXXValue: string;
    checkStartNodeValue: () => void;
  }
}

// 将方法挂载到全局，可以随时在控制台中调用
// Mount method to global scope, can be called anytime in console
window.checkStartNodeValue = function() {
  console.log('======================================');
  console.log('‼️ CHECKING START NODE XXX VALUE');
  console.log(`‼️ Window.__debugStartNodeXXXValue = "${window.__debugStartNodeXXXValue || 'undefined'}"`);
  
  // 直接从 initial-data.ts 读取值
  // Read value directly from initial-data.ts
  try {
    const startNode = initialData.nodes.find(n => n.id === 'start_0');
    const xxxValue = startNode?.data?.outputsValues?.xxx;
    console.log(`‼️ From initialData: "${xxxValue || 'undefined'}"`);
    console.log(`‼️ CONTAINS CHINESE: ${xxxValue && /[\u4e00-\u9fa5]/.test(xxxValue)}`);
  } catch (e) {
    console.error('Error checking initial data:', e);
  }
  console.log('======================================');
};

// 在应用加载时检查一次
// Check once when the application loads
setTimeout(() => {
  console.log('‼️ EDITOR LOADED - CHECKING START NODE VALUE:');
  window.checkStartNodeValue();
}, 1000);

export const Editor = () => {
  const editorProps = useEditorProps(initialData, nodeRegistries);
  return (
    <div className="doc-free-feature-overview">
      <FreeLayoutEditorProvider {...editorProps}>
        <SidebarProvider>
          <div className="demo-container">
            <EditorRenderer className="demo-editor" />
          </div>
          <DemoTools />
          <SidebarRenderer />
        </SidebarProvider>
      </FreeLayoutEditorProvider>
    </div>
  );
};
