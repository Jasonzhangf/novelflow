import { nanoid } from 'nanoid';
import { WorkflowNodeType } from '../constants'; // We'll need to add CHARACTER here
import { FlowNodeRegistry, FlowNodeMeta } from '../../typings';
// import iconCharacterPlaceholder from '../../assets/icon-default.png'; // This file does not exist
import iconCharacterPlaceholder from '../../assets/icon-llm.jpg'; // Using icon-llm.jpg as a temporary placeholder

import { renderCharacterForm } from './form-meta';
import { CharacterNodeCanvas } from './CharacterNodeCanvas'; // Import the new canvas renderer

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
function createEmptyTemplate(source: Record<string, any>): Record<string, any> {
  const template: Record<string, any> = {};
  
  // If source is empty or not an object, return empty object
  if (!source || typeof source !== 'object') {
    return {};
  }
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const value = source[key];
      
      if (Array.isArray(value)) {
        // For arrays, we'll keep an empty array
        template[key] = [];
      } else if (typeof value === 'object' && value !== null) {
        // Special handling for personality traits that have Value and Caption
        if ('Value' in value && 'Caption' in value) {
          // Preserve the structure with Caption but set Value to default
          template[key] = {
            Value: typeof value.Value === 'number' ? 0 : "", 
            Caption: value.Caption, // Preserve caption
          };
        } else {
          // Recursively create template for nested objects
          template[key] = createEmptyTemplate(value);
        }
      } else if (typeof value === 'string') {
        template[key] = "";
      } else if (typeof value === 'number') {
        template[key] = 0;
      } else if (typeof value === 'boolean') {
        template[key] = false;
      } else {
        template[key] = null; // Default for other types
      }
    }
  }
  return template;
}

