import { useEffect, useState } from 'react';
import { MenuItem, TextField, Typography } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import { useM07Store } from '@/stores/useM07Store';
import GanttView from './components/GanttView';
import type { GanttTask } from '@/types/m07';

const columns: Column<GanttTask>[] = [
  { id: 'name', label: '任务名称', sortable: true },
  { id: 'startDate', label: '开始日期', width: 110 },
  { id: 'endDate', label: '结束日期', width: 110 },
  { id: 'assignee', label: '负责人', width: 90 },
  { id: 'progress', label: '进度', width: 80, render: (r) => `${r.progress}%` },
];

export default function GanttPage() {
  const { projects, ganttTasks, loading, fetchProjects, fetchGanttTasks } = useM07Store();
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  useEffect(() => {
    if (selectedProject) fetchGanttTasks(selectedProject);
  }, [selectedProject, fetchGanttTasks]);

  return (
    <>
      <PageHeader title="甘特图" />
      <TextField select label="选择项目" size="small" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} sx={{ mb: 2, minWidth: 260 }}>
        {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
      </TextField>
      {selectedProject ? (
        <>
          <GanttView tasks={ganttTasks} />
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, color: '#005591' }}>任务列表</Typography>
          <DataTable<GanttTask> columns={columns} rows={ganttTasks} rowKey="id" loading={loading} page={0} pageSize={20} total={ganttTasks.length} />
        </>
      ) : (
        <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>请选择一个项目查看甘特图</Typography>
      )}
    </>
  );
}
