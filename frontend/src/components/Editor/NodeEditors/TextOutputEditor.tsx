import React, { useState } from 'react';
import { type Node } from 'reactflow';
import { useFlowContext } from '../FlowContext';
import { useProject } from '../../../hooks/useProject';
import './CharacterEditor.css';

interface TextOutputEditorProps {
  node: Node;
}

export const TextOutputEditor: React.FC<TextOutputEditorProps> = ({ node }) => {
  const { updateNodeData } = useFlowContext();
  const { currentProject } = useProject();
  const [content, setContent] = useState(node.data.content || '');
  const [title, setTitle] = useState(node.data.title || '文本输出');
  const [exportPath, setExportPath] = useState(node.data.exportPath || 'output');
  const [fontSize, setFontSize] = useState(node.data.fontSize || 14);
  const [wordWrap, setWordWrap] = useState(node.data.wordWrap !== false);
  const [showPreview, setShowPreview] = useState(false);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    updateNodeData(node.id, {
      content: newContent,
      title: title,
      exportPath: exportPath,
      fontSize: fontSize,
      wordWrap: wordWrap
    });
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    updateNodeData(node.id, {
      content: content,
      title: newTitle,
      exportPath: exportPath,
      fontSize: fontSize,
      wordWrap: wordWrap
    });
  };

  const handleSettingsChange = (newSettings: any) => {
    updateNodeData(node.id, {
      content: content,
      title: title,
      ...newSettings
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    // 简单的反馈，不使用alert
    const btn = document.activeElement as HTMLButtonElement;
    const originalText = btn?.textContent;
    if (btn) {
      btn.textContent = '已复制!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 1000);
    }
  };

  // 生成智能文件名
  const generateFileName = (customPath?: string) => {
    const projectName = currentProject?.metadata.name || 'UnnamedProject';
    const now = new Date();
    const dateTime = now.toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_');
    const safeName = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    
    if (customPath) {
      return `${customPath}/${projectName}_${safeName}_${dateTime}.txt`;
    }
    return `${projectName}_${safeName}_${dateTime}.txt`;
  };

  const handleExport = () => {
    const fileName = generateFileName();
    const dataStr = content;
    const dataBlob = new Blob([dataStr], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportToPath = () => {
    const fileName = generateFileName(exportPath);
    const dataStr = content;
    const dataBlob = new Blob([dataStr], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('确定要清空所有内容吗？此操作不可撤销。')) {
      handleContentChange('');
    }
  };

  // 统计信息
  const stats = {
    characters: content.length,
    lines: content.split('\n').length,
    words: content.split(/\s+/).filter((word: string) => word.length > 0).length
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h3 className="editor-title">文本输出</h3>
        <div className="editor-actions">
          <button onClick={handleCopy} className="editor-button" disabled={!content}>
            复制
          </button>
          <button onClick={handleExport} className="editor-button" disabled={!content}>
            快速导出
          </button>
          <button onClick={handleExportToPath} className="editor-button" disabled={!content}>
            导出到路径
          </button>
          <button onClick={() => setShowPreview(!showPreview)} className="editor-button editor-button-secondary">
            {showPreview ? '编辑模式' : '预览模式'}
          </button>
        </div>
      </div>

      {/* 统计信息卡片 */}
      <div className="text-stats-card">
        <h4 className="stats-title">文本统计</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">字符数</span>
            <span className="stat-value">{stats.characters}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">行数</span>
            <span className="stat-value">{stats.lines}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">词数</span>
            <span className="stat-value">{stats.words}</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-group">
          <div className="form-group-header">
            <h3>基本设置</h3>
          </div>
          <div className="form-group-content">
            <div className="form-field">
              <label className="form-label">输出标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="form-input"
                placeholder="输入文本输出的标题"
              />
            </div>

            <div className="form-field">
              <label className="form-label">导出路径</label>
              <input
                type="text"
                value={exportPath}
                onChange={(e) => {
                  setExportPath(e.target.value);
                  handleSettingsChange({ exportPath: e.target.value });
                }}
                className="form-input"
                placeholder="output"
              />
              <div className="text-xs text-gray-500 mt-1">
                预览文件名: {generateFileName(exportPath)}
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="form-group-header">
            <h3>编辑器设置</h3>
          </div>
          <div className="form-group-content">
            <div className="form-field">
              <label className="form-label">字体大小: {fontSize}px</label>
              <input
                type="range"
                min="10"
                max="24"
                step="1"
                value={fontSize}
                onChange={(e) => {
                  const newSize = parseInt(e.target.value);
                  setFontSize(newSize);
                  handleSettingsChange({ fontSize: newSize });
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>小 (10px)</span>
                <span>大 (24px)</span>
              </div>
            </div>

            <div className="form-field">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={wordWrap}
                  onChange={(e) => {
                    setWordWrap(e.target.checked);
                    handleSettingsChange({ wordWrap: e.target.checked });
                  }}
                  className="mr-2"
                />
                <span className="form-label">自动换行</span>
              </label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="form-group-header">
            <h3>内容编辑</h3>
          </div>
          <div className="form-group-content">
            {showPreview ? (
              <div 
                className="form-textarea-large"
                style={{ 
                  fontSize: `${fontSize}px`,
                  whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  backgroundColor: '#f8f9fa',
                  border: '2px solid #e9ecef',
                  color: '#212529'
                }}
              >
                {content || '暂无内容...'}
              </div>
            ) : (
              <div className="form-field">
                <textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="form-textarea-large"
                  style={{ 
                    fontSize: `${fontSize}px`,
                    whiteSpace: wordWrap ? 'pre-wrap' : 'pre'
                  }}
                  placeholder="在此编辑输出的文本内容..."
                  rows={25}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};