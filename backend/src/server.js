const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8888;

// 项目存储路径
const PROJECTS_DIR = path.join(__dirname, '../../data/projects');

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// 确保项目目录存在
async function ensureProjectsDir() {
  try {
    await fs.access(PROJECTS_DIR);
  } catch (error) {
    await fs.mkdir(PROJECTS_DIR, { recursive: true });
  }
}

// 获取所有项目列表
app.get('/api/projects', async (req, res) => {
  try {
    await ensureProjectsDir();
    const files = await fs.readdir(PROJECTS_DIR);
    const projects = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(PROJECTS_DIR, file);
          const content = await fs.readFile(filePath, 'utf8');
          const project = JSON.parse(content);
          
          // 创建项目摘要
          const summary = {
            id: project.metadata.id,
            name: project.metadata.name,
            description: project.metadata.description || '',
            createdAt: project.metadata.createdAt,
            updatedAt: project.metadata.updatedAt,
            nodeCount: project.flowData.nodes.length,
            edgeCount: project.flowData.edges.length
          };
          
          projects.push(summary);
        } catch (parseError) {
          console.error(`Error parsing project file ${file}:`, parseError);
        }
      }
    }

    // 按更新时间排序
    projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// 获取项目文件列表（用于打开项目）
app.get('/api/projects/files', async (req, res) => {
  try {
    console.log(`[FILES] Getting project files from: ${PROJECTS_DIR}`);
    await ensureProjectsDir();
    const files = await fs.readdir(PROJECTS_DIR);
    console.log(`[FILES] Found ${files.length} files: ${files.join(', ')}`);
    const projectFiles = [];

    for (const file of files) {
      if (file.endsWith('.json') && !file.startsWith('.')) {
        try {
          const filePath = path.join(PROJECTS_DIR, file);
          const stats = await fs.stat(filePath);
          const content = await fs.readFile(filePath, 'utf8');
          const project = JSON.parse(content);
          
          projectFiles.push({
            fileName: file,
            projectName: project.metadata.name,
            projectId: project.metadata.id,
            lastModified: stats.mtime.toISOString(),
            fileSize: stats.size
          });
        } catch (parseError) {
          console.error(`Error parsing project file ${file}:`, parseError);
        }
      }
    }

    // 按修改时间排序
    projectFiles.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    
    console.log(`[FILES] Returning ${projectFiles.length} project files`);
    res.json(projectFiles);
  } catch (error) {
    console.error('Error fetching project files:', error);
    res.status(500).json({ error: 'Failed to fetch project files' });
  }
});

// 获取单个项目
app.get('/api/projects/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const filePath = path.join(PROJECTS_DIR, `${projectId}.json`);
    
    const content = await fs.readFile(filePath, 'utf8');
    const project = JSON.parse(content);
    
    res.json(project);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Project not found' });
    } else {
      console.error('Error fetching project:', error);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  }
});

// 保存项目
app.post('/api/projects', async (req, res) => {
  try {
    await ensureProjectsDir();
    const { nodes, edges, metadata, viewport } = req.body;
    
    // 生成项目ID（如果没有提供）
    const projectId = metadata.id || uuidv4();
    const now = new Date().toISOString();
    
    const project = {
      metadata: {
        id: projectId,
        name: metadata.name,
        description: metadata.description || '',
        createdAt: metadata.createdAt || now,
        updatedAt: now,
        version: '1.0.0'
      },
      flowData: {
        nodes,
        edges,
        viewport
      },
      settings: {
        gridEnabled: true,
        snapToGrid: true
      }
    };
    
    const filePath = path.join(PROJECTS_DIR, `${projectId}.json`);
    await fs.writeFile(filePath, JSON.stringify(project, null, 2));
    
    res.json({ success: true, projectId, project });
  } catch (error) {
    console.error('Error saving project:', error);
    res.status(500).json({ error: 'Failed to save project' });
  }
});

