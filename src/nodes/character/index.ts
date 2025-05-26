import { nanoid } from 'nanoid';

import { WorkflowNodeType } from '../constants'; // We'll need to add CHARACTER here
import { FlowNodeRegistry, FlowNodeMeta } from '../../typings';
// import iconCharacterPlaceholder from '../../assets/icon-default.png'; // This file does not exist
import iconCharacterPlaceholder from '../../assets/icon-llm.jpg'; // Using icon-llm.jpg as a temporary placeholder
import { renderCharacterForm } from './form-meta';
import { CharacterNodeCanvas } from './CharacterNodeCanvas'; // Import the new canvas renderer

// Define CharacterFullTemplate for defaultCharacterTemplate and createEmptyTemplate
interface CharacterFullTemplate {
  name?: string;
  age?: number | null;
  background?: {
    origin?: string;
    occupation?: string;
    history?: string;
  };
  personality?: Record<string, any>;
  relationships?: Array<Record<string, any>>;
  language?: string;
  [key: string]: any; // Allow other properties
}

// Helper function to deep clone (assuming it's available or defined elsewhere)
// If not, a simple JSON.parse(JSON.stringify(obj)) can be used for basic cases.
// For this specific structure, a more tailored clone might be needed if complex types exist.
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  // Handle Array
  if (Array.isArray(obj)) {
    const clonedArray = [];
    for (let i = 0; i < obj.length; i++) {
      clonedArray[i] = deepClone(obj[i]);
    }
    return clonedArray as any;
  }
  // Handle Object
  const clonedObj = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
}

// Function to create an empty template from a source object
function createEmptyTemplate(source: Record<string, any>): CharacterFullTemplate {
  const template: CharacterFullTemplate = {};

  // If source is empty or not an object, return empty object
  if (!source || typeof source !== 'object') {
    return {
        name: '',
        age: null,
        background: {
            origin: '',
            occupation: '',
            history: '',
        },
        personality: {},
        relationships: [],
        language: 'chinese', // Default language
    };
  }

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const value = source[key];

      if (Array.isArray(value)) {
        // For arrays, we'll keep an empty array, or a default item if applicable
        if (key === 'relationships' && value.length > 0) {
            // For relationships, we might want an empty array or a template for one item
            template[key] = []; // Default to empty, or createEmptyTemplate(value[0]) for one empty item
        } else {
            template[key] = [];
        }
      } else if (typeof value === 'object' && value !== null) {
        // Special handling for personality traits that have Value and Caption
        if (key === 'personality' && typeof value === 'object' && value !== null) {
            template[key] = {}; // Initialize personality as an empty object
            // Ensure template.personality is treated as definitely defined after the above line for the scope of this block.
            const personalityGroup = template[key] as Record<string, any>; 

            for (const pKey in value) { // Iterate through personality groups like CoreTemperament
                if (typeof value[pKey] === 'object' && value[pKey] !== null) {
                    personalityGroup[pKey] = {};
                    for (const traitKey in value[pKey]) { // Iterate through traits like OptimismLevel
                         if (typeof value[pKey][traitKey] === 'object' && 
                             value[pKey][traitKey] !== null &&
                             'Value' in value[pKey][traitKey] && 
                             'Caption' in value[pKey][traitKey]) {
                            personalityGroup[pKey][traitKey] = {
                                Value: typeof value[pKey][traitKey].Value === 'number' ? 0 : '',
                                Caption: value[pKey][traitKey].Caption, // Preserve caption
                            };
                        } else {
                             // If not a standard trait structure, handle as a nested object
                             personalityGroup[pKey][traitKey] = createEmptyTemplate(value[pKey][traitKey]);
                        }
                    }
                }
            }
        } else {
          // Recursively create template for other nested objects (like background)
          template[key] = createEmptyTemplate(value);
        }
      } else if (typeof value === 'string') {
        template[key] = '';
      } else if (typeof value === 'number') {
        template[key] = null; // Use null for numbers to allow them to be unset or 0
      } else if (typeof value === 'boolean') {
        template[key] = false;
      } else {
        template[key] = null; // Default for other types
      }
    }
  }
  // Ensure all top-level keys from CharacterFullTemplate are present
  if (template.name === undefined) template.name = '';
  if (template.age === undefined) template.age = null;
  if (template.background === undefined) template.background = { origin: '', occupation: '', history: '' };
  if (template.personality === undefined) template.personality = {};
  if (template.relationships === undefined) template.relationships = [];
  if (template.language === undefined) template.language = 'chinese';

  return template;
}

