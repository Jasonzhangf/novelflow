import React, { useState } from 'react';
import styles from './NewProjectDialog.module.css';

interface NewProjectDialogProps {
  onClose: () => void;
  onCreate: (name: string, description: string) => Promise<void>;
}

export const NewProjectDialog: React.FC<NewProjectDialogProps> = ({ onClose, onCreate }) => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      alert('请输入项目名称');
      return;
    }
    setIsLoading(true);
    try {
      await onCreate(projectName, projectDescription);
      onClose(); // 创建成功后关闭对话框
    } catch (err) {
      console.error(err);
      alert('创建项目失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>创建新项目</h3>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>项目名称</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className={styles.input}
            placeholder="给你的项目起个名字"
            autoFocus
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>项目描述 (可选)</label>
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className={styles.textarea}
            placeholder="简单描述一下项目内容"
          />
        </div>
        
        <div className={styles.actions}>
          <button onClick={onClose} disabled={isLoading}>取消</button>
          <button onClick={handleSubmit} disabled={isLoading || !projectName.trim()}>
            {isLoading ? '创建中...' : '创建'}
          </button>
        </div>
      </div>
    </div>
  );
};
