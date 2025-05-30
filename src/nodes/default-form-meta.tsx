import { FormRenderProps, FormMeta, ValidateTrigger } from '@flowgram.ai/free-layout-editor';

import { FlowNodeJSON } from '../typings';
import { FormHeader, FormContent, FormInputs, FormOutputs } from '../form-components';

export const renderForm = ({ form }: FormRenderProps<FlowNodeJSON>) => {
  console.log('LLM Node Form - prompt value:', form.values.data?.inputsValues?.prompt);
  return (
  <>
    <FormHeader />
    <FormContent>
      <FormInputs />
      <FormOutputs />
    </FormContent>
  </>
);
};

export const defaultFormMeta: FormMeta<FlowNodeJSON> = {
  render: renderForm,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    title: ({ value }) => (value ? undefined : 'Title is required'),
    'inputsValues.*': ({ value, context, formValues, name }) => {
      const valuePropetyKey = name.replace(/^inputsValues\./, '');
      const required = formValues.inputs?.required || [];
      if (required.includes(valuePropetyKey) && (value === '' || value === undefined)) {
        return `${valuePropetyKey} is required`;
      }
      return undefined;
    },
  },
};
