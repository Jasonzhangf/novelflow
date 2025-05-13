/**
 * API Configuration
 * API 配置
 */

// LLM model configuration 
// LLM 模型配置
export const LLMConfig = {
  // Gemini API settings
  // Gemini API 设置
  gemini: {
    apiKey: '', // Set this through the application
    apiBase: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-pro',
    models: ['gemini-pro', 'gemini-pro-vision'],
  },
  
  // Ollama settings
  // Ollama 设置
  ollama: {
    apiBase: 'http://localhost:11434/api',
    defaultModel: 'llama3',
    models: ['llama3', 'llama3:8b', 'llama3:70b', 'mistral'],
  },
  
  // Default settings
  // 默认设置
  defaults: {
    temperature: 0.7,
    maxTokens: 1024,
    provider: 'gemini', // 'gemini' or 'ollama'
  }
};

/**
 * Memory system configuration
 * 记忆系统配置
 */
export const MemoryConfig = {
  // Default retention time (in days) for short-term memories
  // 短期记忆的默认保留时间（天）
  shortTermRetention: 14,
  
  // Maximum number of memories to keep in long-term memory
  // 长期记忆中保留的最大记忆数量
  longTermMaxEntries: 1000,
  
  // Threshold for compression (number of related short-term memories 
  // needed before compressing into long-term memory)
  // 压缩阈值（在压缩成长期记忆之前需要的相关短期记忆数量）
  compressionThreshold: 5,
}; 