import { useState, useEffect, useCallback } from 'react';

import { useClientContext, getNodeForm, FlowNodeEntity } from '@flowgram.ai/free-layout-editor';
import { Button, Badge, Toast } from '@douyinfe/semi-ui';
import { IconSave } from '@douyinfe/semi-icons';

export function Save(props: { disabled: boolean }) {
  const [errorCount, setErrorCount] = useState(0);
  const clientContext = useClientContext();

  const updateValidateData = useCallback(() => {
    const allForms = clientContext.document.getAllNodes().map((node) => getNodeForm(node));
    const count = allForms.filter((form) => form?.state.invalid).length;
    setErrorCount(count);
  }, [clientContext]);

  /**
   * Validate all node and Save
   */
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
      const validationResults = await Promise.all(allForms.map(form => form?.validate()));
      // A form?.validate() might return true/false or throw an error.
      // Assuming it returns a boolean or resolves if valid, and rejects/returns false if invalid.
      // Simplified check: if any result is explicitly false.
      if (validationResults.some(res => res === false)) {
        allValid = false;
      }
    } catch (error) {
      allValid = false; // If any validation throws, consider it invalid
      console.error('保存时校验出错 (Validation error during save):', error);
    }

    if (!allValid) {
      Toast.error('工作流校验失败，请检查节点错误。');
      return;
    }

    const flowDocument = clientContext.document.toJSON();
    console.log('>>>>> 准备保存数据 (Preparing to save data): ', flowDocument);

    try {
      const flowDocumentString = JSON.stringify(flowDocument, null, 2);
      const fileContent = `import { FlowDocumentJSON } from './typings';
import { WorkflowNodeType } from './nodes';

export const initialData: FlowDocumentJSON = ${flowDocumentString};
`;
      
      console.log('>>> Full fileContent to write:', fileContent);
      console.log('MCP Tool Call (Conceptual): default_api.mcp_filesystem_write_file({ path: "src/initial-data.ts", content: fileContent });');
      Toast.success('工作流数据已准备好保存！请复制控制台中 ">>> Full fileContent to write:" 后面的内容并提供给助理。');
      
      // Actual tool call will be done by the assistant later using the 'fileContent' derived from 'flowDocument'

    } catch (error: any) {
      console.error('保存数据准备阶段出错 (Error preparing data for saving):', error);
      Toast.error(`准备数据出错 (Error preparing data): ${error.message}`);
    }
  }, [clientContext, props.disabled, updateValidateData]);

  /**
   * Listen single node validate
   */
  useEffect(() => {
    const listenSingleNodeValidate = (node: FlowNodeEntity) => {
      const form = getNodeForm(node);
      if (form) {
        const formValidateDispose = form.onValidate(() => updateValidateData());
        node.onDispose(() => formValidateDispose.dispose());
      }
    };
    clientContext.document.getAllNodes().map((node) => listenSingleNodeValidate(node));
    const dispose = clientContext.document.onNodeCreate(({ node }) =>
      listenSingleNodeValidate(node)
    );
    // Initialize error count
    updateValidateData();
    return () => dispose.dispose();
  }, [clientContext, updateValidateData]);

  if (errorCount === 0) {
    return (
      <Button
        icon={<IconSave />}
        disabled={props.disabled}
        onClick={onSave}
        style={{ marginRight: 10 }}
        type={props.disabled ? undefined : 'primary'}
      >
        保存 (Save)
      </Button>
    );
  }
  return (
    <Badge count={errorCount} position="rightTop" type="danger">
      <Button
        type="danger"
        disabled={props.disabled}
        onClick={onSave}
      >
        保存 (Save)
      </Button>
    </Badge>
  );
}
