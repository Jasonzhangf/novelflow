# 如何打通 Start 节点数据流（Flowgram 实践指南）

## 1. 概述

在 Flowgram 流程编排中，Start 节点通常用于定义全局输入变量（如用户输入、初始参数等），这些变量需要能够顺利传递到下游节点（如 LLM、JsonViewer、Character 等），实现数据驱动的流程自动化。

本指南详细说明如何让 Start 节点的输出变量（如 testinput）能够被下游节点正确接收和消费，确保数据流畅通无阻。

---

## 2. Start 节点表单与 outputsValues 写回

### 步骤一：在 Start 节点表单组件中监听并同步 outputsValues

在 `src/nodes/start/form-meta.tsx` 中，使用 `useEffect` 监听表单值变化，并将 `outputsValues` 写回到节点的 `data` 字段：

```tsx
useEffect(() => {
  if (!nodeForm || !node) return;
  const dispose = nodeForm.onFormValuesChange(() => {
    const outputsValues = nodeForm.getValueIn('data.outputsValues');
    if (outputsValues) {
      (node as any).data = {
        ...(node as any).data,
        outputsValues: { ...outputsValues },
      };
      // 如有 flowDocument.updateNode(node) 方法可调用，建议调用
      console.log('[同步] outputsValues 写回 node.data:', outputsValues);
    }
  });
  return () => dispose?.dispose();
}, [nodeForm, node]);
```

**说明：**
- 这样可以保证每次表单输入变化，outputsValues 都会实时同步到节点数据，供服务层和变量系统读取。

---

## 3. 端口 key 命名与连线规范

### 步骤二：统一端口 key，确保数据自动流转

- Start 节点 outputsValues 的 key（如 testinput）要与下游节点输入端口 key（如 jsonDataIn）在连线时一一对应。
- 连线时，务必将 Start 节点的输出端口 testinput 连到下游节点的 jsonDataIn（或其它对应 key）。

**示例：**
- Start 节点 outputsValues: `{ testinput: 'xxx' }`
- JsonViewer 节点 inputsValues: `{ jsonDataIn: 'xxx' }`
- 连线：start_0.testinput → jsonviewer_1.jsonDataIn

---

## 4. 服务层数据流与变量系统

### 步骤三：RunningService/变量系统自动注入

- Flowgram 的服务层（如 RunningService）会自动将 Start 节点的 outputsValues 通过连线注入到下游节点的 inputsValues。
- 只要端口 key 对应，数据会自动流转，无需手动干预。

---

## 5. UI 组件如何读取数据

### 步骤四：下游节点 UI 组件读取 inputsValues

- 在下游节点（如 JsonViewer）的 React 组件中，直接通过 `node.data.inputsValues.jsonDataIn` 获取数据。
- 建议兼容多种路径（如 extInfo），并打印调试日志：

```tsx
const data = (node as any).data || {};
const extInfo = (node as any).getExtInfo ? (node as any).getExtInfo() : {};
const inputsValues = data.inputsValues || extInfo.inputsValues || {};
const jsonData = inputsValues.jsonDataIn;
console.log('【UI调试】完整 node.data:', data);
console.log('【UI调试】完整 node.extInfo:', extInfo);
console.log('【UI调试】inputsValues:', inputsValues, 'jsonDataIn:', jsonData);
```

---

## 6. 常见问题与排查

- **UI 不显示数据？**
  - 检查连线端口 key 是否一一对应。
  - 检查服务层日志，确认数据已注入下游节点。
  - 检查 UI 组件是否兼容 extInfo 路径。
  - 检查组件注册是否正确（canvas 字段）。

---

## 7. 总结

只要保证：
- Start 节点表单 outputsValues 实时写回 node.data
- 连线端口 key 一致
- 下游节点 UI 组件正确读取 inputsValues

即可实现 Start 节点到任意下游节点的数据流畅通。

---

> 本文档适用于 Flowgram Free Layout 场景，适配中英文混合项目，所有输入输出均建议使用 UTF-8。
