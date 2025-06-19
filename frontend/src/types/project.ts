import { type Node, type Edge } from 'reactflow';

export interface ProjectMetadata {
  id: string | null;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  author?: string;
}

export interface ProjectData {
  metadata: ProjectMetadata;
  flowData: {
    nodes: Node[];
    edges: Edge[];
    viewport?: {
      x: number;
      y: number;
      zoom: number;
    };
  };
  settings?: {
    gridSize?: number;
    snapToGrid?: boolean;
    showGrid?: boolean;
  };
}

export interface ProjectSummary {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
  edgeCount: number;
}