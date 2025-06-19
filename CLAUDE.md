# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NovelFlow is a visual novel generation system built with React, TypeScript, and ReactFlow. It provides a node-based interface for designing novel generation workflows through interconnected components representing characters, scenes, environments, LLM interactions, and prompts.

## Development Commands

### Frontend Development (in `/frontend` directory)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle (runs TypeScript check then Vite build)
- `npm run lint` - Run ESLint on all TypeScript/TSX files
- `npm run preview` - Preview production build locally

### Project Structure Commands
- Work in `/frontend` directory for React application development
- The root directory contains documentation (`/Doc`) and templates (`/Templates`)

## Terminal Command Memory
- 请以后运行终端命令时使用&，让命令可以后台无阻塞执行

## Architecture Overview

### Core Components Structure
- **Editor (`/frontend/src/components/Editor/`)**: Main ReactFlow-based editor
  - `index.tsx` - Main editor component with ReactFlow provider
  - `nodeTypes.ts` - Registry of all available node types
  - `Nodes/` - Individual node component implementations
  - `Sidebar.tsx` - Properties panel for selected nodes
  - `FlowContext.tsx` - React context for node communication

- **Project Management (`/frontend/src/components/ProjectManager/`)**: 
  - `ProjectToolbar.tsx` - Top toolbar with save/load/export functions
  - `ProjectList.tsx` - Modal for managing multiple projects

- **Data Layer (`/frontend/src/`)**: 
  - `hooks/useProject.ts` - Project CRUD operations
  - `services/projectService.ts` - Local storage project persistence
  - `types/project.ts` - TypeScript interfaces for project data

### Node System Architecture

All nodes follow a consistent pattern defined in `/Doc/Node_Design_Documentation.md`:

**BaseNode Pattern**: All visual nodes extend `BaseNode.tsx` which provides:
- Colored header with icon and title
- White content area for node-specific properties
- Handles for top/bottom connections
- Consistent hover and selection states

**Node Data Structure**: Each node stores data in `node.data.properties` with:
- Type-specific configuration (character details, LLM settings, etc.)
- File paths for external JSON data loading
- Output variables for flow data sharing

**Available Node Types** (defined in `nodeTypes.ts`):
- `scene` - Scene/chapter definitions with character associations
- `character` - Character data management with JSON import/export
- `environment` - Environmental settings and atmosphere
- `llm` - Large Language Model integration nodes
- `systemPrompt` - System prompt templates with variables
- `userPrompt` - User prompt content and formatting

### Data Flow System

**Project Data Structure**: Projects contain:
- `metadata` - ID, name, description, timestamps, version
- `flowData` - ReactFlow nodes, edges, and viewport state
- `settings` - UI preferences (grid, snap settings)

**Node Communication**: Nodes share data through:
- Direct property access via `nodes.[nodeId].data.properties.*`
- Global context variables for cross-node data sharing
- File-based data persistence for complex objects (characters, prompts)

### Character Management System

Character nodes follow a specific JSON template pattern:
- Load from `/Templates/default-character-template.json`
- Support complex personality structures with nested traits
- Include relationship networks and background information
- Store data in `characterJSON` property with file-based persistence

Refer to `/Doc/novel-generator-architecture.md` for detailed character data structures and the memory management system design.

## Key Development Patterns

### Adding New Node Types
1. Create component in `/frontend/src/components/Editor/Nodes/`
2. Extend `BaseNode` with appropriate color and icon
3. Define data structure following `node.data.properties` pattern
4. Register in `nodeTypes.ts`
5. Add corresponding editor in `/frontend/src/components/Editor/NodeEditors/` if needed

### Working with ReactFlow
- Use `useNodesState` and `useEdgesState` for node/edge management
- Node positions are controlled by ReactFlow's drag system
- Connection validation happens through handle types
- Use `useReactFlow` for programmatic viewport control

### File Management
- Character and template files stored in JSON format
- Use browser file APIs for import/export functionality
- Templates located in `/frontend/public/Templates/`
- Project data persisted to browser localStorage

