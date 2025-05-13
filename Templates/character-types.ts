/**
 * Character Types for Novel Generator
 * 小说生成器的角色类型
 */

/**
 * Character archetype options
 * 角色原型选项
 */
export enum CharacterArchetype {
  HERO = 'hero',
  MENTOR = 'mentor',
  ALLY = 'ally',
  TRICKSTER = 'trickster',
  GUARDIAN = 'guardian',
  SHADOW = 'shadow',
  HERALD = 'herald',
  SHAPESHIFTER = 'shapeshifter',
}

/**
 * Character trait category
 * 角色特质分类
 */
export enum TraitCategory {
  PERSONALITY = 'personality',
  ABILITIES = 'abilities',
  PHYSICAL = 'physical',
  BACKGROUND = 'background',
  MOTIVATION = 'motivation',
}

/**
 * Character trait definition
 * 角色特质定义
 */
export interface CharacterTrait {
  name: string;
  value: number; // 0-100 scale
  category: TraitCategory;
  description: string;
}

/**
 * Relationship type
 * 关系类型
 */
export enum RelationshipType {
  FAMILY = 'family',
  FRIEND = 'friend',
  ENEMY = 'enemy',
  LOVER = 'lover',
  MENTOR = 'mentor',
  COLLEAGUE = 'colleague',
  ACQUAINTANCE = 'acquaintance',
}

/**
 * Character relationship definition
 * 角色关系定义
 */
export interface CharacterRelationship {
  targetId: string;
  type: RelationshipType;
  strength: number; // 0-100 scale
  description: string;
  history: string;
}

/**
 * Character definition
 * 角色定义
 */
export interface Character {
  id: string;
  name: string;
  archetype: CharacterArchetype;
  traits: CharacterTrait[];
  relationships: CharacterRelationship[];
  backstory: string;
  goals: string[];
  fears: string[];
  secrets: string[];
  appearance: string;
  voice: string; // Description of how the character speaks
  createdAt: number;
  updatedAt: number;
}

/**
 * Character development event
 * 角色发展事件
 */
export interface CharacterDevelopmentEvent {
  id: string;
  characterId: string;
  timestamp: number;
  description: string;
  impact: {
    traitChanges: Array<{
      traitName: string;
      previousValue: number;
      newValue: number;
    }>;
    relationshipChanges: Array<{
      targetId: string;
      previousStrength: number;
      newStrength: number;
    }>;
    newGoals?: string[];
    removedGoals?: string[];
    newFears?: string[];
    removedFears?: string[];
  };
} 