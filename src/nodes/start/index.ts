import { FlowNodeRegistry } from '../../typings';
import iconStart from '../../assets/icon-start.jpg';
import { formMeta } from './form-meta';
import { WorkflowNodeType } from '../constants';
import { ASTFactory, createEffectFromVariableProvider } from '@flowgram.ai/fixed-layout-editor';

export const StartNodeRegistry: FlowNodeRegistry = {
  type: WorkflowNodeType.Start,
  meta: {
    isStart: true,
    deleteDisable: true,
    copyDisable: true,
    defaultPorts: [{ type: 'output' }],
    size: {
      width: 360,
      height: 211,
    },
    outputs: {
      type: 'object',
      properties: {
        testinput: { type: 'string', title: 'Test Input Value / 测试输入值' },
      },
    },
  },
  info: {
    icon: iconStart,
    description:
      'The starting node of the workflow, used to set the information needed to initiate the workflow. / 工作流的起始节点，用于设置启动所需的信息。',
  },
  /**
   * 通过表单副作用注册输出变量到变量引擎
   * Register output variable to the variable engine via form effect
   */
  formMeta: {
    ...formMeta,
    effect: {
      'data.outputsValues.testinput': createEffectFromVariableProvider({
        parse: (v: string) => ([{
          meta: { title: 'Test Input Value / 测试输入值' },
          key: 'testinput',
          type: ASTFactory.createString(),
        }]),
      }) as any,
    },
  },
  /**
   * Start Node cannot be added
   */
  canAdd() {
    return false;
  },
};
