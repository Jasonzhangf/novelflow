import React from 'react';
import { nanoid } from 'nanoid';
import { Typography } from '@douyinfe/semi-ui';
import { IconUser } from '@douyinfe/semi-icons';
import { FlowNodeRegistry } from '../../typings';
import { WorkflowNodeType, NodeCategory } from '../constants';
import { defaultFormMeta } from '../default-form-meta';

const { Text } = Typography;

/**
 * Character Node Registry
 * 角色节点注册
 */
export const CharacterNodeRegistry: FlowNodeRegistry = {
  type: WorkflowNodeType.Character,
  meta: {
    category: NodeCategory.Character,
    title: 'Character',
    color: '#2db7f5',
    icon: <IconUser />,
    size: {
      width: 360,
      height: 250,
    },
  },
  formSchema: {
    inputs: {
      type: 'object',
      required: ['name', 'archetype'],
      properties: {
        name: {
          type: 'string',
          title: 'Name / 名称',
          default: '',
        },
        archetype: {
          type: 'string',
          title: 'Archetype / 原型',
          enum: ['hero', 'mentor', 'ally', 'trickster', 'guardian', 'shadow', 'herald', 'shapeshifter'],
          enumNames: ['Hero / 英雄', 'Mentor / 导师', 'Ally / 盟友', 'Trickster / 诡计者', 
                     'Guardian / 守护者', 'Shadow / 阴影', 'Herald / 预言者', 'Shapeshifter / 变形者'],
          default: 'hero',
        },
        backstory: {
          type: 'string',
          title: 'Backstory / 背景故事',
          format: 'textarea',
          default: '',
        },
        traits: {
          type: 'array',
          title: 'Traits / 特质',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                title: 'Name / 名称',
              },
              value: {
                type: 'number',
                title: 'Value / 值',
                minimum: 0,
                maximum: 100,
                default: 50,
              },
              category: {
                type: 'string',
                title: 'Category / 类别',
                enum: ['personality', 'abilities', 'physical', 'background', 'motivation'],
                enumNames: ['Personality / 性格', 'Abilities / 能力', 'Physical / 外貌', 
                           'Background / 背景', 'Motivation / 动机'],
              },
              description: {
                type: 'string',
                title: 'Description / 描述',
              },
            },
          },
        },
        goals: {
          type: 'array',
          title: 'Goals / 目标',
          items: {
            type: 'string',
          },
        },
        fears: {
          type: 'array',
          title: 'Fears / 恐惧',
          items: {
            type: 'string',
          },
        },
      },
    },
    outputs: {
      type: 'object',
      properties: {
        character: {
          type: 'object',
          title: 'Character / 角色',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            archetype: { type: 'string' },
            traits: { type: 'array' },
            goals: { type: 'array' },
            fears: { type: 'array' },
            backstory: { type: 'string' },
          },
        },
      },
    },
  },
  defaultFormMeta: defaultFormMeta,
  onAdd() {
    return {
      id: `character_${nanoid(5)}`,
      type: WorkflowNodeType.Character,
      data: {
        title: 'Character',
        inputs: {
          type: 'object',
          required: ['name', 'archetype'],
          properties: {
            name: {
              type: 'string',
            },
            archetype: {
              type: 'string',
            },
            backstory: {
              type: 'string',
            },
            traits: {
              type: 'array',
            },
            goals: {
              type: 'array',
            },
            fears: {
              type: 'array',
            },
          },
        },
        inputsValues: {
          name: '',
          archetype: 'hero',
          backstory: '',
          traits: [],
          goals: [],
          fears: [],
        },
        outputs: {
          type: 'object',
          properties: {
            character: {
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
          <IconUser />
          <Text>{nodeData.title || 'Character'}</Text>
        </div>
        <div className="node-content">
          {inputValues.name && (
            <div className="content-item">
              <Text strong>Name:</Text> <Text>{inputValues.name}</Text>
            </div>
          )}
          {inputValues.archetype && (
            <div className="content-item">
              <Text strong>Archetype:</Text> <Text>{inputValues.archetype}</Text>
            </div>
          )}
        </div>
      </>
    );
  },
}; 