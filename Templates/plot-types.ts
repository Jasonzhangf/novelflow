/**
 * Plot Structure Types for Novel Generator
 * 小说生成器的剧情结构类型
 */

/**
 * Plot structure types
 * 剧情结构类型
 */
export enum PlotStructureType {
  THREE_ACT = 'three-act',
  HERO_JOURNEY = 'hero-journey',
  SAVE_THE_CAT = 'save-the-cat',
  FIVE_ACT = 'five-act',
  FREYTAG_PYRAMID = 'freytag-pyramid',
  EPISODIC = 'episodic',
  CUSTOM = 'custom',
}

/**
 * Scene type categories
 * 场景类型分类
 */
export enum SceneType {
  ACTION = 'action',
  DIALOGUE = 'dialogue',
  DESCRIPTION = 'description',
  EXPOSITION = 'exposition',
  MONTAGE = 'montage',
  FLASHBACK = 'flashback',
  DREAM = 'dream',
}

/**
 * Scene purpose/function
 * 场景目的/功能
 */
export enum ScenePurpose {
  ADVANCE_PLOT = 'advance-plot',
  CHARACTER_DEVELOPMENT = 'character-development',
  WORLD_BUILDING = 'world-building',
  ESTABLISH_CONFLICT = 'establish-conflict',
  RESOLVE_CONFLICT = 'resolve-conflict',
  REVEAL_INFORMATION = 'reveal-information',
  CREATE_TENSION = 'create-tension',
  COMEDY_RELIEF = 'comedy-relief',
}

/**
 * Scene definition
 * 场景定义
 */
export interface Scene {
  id: string;
  title: string;
  synopsis: string;
  type: SceneType;
  purpose: ScenePurpose[];
  characters: string[]; // Character IDs
  location: string;
  timeOfDay: string;
  duration: number; // In minutes
  content?: string; // The actual written scene
  notes?: string; // Author notes
  emotionalTone: string;
  tension: number; // 0-100 scale
  requiredProps: string[];
  requiredEvents: string[];
  sequenceNumber: number;
}

/**
 * Chapter definition
 * 章节定义
 */
export interface Chapter {
  id: string;
  title: string;
  summary: string;
  scenes: Scene[];
  theme: string;
  goal: string;
  sequenceNumber: number;
}

/**
 * Act definition (for structured plots)
 * 幕定义（用于结构化剧情）
 */
export interface Act {
  id: string;
  title: string;
  purpose: string;
  chapters: Chapter[];
  sequenceNumber: number;
}

/**
 * Complete plot structure
 * 完整剧情结构
 */
export interface PlotStructure {
  id: string;
  title: string;
  type: PlotStructureType;
  premise: string;
  theme: string;
  acts: Act[];
  mainConflict: string;
  resolution: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Plot point (key event in the story)
 * 情节点（故事中的关键事件）
 */
export interface PlotPoint {
  id: string;
  title: string;
  description: string;
  characters: string[]; // Character IDs involved
  sceneId?: string; // Associated scene if any
  type: string; // E.g., "Inciting Incident", "Climax", etc.
  sequenceNumber: number;
  importance: number; // 0-100 scale
} 