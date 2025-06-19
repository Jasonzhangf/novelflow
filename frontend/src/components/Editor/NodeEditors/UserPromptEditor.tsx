import React, { useState, useRef } from 'react';
import { type Node } from 'reactflow';
import { useFlowContext } from '../FlowContext';
import { JSONEditor } from '../Components/JSONEditor';

interface UserPromptEditorProps {
  node: Node;
}

export const UserPromptEditor: React.FC<UserPromptEditorProps> = ({ node }) => {
  const { updateNodeData } = useFlowContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [promptData, setPromptData] = useState(node.data.promptData || {
    promptName: '用户提示词',
    chapterTitle: '',
    chapterSummary: '',
    content: '',
    chapterType: '正文',
    targetLength: 2000,
    focusPoints: [],
    requirements: [],
    mood: '',
    pacing: 'normal'
  });

  const handleDataChange = (newData: any) => {
    setPromptData(newData);
    updateNodeData(node.id, {
      promptData: newData,
      promptName: newData.promptName,
      chapterTitle: newData.chapterTitle,
      chapterSummary: newData.chapterSummary,
      content: newData.content,
      chapterType: newData.chapterType
    });
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          handleDataChange(jsonData);
        } catch (error) {
          alert('JSON 文件格式错误');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(promptData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${promptData.promptName || 'user-prompt'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateContent = () => {
    const content = `请基于以下信息创作章节内容：

章节标题：${promptData.chapterTitle || '未设置'}
章节概要：${promptData.chapterSummary || '请根据场景和角色信息创作'}

创作要求：
- 章节类型：${promptData.chapterType}
- 目标字数：${promptData.targetLength} 字
- 节奏：${promptData.pacing === 'slow' ? '缓慢推进' : promptData.pacing === 'fast' ? '快速推进' : '正常节奏'}
- 情绪基调：${promptData.mood || '根据场景氛围确定'}

${promptData.focusPoints?.length > 0 ? `重点关注：\n${promptData.focusPoints.map((point: string, i: number) => `${i + 1}. ${point}`).join('\n')}` : ''}

${promptData.requirements?.length > 0 ? `\n特殊要求：\n${promptData.requirements.map((req: string, i: number) => `${i + 1}. ${req}`).join('\n')}` : ''}

请结合前面提供的角色信息、环境设定、场景描述等，创作出符合要求的章节内容。`;

    handleDataChange({ ...promptData, content });
  };

  const addFocusPoint = () => {
    handleDataChange({
      ...promptData,
      focusPoints: [...(promptData.focusPoints || []), '']
    });
  };

  const updateFocusPoint = (index: number, value: string) => {
    const updatedPoints = [...(promptData.focusPoints || [])];
    updatedPoints[index] = value;
    handleDataChange({ ...promptData, focusPoints: updatedPoints });
  };

  const removeFocusPoint = (index: number) => {
    const updatedPoints = (promptData.focusPoints || []).filter((_: any, i: number) => i !== index);
    handleDataChange({ ...promptData, focusPoints: updatedPoints });
  };

  const addRequirement = () => {
    handleDataChange({
      ...promptData,
      requirements: [...(promptData.requirements || []), '']
    });
  };

  const updateRequirement = (index: number, value: string) => {
    const updatedReqs = [...(promptData.requirements || [])];
    updatedReqs[index] = value;
    handleDataChange({ ...promptData, requirements: updatedReqs });
  };

  const removeRequirement = (index: number) => {
    const updatedReqs = (promptData.requirements || []).filter((_: any, i: number) => i !== index);
    handleDataChange({ ...promptData, requirements: updatedReqs });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-dark-text-primary">用户提示词设定</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 bg-dark-input text-dark-text-primary rounded text-sm hover:bg-dark-hover border border-dark-border"
          >
            导入
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-1 bg-dark-input text-dark-text-primary rounded text-sm hover:bg-dark-hover border border-dark-border"
          >
            导出
          </button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJSON}
        accept=".json"
        className="hidden"
      />

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-1">提示词名称</label>
          <input
            type="text"
            value={promptData.promptName || ''}
            onChange={(e) => handleDataChange({ ...promptData, promptName: e.target.value })}
            className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
            placeholder="为该提示词命名"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-1">章节标题</label>
          <input
            type="text"
            value={promptData.chapterTitle || ''}
            onChange={(e) => handleDataChange({ ...promptData, chapterTitle: e.target.value })}
            className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
            placeholder="输入章节标题"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-1">章节概要</label>
          <textarea
            value={promptData.chapterSummary || ''}
            onChange={(e) => handleDataChange({ ...promptData, chapterSummary: e.target.value })}
            className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent h-20 resize-none"
            placeholder="简要描述本章节的主要内容和目标"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">章节类型</label>
            <select
              value={promptData.chapterType || '正文'}
              onChange={(e) => handleDataChange({ ...promptData, chapterType: e.target.value })}
              className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
            >
              <option value="序章">序章</option>
              <option value="正文">正文</option>
              <option value="过渡">过渡章节</option>
              <option value="高潮">高潮章节</option>
              <option value="结尾">结尾章节</option>
              <option value="回忆">回忆章节</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">目标字数</label>
            <input
              type="number"
              min="500"
              max="10000"
              value={promptData.targetLength || 2000}
              onChange={(e) => handleDataChange({ ...promptData, targetLength: parseInt(e.target.value) })}
              className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">节奏控制</label>
            <select
              value={promptData.pacing || 'normal'}
              onChange={(e) => handleDataChange({ ...promptData, pacing: e.target.value })}
              className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
            >
              <option value="slow">缓慢推进</option>
              <option value="normal">正常节奏</option>
              <option value="fast">快速推进</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">情绪基调</label>
            <input
              type="text"
              value={promptData.mood || ''}
              onChange={(e) => handleDataChange({ ...promptData, mood: e.target.value })}
              className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
              placeholder="如：紧张、轻松、神秘"
            />
          </div>
        </div>
      </div>

      {/* 重点关注 */}
      <div className="border-t border-dark-border pt-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-md font-semibold text-dark-text-primary">重点关注</h4>
          <button
            onClick={addFocusPoint}
            className="px-3 py-1 bg-dark-input text-dark-text-primary rounded text-sm hover:bg-dark-hover border border-dark-border"
          >
            添加重点
          </button>
        </div>
        
        {promptData.focusPoints?.map((point: string, index: number) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={point}
              onChange={(e) => updateFocusPoint(index, e.target.value)}
              placeholder="输入需要重点关注的内容"
              className="flex-1 bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
            />
            <button
              onClick={() => removeFocusPoint(index)}
              className="px-3 py-2 bg-dark-input text-dark-text-primary rounded text-sm hover:bg-dark-hover border border-dark-border"
            >
              删除
            </button>
          </div>
        ))}
      </div>

      {/* 特殊要求 */}
      <div className="border-t border-dark-border pt-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-md font-semibold text-dark-text-primary">特殊要求</h4>
          <button
            onClick={addRequirement}
            className="px-3 py-1 bg-dark-input text-dark-text-primary rounded text-sm hover:bg-dark-hover border border-dark-border"
          >
            添加要求
          </button>
        </div>
        
        {promptData.requirements?.map((req: string, index: number) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={req}
              onChange={(e) => updateRequirement(index, e.target.value)}
              placeholder="输入特殊创作要求"
              className="flex-1 bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
            />
            <button
              onClick={() => removeRequirement(index)}
              className="px-3 py-2 bg-dark-input text-dark-text-primary rounded text-sm hover:bg-dark-hover border border-dark-border"
            >
              删除
            </button>
          </div>
        ))}
      </div>

      {/* 提示词内容 */}
      <div className="border-t border-dark-border pt-4">
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">提示词内容</label>
        <textarea
          value={promptData.content || ''}
          onChange={(e) => handleDataChange({ ...promptData, content: e.target.value })}
          className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent h-32 resize-none"
          placeholder="完整的用户提示词内容，可以使用上方的'生成内容'按钮自动生成"
        />
      </div>

      <div className="border-t border-dark-border pt-4">
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">完整JSON数据</label>
        <JSONEditor
          data={promptData}
          onChange={handleDataChange}
          height="300px"
        />
      </div>
    </div>
  );
};