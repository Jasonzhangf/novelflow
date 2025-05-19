import React, { useCallback } from 'react';
import { useClientContext, getNodeForm, FlowNodeEntity } from '@flowgram.ai/free-layout-editor';
import { Button, Badge, Toast } from '@douyinfe/semi-ui';
import { IconSave } from '@douyinfe/semi-icons';

/**
 * Save and persist to localStorage (本地持久化保存)
 * This button saves the current workflow to localStorage so it is restored on refresh.
 * 该按钮将当前工作流保存到localStorage，刷新后自动恢复。
 */
export function SavePersist(props: { disabled: boolean }) {
  const clientContext = useClientContext();

  const onSave = useCallback(async () => {
    if (props.disabled) {
      Toast.error('保存功能已禁用。');
      return;
    }
    // Validate all node forms
    const allNodeEntities = clientContext.document.getAllNodes();
    const allForms = allNodeEntities.map((node) => getNodeForm(node));
    let allValid = true;
    try {
      const validationResults = await Promise.all(allForms.map((form) => form?.validate()));
      if (validationResults.some((res) => res === false)) {
        allValid = false;
      }
    } catch (error) {
      allValid = false;
      console.error('保存时校验出错 (Validation error during save):', error);
    }
    if (!allValid) {
      Toast.error('工作流校验失败，请检查节点错误。');
      return;
    }
    const flowDocument = clientContext.document.toJSON();
    try {
      localStorage.setItem('flowgram_workflow', JSON.stringify(flowDocument));
      Toast.success('已持久化保存到本地 (Persisted to localStorage)');
    } catch (error: any) {
      Toast.error('本地保存失败: ' + error.message);
    }
  }, [clientContext, props.disabled]);

  return React.createElement(
    Button,
    {
      disabled: props.disabled,
      onClick: onSave,
      style: { marginRight: 10 },
      type: props.disabled ? undefined : 'primary',
    },
    '本地保存 (Persist)'
  );
}

