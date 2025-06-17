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