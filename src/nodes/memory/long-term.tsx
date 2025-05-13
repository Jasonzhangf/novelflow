import React from 'react';
import { nanoid } from 'nanoid';
import { Typography } from '@douyinfe/semi-ui';
import { IconHistory } from '@douyinfe/semi-icons';
import { FlowNodeRegistry } from '../../typings';
import { WorkflowNodeType, NodeCategory } from '../constants';
import { defaultFormMeta } from '../default-form-meta';

const { Text } = Typography;

/**
 * Long-Term Memory Node Registry
 * 长期记忆节点注册
 */
export const LongTermMemoryNodeRegistry: FlowNodeRegistry = {
  type: WorkflowNodeType.LongTermMemory,
  meta: {
    category: NodeCategory.Memory,
    title: 'Long-Term Memory',
    color: '#52c41a',
    icon: <IconHistory />,
    size: {
      width: 360,
      height: 250,
    },
  },
  formSchema: {
    inputs: {
      type: 'object',
      required: ['summary'],
      properties: {
        summary: {
          type: 'string',
          title: 'Memory Summary / 记忆摘要',
          format: 'textarea',
        },
        importance: {
          type: 'number',
          title: 'Importance (1-10) / 重要性 (1-10)',
          minimum: 1,
          maximum: 10,
          default: 7,
        },
        sourceMemories: {
          type: 'array',
          title: 'Source Memories / 源记忆',
          items: {
            type: 'string',
          },
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
            summary: { type: 'string' },
            importance: { type: 'number' },
            createdAt: { type: 'number' },
            lastAccessed: { type: 'number' },
            sourceMemories: { type: 'array' },
          },
        },
      },
    },
  },
  defaultFormMeta: defaultFormMeta,
  onAdd() {
    return {
      id: `long_term_memory_${nanoid(5)}`,
      type: WorkflowNodeType.LongTermMemory,
      data: {
        title: 'Long-Term Memory',
        inputs: {
          type: 'object',
          required: ['summary'],
          properties: {
            summary: {
              type: 'string',
            },
            importance: {
              type: 'number',
            },
            sourceMemories: {
              type: 'array',
            },
          },
        },
        inputsValues: {
          summary: '',
          importance: 7,
          sourceMemories: [],
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
          <IconHistory />
          <Text>{nodeData.title || 'Long-Term Memory'}</Text>
        </div>
        <div className="node-content">
          {inputValues.summary && (
            <div className="content-item">
              <Text strong>Summary:</Text>
              <Text ellipsis={{ showTooltip: true }}>
                {inputValues.summary.length > 50 
                  ? `${inputValues.summary.substring(0, 50)}...` 
                  : inputValues.summary}
              </Text>
            </div>
          )}
          {inputValues.importance && (
            <div className="content-item">
              <Text strong>Importance:</Text> <Text>{inputValues.importance}</Text>
            </div>
          )}
          {inputValues.sourceMemories && inputValues.sourceMemories.length > 0 && (
            <div className="content-item">
              <Text strong>Sources:</Text> <Text>{inputValues.sourceMemories.length}</Text>
            </div>
          )}
        </div>
      </>
    );
  },
}; 