// 更新项目
app.put('/api/projects/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const { nodes, edges, metadata, viewport } = req.body;
    
    const filePath = path.join(PROJECTS_DIR, `${projectId}.json`);
    
    // 检查项目是否存在
    let existingProject;
    try {
      const content = await fs.readFile(filePath, 'utf8');
      existingProject = JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: 'Project not found' });
      }
      throw error;
    }
    
    const now = new Date().toISOString();
    const updatedProject = {
      ...existingProject,
      metadata: {
        ...existingProject.metadata,
        ...metadata,
        updatedAt: now
      },
      flowData: {
        nodes,
        edges,
        viewport
      }
    };
    
    await fs.writeFile(filePath, JSON.stringify(updatedProject, null, 2));
    
    res.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// 删除项目
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const filePath = path.join(PROJECTS_DIR, `${projectId}.json`);
    
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Project not found' });
    } else {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  }
});

// 批量删除项目
app.delete('/api/projects', async (req, res) => {
  try {
    const { projectIds } = req.body;
    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty projectIds array' });
    }

    const deletionPromises = projectIds.map(id => {
      const filePath = path.join(PROJECTS_DIR, `${id}.json`);
      return fs.unlink(filePath).catch(err => {
        // 如果文件不存在，我们也认为删除成功，以免阻塞整个过程
        if (err.code === 'ENOENT') {
          console.warn(`Project file not found for deletion (ignoring): ${id}.json`);
          return;
        }
        // 对于其他错误，向上抛出
        throw err;
      });
    });

    await Promise.all(deletionPromises);

    res.json({ success: true, message: 'Projects deleted successfully' });
  } catch (error) {
    console.error('Error deleting multiple projects:', error);
    res.status(500).json({ error: 'Failed to delete one or more projects' });
  }
});

// 复制项目
app.post('/api/projects/:id/duplicate', async (req, res) => {
  try {
    const sourceId = req.params.id;
    const sourcePath = path.join(PROJECTS_DIR, `${sourceId}.json`);
    
    const content = await fs.readFile(sourcePath, 'utf8');
    const sourceProject = JSON.parse(content);
    
    const newId = uuidv4();
    const now = new Date().toISOString();
    
    const duplicatedProject = {
      ...sourceProject,
      metadata: {
        ...sourceProject.metadata,
        id: newId,
        name: `${sourceProject.metadata.name} (副本)`,
        createdAt: now,
        updatedAt: now
      }
    };
    
    const newPath = path.join(PROJECTS_DIR, `${newId}.json`);
    await fs.writeFile(newPath, JSON.stringify(duplicatedProject, null, 2));
    
    res.json({ success: true, projectId: newId, project: duplicatedProject });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Source project not found' });
    } else {
      console.error('Error duplicating project:', error);
      res.status(500).json({ error: 'Failed to duplicate project' });
    }
  }
});

// 导出项目到文件系统
app.post('/api/projects/:id/export', async (req, res) => {
  try {
    console.log(`[EXPORT] Exporting project: ${req.params.id}`);
    const projectId = req.params.id;
    const filePath = path.join(PROJECTS_DIR, `${projectId}.json`);
    
    console.log(`[EXPORT] Reading project file: ${filePath}`);
    const content = await fs.readFile(filePath, 'utf8');
    const project = JSON.parse(content);
    
    // 生成导出文件名
    const exportFileName = `${project.metadata.name}_${new Date().toISOString().split('T')[0]}.novel-flow.json`;
    const exportPath = path.join(PROJECTS_DIR, 'exports');
    
    // 确保导出目录存在
    try {
      await fs.access(exportPath);
    } catch (error) {
      await fs.mkdir(exportPath, { recursive: true });
    }
    
    const exportFilePath = path.join(exportPath, exportFileName);
    await fs.writeFile(exportFilePath, JSON.stringify(project, null, 2));
    
    console.log(`[EXPORT] Project exported successfully to: ${exportFilePath}`);
    res.json({ 
      success: true, 
      fileName: exportFileName,
      filePath: exportFilePath 
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Project not found' });
    } else {
      console.error('Error exporting project:', error);
      res.status(500).json({ error: 'Failed to export project' });
    }
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`NovelFlow Backend Server running on port ${PORT}`);
  console.log(`Projects directory: ${PROJECTS_DIR}`);
});