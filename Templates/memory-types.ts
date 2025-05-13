/**
 * Memory Types for Novel Generator
 * 小说生成器的记忆类型
 */

/**
 * Base Memory interface
 * 基础记忆接口
 */
export interface BaseMemory {
  id: string;
  createdAt: number; // Timestamp 时间戳
  importance: number; // 1-10 scale of importance 重要性级别1-10
  content: string;
}

/**
 * Short-term memory - captures specific events and details
 * 短期记忆 - 捕获特定事件和细节
 */
export interface ShortTermMemory extends BaseMemory {
  type: 'short-term';
  relatedTo: string[]; // IDs of related characters/entities 相关角色/实体的ID
  tags: string[]; // For categorization and search 用于分类和搜索的标签
  expiresAt?: number; // Optional expiration timestamp 可选的过期时间戳
}

/**
 * Long-term memory - compressed abstractions from multiple short-term memories
 * 长期记忆 - 从多个短期记忆压缩而成的抽象概念
 */
export interface LongTermMemory extends BaseMemory {
  type: 'long-term';
  sourceMemories: string[]; // IDs of source short-term memories 源短期记忆的ID
  summary: string; // Compressed summary 压缩摘要
  lastAccessed: number; // Timestamp of last access 最后访问的时间戳
}

/**
 * Character memory - specific to a character
 * 角色记忆 - 特定于角色
 */
export interface CharacterMemory extends BaseMemory {
  type: 'character';
  characterId: string;
  traits: Record<string, number>; // Character traits with values 角色特征及其值
  relationships: Array<{
    targetId: string;
    relationship: string;
    strength: number; // 1-10 scale 1-10级别
  }>;
  backstory: string;
}

/**
 * Memory query options
 * 记忆查询选项
 */
export interface MemoryQueryOptions {
  limit?: number;
  importance?: number; // Minimum importance to include 要包含的最小重要性
  tags?: string[];
  relatedTo?: string[];
  timeRange?: {
    start?: number;
    end?: number;
  };
  sortBy?: 'importance' | 'createdAt' | 'lastAccessed';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Memory compression parameters
 * 记忆压缩参数
 */
export interface CompressionParams {
  targetMemories: string[]; // IDs of memories to compress 要压缩的记忆ID
  compressionRatio?: number; // How much to compress (default based on config) 压缩比例
  preserveImportance?: boolean; // Whether to preserve important details 是否保留重要细节
} 