// Default character data (from 李观一.json)
const defaultCharacterJSON = {
    "name": "Li Guanyi / 李观一",
    "age": 13,
    "background": {
        "origin": "Unknown, Resides in Guanyi City, Chen Guo / 未知，居于陈国关翼城",
        "occupation": "Apothecary Apprentice / 药师学徒",
        "history": "Survived assassination attempt as infant, possesses mysterious bronze ding suppressing poison. Raised by sick aunt Murong Qiushui. Learned martial arts from fugitive general Yue Qianfeng. Seeks survival, cure, and strength while hiding from pursuers (Night Ride Cavalry). / 婴儿时遭遇追杀幸存，身怀神秘青铜鼎压制奇毒。由病重婶娘慕容秋水抚养长大。从逃亡将领越千峰处学得武艺。在躲避追兵（夜驰骑兵）的同时寻求生存、解药与力量。"
    },
    "personality": {
        "CoreTemperament": {
            "OptimismLevel": { "Value": 60, "Caption": "乐观度" },
            "CalmnessLevel": { "Value": 70, "Caption": "冷静度" },
            "ExtroversionLevel": { "Value": 30, "Caption": "外向性" },
            "SeriousnessLevel": { "Value": 65, "Caption": "严肃性" },
            "PatienceLevel": { "Value": 75, "Caption": "耐心度" },
            "SensitivityLevel": { "Value": 65, "Caption": "敏感度" }
        },
        "InternalValues": {
            "HonestyLevel": { "Value": 70, "Caption": "诚实度" },
            "KindnessLevel": { "Value": 75, "Caption": "善良度" },
            "JusticeLevel": { "Value": 60, "Caption": "公正性" },
            "LoyaltyLevel": { "Value": 90, "Caption": "忠诚度" },
            "CourageLevel": { "Value": 80, "Caption": "勇气度" },
            "StrengthOfPrinciples": { "Value": 70, "Caption": "原则性强度" }
        },
        "ThinkingStyle": {
            "LogicalityLevel": { "Value": 75, "Caption": "逻辑性" },
            "AnalyticalLevel": { "Value": 70, "Caption": "分析性" },
            "CreativityLevel": { "Value": 60, "Caption": "创造性" },
            "FlexibilityLevel": { "Value": 70, "Caption": "灵活性" },
            "CuriosityLevel": { "Value": 80, "Caption": "好奇心强度" },
            "DepthOfThought": { "Value": 65, "Caption": "思考深度" }
        },
        "InternalMotivation": {
            "AmbitionLevel": { "Value": 55, "Caption": "野心度" },
            "NeedForAchievementPower": { "Value": 40, "Caption": "成就/权力需求强度" },
            "NeedForKnowledgeUnderstanding": { "Value": 85, "Caption": "求知/理解需求强度" },
            "NeedForAffiliationBelonging": { "Value": 80, "Caption": "归属/社交需求强度" },
            "SelfDisciplineLevel": { "Value": 85, "Caption": "自律性" },
            "PerseveranceLevel": { "Value": 90, "Caption": "毅力强度" }
        },
        "SelfPerception": {
            "ConfidenceLevel": { "Value": 60, "Caption": "自信度" },
            "SelfEsteemLevel": { "Value": 60, "Caption": "自尊水平" },
            "HumilityLevel": { "Value": 65, "Caption": "谦逊度" },
            "AnxietyLevel": { "Value": 70, "Caption": "焦虑水平" },
            "InnerPeaceLevel": { "Value": 35, "Caption": "内在平静度" }
        }
    },
    "relationships": [
        { "character": "Murong Qiushui / 慕容秋水", "type": "Aunt (Guardian) / 婶娘（监护人）", "description": "Raised him for 10+ years, critically ill, very close relationship, taught him scholarly arts. / 抚养其十余年，病重，关系非常亲密，教授他琴棋书画等文雅技艺。" },
        { "character": "Yue Qianfeng / 越千峰", "type": "Informal Master/Benefactor / 非正式师父/恩人", "description": "Taught him crucial martial arts (Pojun Saber Technique, Pozhen Chant), source of bronze ding activation, a fugitive general. / 传授关键武艺（破军刀法，破阵曲），青铜鼎激活源头，是逃亡将领。" },
        { "character": "Night Ride Cavalry / 夜驰骑兵", "type": "Enemies/Pursuers / 敌人/追杀者", "description": "Have been hunting him since infancy, possess distinctive cloud pattern armor, represent a constant threat. / 自婴儿时期便追杀他，拥有独特的云纹铠甲，代表着持续的威胁。" },
        { "character": "Xue Shuangtao / 薛霜涛", "type": "Acquaintance/Employer / 相识/雇主", "description": "Met at Liu Family Private School, hired him as a calculation tutor due to his math skills. / 在柳家私塾相识，因其算术能力聘请其为算经家教。" },
        { "character": "Old Doctor Chen / 陈老大夫", "type": "Colleague/Elder Figure / 同事/长辈", "description": "Kind elder at Huichun Hall apothecary who showed concern for Li Guanyi. / 回春堂药铺里的和善长者，关心李观一。" },
        { "character": "Old Shopkeeper of Huichun Hall / 回春堂老掌柜", "type": "Former Employer / 前雇主", "description": "Pragmatic but kind-hearted shopkeeper who eventually dismissed Li Guanyi but provided a recommendation letter. / 务实但心善的掌柜，最终辞退了李观一但提供了推荐信。" }
    ],
    "language": "chinese"
};

let index = 0;
export const CharacterNodeRegistry: FlowNodeRegistry = {
  type: WorkflowNodeType.CHARACTER, // This will be a new type
  info: {
    icon: iconCharacterPlaceholder, // Added placeholder icon
    description: 'Represents and manages character data from a JSON source. / 代表并管理来自JSON源的角色数据。',
  },
  meta: {
    size: { 
      width: 200, // Adjusted size for a more compact canvas view
      height: 80,
    },
    renderKey: 'CharacterNodeCanvasKey', // Using renderKey now
  },
  formMeta: {  // <--- This should now be correctly used for the form only
    render: renderCharacterForm,
  },
  onAdd() {
    const characterId = `character_${nanoid(5)}`;
    index++;
    
    // Create an empty template based on the defaultCharacterJSON structure
    const emptyCharacterTemplate = createEmptyTemplate(defaultCharacterJSON);
    
    // Set default values for essential fields to ensure they're editable
    // This guarantees the form has a clear structure even before importing
    const characterName = ""; // Empty name to start
    
    return {
      id: characterId,
      type: WorkflowNodeType.CHARACTER,
      data: {
        title: `Character ${index} / 角色 ${index}`, // Use index for default title
        inputs: {
          type: 'object',
          properties: {},
        },
        outputs: {
          type: 'object',
          properties: {
            characterOut: {
              type: 'object', 
              title: 'Character Data / 角色数据' 
            },
          },
        },
        properties: {
          characterName: characterName,
          characterFilePath: '',
          characterJSON: emptyCharacterTemplate, // Use our empty template with structure preserved
          loadError: '',
        },
        inputsValues: {}, 
      },
    };
  },
}; 