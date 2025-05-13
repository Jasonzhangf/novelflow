import React from 'react';
import { nanoid } from 'nanoid';
import { Typography } from '@douyinfe/semi-ui';
import { IconBulb } from '@douyinfe/semi-icons';
import { FlowNodeRegistry } from '../../typings';
import { WorkflowNodeType, NodeCategory } from '../constants';
import { defaultFormMeta } from '../default-form-meta';
import { LongTermMemoryNodeRegistry } from './long-term';

const { Text } = Typography;

/**
 * Short-Term Memory Node Registry
 * 短期记忆节点注册
 */
export const ShortTermMemoryNodeRegistry: FlowNodeRegistry = {
  type: WorkflowNodeType.ShortTermMemory,
  meta: {
    category: NodeCategory.Memory,
    title: 'Short-Term Memory',
    color: '#722ed1',
    icon: <IconBulb />,
    size: {
      width: 360,
      height: 250,
    },
  },
  formSchema: {
    inputs: {
      type: 'object',
      required: ['content'],
      properties: {
        content: {
          type: 'string',
          title: 'Memory Content / 记忆内容',
          format: 'textarea',
        },
        importance: {
          type: 'number',
          title: 'Importance (1-10) / 重要性 (1-10)',
          minimum: 1,
          maximum: 10,
          default: 5,
        },
        relatedTo: {
          type: 'array',
          title: 'Related Characters / 相关角色',
          items: {
            type: 'string',
          },
        },
        tags: {
          type: 'array',
          title: 'Tags / 标签',
          items: {
            type: 'string',
          },
        },
        expiresIn: {
          type: 'number',
          title: 'Expires In (days) / 过期时间（天）',
          default: 14,
        },
      },
    },
    outputs: {
      type: 'object',
      properties: {
        memory: {
          type: 'object',
          title: 'Memory / 记忆',
          properties: {
            id: { type: 'string' },
            type: { type: 'string' },
            content: { type: 'string' },
            importance: { type: 'number' },
            createdAt: { type: 'number' },
            expiresAt: { type: 'number' },
            relatedTo: { type: 'array' },
            tags: { type: 'array' },
          },
        },
      },
    },
  },
  defaultFormMeta: defaultFormMeta,
  onAdd() {
    return {
      id: `short_term_memory_${nanoid(5)}`,
      type: WorkflowNodeType.ShortTermMemory,
      data: {
        title: 'Short-Term Memory',
        inputs: {
          type: 'object',
          required: ['content'],
          properties: {
            content: {
              type: 'string',
            },
            importance: {
              type: 'number',
            },
            relatedTo: {
              type: 'array',
            },
            tags: {
              type: 'array',
            },
            expiresIn: {
              type: 'number',
            },
          },
        },
        inputsValues: {
          content: '',
          importance: 5,
          relatedTo: [],
          tags: [],
          expiresIn: 14,
        },
        outputs: {
          type: 'object',
          properties: {
            memory: {
              type: 'object',
            },
          },
        },
      },
    };
  },
  renderNode: (props) => {
    const { node } = props;
    const nodeData = node.data;
    const inputValues = nodeData.inputsValues || {};
    
    return (
      <>
        <div className="node-header">
          <IconBulb />
          <Text>{nodeData.title || 'Short-Term Memory'}</Text>
        </div>
        <div className="node-content">
          {inputValues.content && (
            <div className="content-item">
              <Text strong>Content:</Text>
              <Text ellipsis={{ showTooltip: true }}>
                {inputValues.content.length > 50 
                  ? `${inputValues.content.substring(0, 50)}...` 
                  : inputValues.content}
              </Text>
            </div>
          )}
          {inputValues.importance && (
            <div className="content-item">
              <Text strong>Importance:</Text> <Text>{inputValues.importance}</Text>
            </div>
          )}
        </div>
      </>
    );
  },
};

// Export all memory related nodes
export { LongTermMemoryNodeRegistry }; 