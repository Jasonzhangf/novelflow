import {
  Field,
  FieldRenderProps,
  FormRenderProps,
  FormMeta,
  ValidateTrigger,
  useNodeRender,
} from '@flowgram.ai/free-layout-editor';
import { JsonSchemaEditor } from '@flowgram.ai/form-materials';
import { useEffect } from 'react';

import { FlowNodeJSON, JsonSchema } from '../../typings';
import { useIsSidebar } from '../../hooks';
import { FormHeader, FormContent, FormOutputs } from '../../form-components';

export const renderForm = ({ form }: FormRenderProps<FlowNodeJSON>) => {
  const isSidebar = useIsSidebar();
  const { form: nodeForm, node } = useNodeRender();

  // 监听 outputsValues 变化并同步到节点数据
  // Listen for outputsValues changes and sync to node.data
  useEffect(() => {
    if (!nodeForm || !node) return;
    const dispose = nodeForm.onFormValuesChange(() => {
      // 只要 outputsValues 变化就写回 node.data
      // Whenever outputsValues changes, write back to node.data
      const outputsValues = nodeForm.getValueIn('data.outputsValues');
      if (outputsValues) {
        (node as any).data = {
          ...(node as any).data,
          outputsValues: { ...outputsValues },
        };
        // 如有 flowDocument.updateNode(node) 方法可调用，建议调用
        // If flowDocument.updateNode(node) is available, call it here
        console.log('[同步] outputsValues 写回 node.data:', outputsValues);
      }
    });
    return () => dispose?.dispose();
  }, [nodeForm, node]);

  if (isSidebar) {
    return (
      <>
        <FormHeader />
        <FormContent>
          <Field
            name="outputs"
            render={({ field: { value, onChange } }: FieldRenderProps<JsonSchema>) => (
              <>
                <JsonSchemaEditor
                  value={value}
                  onChange={(value) => onChange(value as JsonSchema)}
                />
              </>
            )}
          />
        </FormContent>
      </>
    );
  }
  return (
    <>
      <FormHeader />
      <FormContent>
        <Field name="data.outputsValues.testinput">
          {({ field }) => {
            let inputValue = '';
            if (typeof field.value === 'string') {
              inputValue = field.value;
            } else if (field.value !== undefined && field.value !== null) {
              inputValue = String(field.value);
            }
            return (
              <div>
                <label htmlFor="testinputInput">Test Input Value:</label>
                <input
                  id="testinputInput"
                  type="text"
                  value={inputValue}
                  onChange={e => {
                    field.onChange(e.target.value);
                    nodeForm?.setValueIn('data.outputsValues.testinput', e.target.value);
                    console.log('testinput changed:', e.target.value, 'form.values:', nodeForm?.values);
                  }}
                />
              </div>
            );
          }}
        </Field>
        <FormOutputs />
      </FormContent>
    </>
  );
};

export const formMeta: FormMeta<FlowNodeJSON> = {
  render: renderForm,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    title: ({ value }: { value: string }) => (value ? undefined : 'Title is required'),
  },
};