// Default character data (from 李观一.json) - This can be used as the source for createEmptyTemplate
export const defaultCharacterSourceForTemplate: CharacterFullTemplate = {
  name: 'Li Guanyi / 李观一',
  age: 13,
  background: {
    origin: 'Unknown, Resides in Guanyi City, Chen Guo / 未知，居于陈国关翼城',
    occupation: 'Apothecary Apprentice / 药师学徒',
    history:
      'Survived assassination attempt as infant, possesses mysterious bronze ding suppressing poison. Raised by sick aunt Murong Qiushui. Learned martial arts from fugitive general Yue Qianfeng. Seeks survival, cure, and strength while hiding from pursuers (Night Ride Cavalry). / 婴儿时遭遇追杀幸存，身怀神秘青铜鼎压制奇毒。由病重婶娘慕容秋水抚养长大。从逃亡将领越千峰处学得武艺。在躲避追兵（夜驰骑兵）的同时寻求生存、解药与力量。',
  },
  personality: {
    CoreTemperament: {
      OptimismLevel: { Value: 60, Caption: '乐观度' },
      CalmnessLevel: { Value: 70, Caption: '冷静度' },
      ExtroversionLevel: { Value: 30, Caption: '外向性' },
      SeriousnessLevel: { Value: 65, Caption: '严肃性' },
      PatienceLevel: { Value: 75, Caption: '耐心度' },
      SensitivityLevel: { Value: 65, Caption: '敏感度' },
    },
    InternalValues: {
      HonestyLevel: { Value: 70, Caption: '诚实度' },
      KindnessLevel: { Value: 75, Caption: '善良度' },
      JusticeLevel: { Value: 60, Caption: '公正性' },
      LoyaltyLevel: { Value: 90, Caption: '忠诚度' },
      CourageLevel: { Value: 80, Caption: '勇气度' },
      StrengthOfPrinciples: { Value: 70, Caption: '原则性强度' },
    },
    ThinkingStyle: {
      LogicalityLevel: { Value: 75, Caption: '逻辑性' },
      AnalyticalLevel: { Value: 70, Caption: '分析性' },
      CreativityLevel: { Value: 60, Caption: '创造性' },
      FlexibilityLevel: { Value: 70, Caption: '灵活性' },
      CuriosityLevel: { Value: 80, Caption: '好奇心强度' },
      DepthOfThought: { Value: 65, Caption: '思考深度' },
    },
    InternalMotivation: {
      AmbitionLevel: { Value: 55, Caption: '野心度' },
      NeedForAchievementPower: { Value: 40, Caption: '成就/权力需求强度' },
      NeedForKnowledgeUnderstanding: { Value: 85, Caption: '求知/理解需求强度' },
      NeedForAffiliationBelonging: { Value: 80, Caption: '归属/社交需求强度' },
      SelfDisciplineLevel: { Value: 85, Caption: '自律性' },
      PerseveranceLevel: { Value: 90, Caption: '毅力强度' },
    },
    SelfPerception: {
      ConfidenceLevel: { Value: 60, Caption: '自信度' },
      SelfEsteemLevel: { Value: 60, Caption: '自尊水平' },
      HumilityLevel: { Value: 65, Caption: '谦逊度' },
      AnxietyLevel: { Value: 70, Caption: '焦虑水平' },
      InnerPeaceLevel: { Value: 35, Caption: '内在平静度' },
    },
  },
  relationships: [
    {
      character: 'Murong Qiushui / 慕容秋水',
      type: 'Aunt (Guardian) / 婶娘（监护人）',
      description:
        'Raised him for 10+ years, critically ill, very close relationship, taught him scholarly arts. / 抚养其十余年，病重，关系非常亲密，教授他琴棋书画等文雅技艺。',
    },
    {
      character: 'Yue Qianfeng / 越千峰',
      type: 'Informal Master/Benefactor / 非正式师父/恩人',
      description:
        'Taught him crucial martial arts (Pojun Saber Technique, Pozhen Chant), source of bronze ding activation, a fugitive general. / 传授关键武艺（破军刀法，破阵曲），青铜鼎激活源头，是逃亡将领。',
    },
    {
      character: 'Night Ride Cavalry / 夜驰骑兵',
      type: 'Enemies/Pursuers / 敌人/追杀者',
      description:
        'Have been hunting him since infancy, possess distinctive cloud pattern armor, represent a constant threat. / 自婴儿时期便追杀他，拥有独特的云纹铠甲，代表着持续的威胁。',
    },
    {
      character: 'Xue Shuangtao / 薛霜涛',
      type: 'Acquaintance/Employer / 相识/雇主',
      description:
        'Met at Liu Family Private School, hired him as a calculation tutor due to his math skills. / 在柳家私塾相识，因其算术能力聘请其为算经家教。',
    },
    {
      character: 'Old Doctor Chen / 陈老大夫',
      type: 'Colleague/Elder Figure / 同事/长辈',
      description:
        'Kind elder at Huichun Hall apothecary who showed concern for Li Guanyi. / 回春堂药铺里的和善长者，关心李观一。',
    },
    {
      character: 'Old Shopkeeper of Huichun Hall / 回春堂老掌柜',
      type: 'Former Employer / 前雇主',
      description:
        'Pragmatic but kind-hearted shopkeeper who eventually dismissed Li Guanyi but provided a recommendation letter. / 务实但心善的掌柜，最终辞退了李观一但提供了推荐信。',
    },
  ],
  language: 'chinese',
};