### TypeScript Usage
- All components use strict TypeScript
- Node data interfaces defined in component files
- Project types centralized in `/frontend/src/types/`
- ReactFlow types imported from 'reactflow' package

## CSS 技术实现 (CSS Implementation)

项目采用全局 CSS 与 CSS Modules 相结合的混合策略，以实现样式的高效管理和隔离。

- **全局样式 (Global Styles)**: 
  - 核心文件: `global-dark.css`, `index.css`, `App.css`。
  - 用途: 定义全局的设计系统，包括颜色变量（CSS Custom Properties）、基础字体、布局以及对第三方库（如 React Flow）的样式重置。
  - 提供了可复用的工具类，如 `.nf-card`, `.nf-btn`, `.nf-input`，用于构建一致的 UI 界面。

- **CSS Modules**:
  - 应用范围: 在组件层面（如 `/frontend/src/components/ProjectManager/`）广泛使用 `.module.css` 文件。
  - 优势: 所有类名和动画名默认都是局部作用域的，有效避免了全局命名冲突，使得组件样式更加内聚和可维护。

## 配色方案 (Color Scheme)

项目整体采用了一个层次清晰、视觉舒适的暗色主题。所有颜色均通过 CSS 变量在 `:root` 中定义，便于统一管理和潜在的主题扩展。

- **核心颜色**:
  - **背景色 (Backgrounds)**: 采用分层设计，从深到浅依次为：
    - `--color-background-base` (`#1a1b1e`): 应用的最底层背景。
    - `--color-background-surface` (`#242528`): 用于卡片、节点和面板等表面元素。
    - `--color-background-element` (`#2c2d30`): 用于按钮等可交互元素。
  - **文本色 (Text Colors)**:
    - `--color-text-primary` (`#f0f0f0`): 用于主要标题和正文。
    - `--color-text-secondary` (`#a0a0a0`): 用于次要信息和描述性文本。
  - **边框色 (Borders)**:
    - `--color-border-default` (`#3a3b3d`): 用于区分不同UI元素的标准边框。
    - `--color-border-subtle` (`#4a4b4d`): 用于悬浮或聚焦状态下的高亮边框。

## 项目管理逻辑 (Project Management Logic)

项目管理的核心逻辑由 `useProject.ts` 钩子集中处理，遵循单向数据流和用户驱动的原则，确保了行为的可预测性。

- **初始化流程**:
  - 应用启动时，会向后端请求项目列表。
  - **如果后端存在已保存的项目**: 自动加载**最后更新**的一个项目到画布中。
  - **如果后端没有项目**: 在前端内存中创建一个临时的"未命名项目"，画布为空，等待用户操作。
  - 此初始化流程仅在应用首次加载时执行一次，刷新页面会正确恢复当前状态。

- **保存机制**:
  - **用户驱动**: 项目的保存操作**完全由用户手动触发**（点击"保存项目"按钮），系统不存在任何自动保存逻辑。
  - **智能保存**: 保存函数能够智能判断当前项目是新项目还是已存在的项目。
    - 对于新项目（在内存中，没有ID），会向后端发起 `POST` 请求创建新文件。
    - 对于已存在的项目，会发起 `PUT` 请求更新对应文件。

- **核心操作**:
  - **新建项目**: 点击"新建项目"按钮只会在前端内存中创建一个新的、未保存的临时项目，清空当前画布，**此操作不会与后端发生任何交互**。
  - **重命名**: 用户可以为**已保存**的项目重命名。此操作会更新后端项目中存储的元数据（`metadata.name`）。

## Documentation References

- `/Doc/Node_Design_Documentation.md` - Detailed node architecture and data structures
- `/Doc/novel-generator-architecture.md` - System architecture and character management
- `/Doc/memory-system-design.md` - Memory management for character persistence
- `/frontend/README.md` - Basic React/Vite setup information

## Technology Stack

- **Frontend**: React 19, TypeScript 5.8, Vite 6
- **UI Framework**: Tailwind CSS 4, ReactFlow 11
- **State Management**: React hooks, Context API
- **Data Persistence**: Browser localStorage, JSON file import/export
- **Build Tools**: Vite, ESLint, TypeScript compiler