let index = 0;
export const CharacterNodeRegistry: FlowNodeRegistry = {
  type: WorkflowNodeType.CHARACTER, // This will be a new type
  info: {
    icon: iconCharacterPlaceholder, // Added placeholder icon
    description:
      'Represents and manages character data from a JSON source. / 代表并管理来自JSON源的角色数据。',
  },
  meta: {
    size: {
      width: 200, // Adjusted size for a more compact canvas view
      height: 80,
    },
    renderKey: 'CharacterNodeCanvasKey', // Using renderKey now
  },
  formMeta: {
    // <--- This should now be correctly used for the form only
    render: (props) => {
      // Provide a default t function if not present
      const t = (props as any).t || ((key: string, options?: any) => (options?.defaultValue ?? key));
      return renderCharacterForm({ ...(props as any), t });
    },
  },
  onAdd() {
    const characterId = `character_${nanoid(5)}`;
    index++;

    // Create an empty template based on the defaultCharacterSourceForTemplate structure
    const initialCharacterJSON = createEmptyTemplate(defaultCharacterSourceForTemplate);

    return {
      id: characterId,
      type: WorkflowNodeType.CHARACTER,
      data: {
        title: `角色 ${index} / Character ${index}`,
        // characterJSON will store the full character data object.
        // It's the primary source of truth for the character's details.
        characterJSON: initialCharacterJSON,
        
        // Define schema for inputs
        inputs: {
          type: 'object',
          properties: {
            nameIn: { // New input port for the character's name
              type: 'string',
              title: 'Character Name Input / 角色名称输入',
              description: 'Input for the character\'s name, updates characterJSON.name / 用于输入角色名称，会更新角色JSON中的name字段',
            },
          },
        },
        // inputsValues will be populated by the engine based on connections
        inputsValues: {
          nameIn: initialCharacterJSON.name || '', // Initialize with default name or empty string
        },

        // properties might be deprecated or used for specific, non-JSON character attributes if any.
        // For now, let's ensure it exists but can be empty or minimal.
        properties: {
          // characterName could be synced from characterJSON.name or be a separate override.
          // For simplicity, let characterJSON.name be the primary source.
          characterName: initialCharacterJSON.name || `Character ${index}`,
          characterFilePath: '', // Default file path
           // outputVariableName is part of properties for some nodes, ensure it's here.
          outputVariableName: 'characterData', // Example name
        },
        outputs: { // Define schema for outputs
          type: 'object',
          properties: {
            jsonDataOut: {
              type: 'object',
              title: 'Character JSON / 角色JSON',
              description: 'The full character JSON object / 完整角色JSON对象',
            },
          },
        },
        // outputsValues holds the actual data to be outputted.
        // It should mirror the structure defined in outputs.properties.
        outputsValues: {
          jsonDataOut: deepClone(initialCharacterJSON), // Output the entire character JSON
        },
      },
      meta: {
        title: `角色 ${index} / Character ${index}`,
      },
      // Keep top-level outputs for Flowgram compatibility if needed, mirroring data.outputs
      outputs: {
        type: 'object',
        properties: {
          jsonDataOut: {
            type: 'object',
            title: 'Character JSON / 角色JSON',
            description: 'The full character JSON object / 完整角色JSON对象',
          },
        },
      },
      // Keep top-level inputs for Flowgram compatibility, mirroring data.inputs
      inputs: { // Also add to top-level for consistency if required by Flowgram
        type: 'object',
        properties: {
          nameIn: {
            type: 'string',
            title: 'Character Name Input / 角色名称输入',
            description: 'Input for the character\'s name, updates characterJSON.name / 用于输入角色名称，会更新角色JSON中的name字段',
          },
        },
      },
      // Keep top-level outputsValues, mirroring data.outputsValues
      outputsValues: {
        jsonDataOut: deepClone(initialCharacterJSON),
      },
    };
  },
};
