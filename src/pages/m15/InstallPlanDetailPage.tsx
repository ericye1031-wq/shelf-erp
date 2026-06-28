import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Tabs, Tab, Typography, Card, CardContent, Grid, Button, Chip, Alert,
  TextField, MenuItem, IconButton, Tooltip, Paper, Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM15Store } from '@/stores/useM15Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import { formatDate, formatMoney } from '@/utils/format';
import type { InstallTeam, InstallReport, InstallCost, InstallIssue, InstallAcceptance } from '@/types/m15';

const STATUS_LABELS: Record<string, string> = {
  draft: '草稿', submitted: '已提交', in_progress: '安装中', completed: '已完成', cancelled: '已取消',
};

const SEVERITY_COLORS: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
  critical: 'error', high: 'warning', medium: 'info', low: 'default',
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: '严重', high: '高', medium: '中', low: '低',
};

const ISSUE_TYPE_LABELS: Record<string, string> = {
  '缺件': '缺件', '损坏': '损坏', '设计变更': '设计变更', '客户追加需求': '客户追加需求', '其他': '其他',
};

export default function InstallPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const {
    currentPlan, loading, error, fetchPlanById, changeStatus,
    teams, fetchTeams, createTeam, removeTeam,
    reports, fetchReports, createReport, removeReport,
    costs, fetchCosts, createCost, updateCost,
    issues, fetchIssues, createIssue, updateIssue, removeIssue,
    acceptances, fetchAcceptances, createAcceptance,
  } = useM15Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (id) {
      fetchPlanById(id);
      fetchTeams(id);
      fetchReports({});
      fetchCosts(id);
      fetchIssues({});
      fetchAcceptances(id);
    }
  }, [id]);

  if (!currentPlan) return <LoadingOverlay loading />;

  const planReports = reports.filter((r) => r.planId === id);
  const planIssues = issues.filter((i) => i.planId === id);

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      await changeStatus(id, status);
      const err = useM15Store.getState().error;
      if (err) { onError(err); } else { onSuccess('状态更新成功'); }
    } catch (e) { onError(e); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => nav('/m15/plans')}>返回</Button>
        <Typography variant="h5">{currentPlan.code} - 安装计划详情</Typography>
        <Chip label={STATUS_LABELS[currentPlan.status]} color={currentPlan.status === 'in_progress' ? 'primary' : currentPlan.status === 'completed' ? 'success' : currentPlan.status === 'cancelled' ? 'error' : 'default'} size="small" />
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tab label="计划信息" />
        <Tab label={`人员 (${teams.length})`} />
        <Tab label={`报工 (${planReports.length})`} />
        <Tab label={`成本 (${costs.length})`} />
        <Tab label={`问题 (${planIssues.length})`} />
        <Tab label={`验收 (${acceptances.length})`} />
      </Tabs>

      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        {tab === 0 && <PlanInfoTab plan={currentPlan} onStatusChange={handleStatusChange} />}
        {tab === 1 && <TeamsTab teams={teams} planId={id!} onCreate={createTeam} onDelete={removeTeam} onSuccess={onSuccess} onError={onError} />}
        {tab === 2 && <ReportsTab reports={planReports} planId={id!} onCreate={createReport} onDelete={removeReport} onSuccess={onSuccess} onError={onError} />}
        {tab === 3 && <CostsTab costs={costs} planId={id!} onCreate={createCost} onUpdate={updateCost} onSuccess={onSuccess} onError={onError} />}
        {tab === 4 && <IssuesTab issues={planIssues} planId={id!} onCreate={createIssue} onUpdate={updateIssue} onDelete={removeIssue} onSuccess={onSuccess} onError={onError} />}
        {tab === 5 && <AcceptancesTab acceptances={acceptances} planId={id!} onCreate={createAcceptance} onSuccess={onSuccess} onError={onError} />}
      </Box>
    </Box>
  );
}

/** ─── 计划信息 Tab ─── */
function PlanInfoTab({ plan, onStatusChange }: { plan: any; onStatusChange: (s: string) => Promise<void> }) {
  const statusTransitions: Record<string, { label: string; next: string }[]> = {
    draft: [{ label: '提交', next: 'submitted' }],
    submitted: [{ label: '开始安装', next: 'in_progress' }, { label: '撤回', next: 'draft' }],
    in_progress: [{ label: '完成', next: 'completed' }, { label: '取消', next: 'cancelled' }],
    completed: [{ label: '取消', next: 'cancelled' }],
    cancelled: [],
  };
  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid size={6}><Typography variant="body2" color="text.secondary">计划编号</Typography><Typography>{plan.code}</Typography></Grid>
          <Grid size={6}><Typography variant="body2" color="text.secondary">状态</Typography><Chip label={STATUS_LABELS[plan.status]} size="small" /></Grid>
          <Grid size={12}><Typography variant="body2" color="text.secondary">安装地址</Typography><Typography>{plan.siteAddress}</Typography></Grid>
          <Grid size={6}><Typography variant="body2" color="text.secondary">开始日期</Typography><Typography>{plan.startDate ? formatDate(plan.startDate) : '-'}</Typography></Grid>
          <Grid size={6}><Typography variant="body2" color="text.secondary">结束日期</Typography><Typography>{plan.endDate ? formatDate(plan.endDate) : '-'}</Typography></Grid>
          <Grid size={12}><Typography variant="body2" color="text.secondary">安全交底</Typography><Typography sx={{ whiteSpace: 'pre-wrap' }}>{plan.safetyBriefing || '-'}</Typography></Grid>
          {(statusTransitions[plan.status] || []).length > 0 && (
            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary" gutterBottom>状态操作</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {(statusTransitions[plan.status] || []).map((t) => (
                  <Button key={t.next} variant="outlined" size="small" onClick={() => onStatusChange(t.next)}>{t.label}</Button>
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}

/** ─── 人员 Tab ─── */
function TeamsTab({ teams, planId, onCreate, onDelete, onSuccess, onError }: any) {
  const [form, setForm] = useState({ workerName: '', workerRole: '安装工', certStatus: 'none', insuranceStatus: 'none' });
  const handleChange = (f: string) => (e: any) => setForm((p: any) => ({ ...p, [f]: e.target.value }));
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <TextField label="姓名" value={form.workerName} onChange={handleChange('workerName')} size="small" />
          <TextField label="角色" value={form.workerRole} onChange={handleChange('workerRole')} size="small" select sx={{ width: 100 }}>
            <MenuItem value="队长">队长</MenuItem><MenuItem value="安装工">安装工</MenuItem><MenuItem value="助手">助手</MenuItem>
          </TextField>
          <TextField label="资质" value={form.certStatus} onChange={handleChange('certStatus')} size="small" select sx={{ width: 100 }}>
            <MenuItem value="valid">有效</MenuItem><MenuItem value="expired">过期</MenuItem><MenuItem value="none">无</MenuItem>
          </TextField>
          <TextField label="保险" value={form.insuranceStatus} onChange={handleChange('insuranceStatus')} size="small" select sx={{ width: 100 }}>
            <MenuItem value="active">有效</MenuItem><MenuItem value="expired">过期</MenuItem><MenuItem value="none">无</MenuItem>
          </TextField>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={async () => {
            if (!form.workerName) return;
            try { await onCreate({ ...form, planId }); onSuccess('添加成功'); setForm({ workerName: '', workerRole: '安装工', certStatus: 'none', insuranceStatus: 'none' }); } catch (e) { onError(e); }
          }}>添加</Button>
        </Box>
        {teams.map((t: InstallTeam) => (
          <Paper key={t.id} sx={{ p: 1.5, mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ flex: 1 }}>{t.workerName}</Typography>
            <Chip label={t.workerRole} size="small" color={t.workerRole === '队长' ? 'primary' : 'default'} />
            <Chip label={`资质: ${t.certStatus === 'valid' ? '有效' : t.certStatus === 'expired' ? '过期' : '无'}`} size="small" color={t.certStatus === 'valid' ? 'success' : t.certStatus === 'expired' ? 'warning' : 'default'} />
            <Chip label={`保险: ${t.insuranceStatus === 'active' ? '有效' : t.insuranceStatus === 'expired' ? '过期' : '无'}`} size="small" color={t.insuranceStatus === 'active' ? 'success' : t.insuranceStatus === 'expired' ? 'warning' : 'default'} />
            <IconButton size="small" color="error" onClick={async () => { try { await onDelete(t.id); onSuccess('删除成功'); } catch (e) { onError(e); } }}><DeleteIcon fontSize="small" /></IconButton>
          </Paper>
        ))}
      </CardContent>
    </Card>
  );
}

/** ─── 报工 Tab ─── */
function ReportsTab({ reports, planId, onCreate, onDelete, onSuccess, onError }: any) {
  const [form, setForm] = useState({ workerName: '', workDate: new Date().toISOString().slice(0, 10), startTime: '08:00', endTime: '17:00', overtimeHours: 0, workContent: '', completionPercent: 0 });
  const handleChange = (f: string) => (e: any) => setForm((p: any) => ({ ...p, [f]: e.target.value }));
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField label="工人" value={form.workerName} onChange={handleChange('workerName')} size="small" />
          <TextField label="日期" type="date" value={form.workDate} onChange={handleChange('workDate')} size="small" InputLabelProps={{ shrink: true }} />
          <TextField label="开始" type="time" value={form.startTime} onChange={handleChange('startTime')} size="small" InputLabelProps={{ shrink: true }} />
          <TextField label="结束" type="time" value={form.endTime} onChange={handleChange('endTime')} size="small" InputLabelProps={{ shrink: true }} />
          <TextField label="加班(h)" type="number" value={form.overtimeHours} onChange={handleChange('overtimeHours')} size="small" sx={{ width: 80 }} inputProps={{ min: 0, step: 0.5 }} />
          <TextField label="工作内容" value={form.workContent} onChange={handleChange('workContent')} size="small" />
          <TextField label="完工%" type="number" value={form.completionPercent} onChange={handleChange('completionPercent')} size="small" sx={{ width: 80 }} inputProps={{ min: 0, max: 100, step: 1 }} />
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={async () => {
            if (!form.workerName) return;
            try { await onCreate({ ...form, planId, overtimeHours: Number(form.overtimeHours), completionPercent: Number(form.completionPercent) }); onSuccess('报工成功'); } catch (e) { onError(e); }
          }}>报工</Button>
        </Box>
        {reports.map((r: InstallReport) => (
          <Paper key={r.id} sx={{ p: 1.5, mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" fontWeight="bold">{r.workerName}</Typography>
            <Typography variant="body2">{formatDate(r.workDate)}</Typography>
            <Typography variant="body2">{r.startTime || '-'} ~ {r.endTime || '-'}</Typography>
            <Chip label={`加班 ${r.overtimeHours}h`} size="small" color={r.overtimeHours > 0 ? 'warning' : 'default'} />
            <Typography variant="body2" sx={{ flex: 1 }}>{r.workContent}</Typography>
            <Chip label={`${r.completionPercent}%`} size="small" color="primary" />
            <IconButton size="small" color="error" onClick={async () => { try { await onDelete(r.id); onSuccess('删除成功'); } catch (e) { onError(e); } }}><DeleteIcon fontSize="small" /></IconButton>
          </Paper>
        ))}
      </CardContent>
    </Card>
  );
}

/** ─── 成本 Tab ─── */
function CostsTab({ costs, planId, onCreate, onUpdate, onSuccess, onError }: any) {
  const [form, setForm] = useState({ laborFee: 0, travelFee: 0, accommodationFee: 0, toolCost: 0, materialCost: 0 });
  const handleChange = (f: string) => (e: any) => setForm((p: any) => ({ ...p, [f]: Number(e.target.value) || 0 }));
  const first = costs[0];
  return (
    <Card>
      <CardContent>
        {!first ? (
          <Box>
            <Typography gutterBottom>尚无成本记录，请录入：</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <TextField label="人工费" type="number" value={form.laborFee} onChange={handleChange('laborFee')} size="small" />
              <TextField label="差旅费" type="number" value={form.travelFee} onChange={handleChange('travelFee')} size="small" />
              <TextField label="住宿费" type="number" value={form.accommodationFee} onChange={handleChange('accommodationFee')} size="small" />
              <TextField label="工具费" type="number" value={form.toolCost} onChange={handleChange('toolCost')} size="small" />
              <TextField label="辅材费" type="number" value={form.materialCost} onChange={handleChange('materialCost')} size="small" />
            </Box>
            <Button variant="contained" size="small" onClick={async () => { try { await onCreate({ ...form, planId }); onSuccess('添加成功'); } catch (e) { onError(e); } }}>保存成本</Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid size={4}><Typography variant="body2" color="text.secondary">人工费</Typography><Typography>{formatMoney(first.laborFee)}</Typography></Grid>
            <Grid size={4}><Typography variant="body2" color="text.secondary">差旅费</Typography><Typography>{formatMoney(first.travelFee)}</Typography></Grid>
            <Grid size={4}><Typography variant="body2" color="text.secondary">住宿费</Typography><Typography>{formatMoney(first.accommodationFee)}</Typography></Grid>
            <Grid size={4}><Typography variant="body2" color="text.secondary">工具消耗</Typography><Typography>{formatMoney(first.toolCost)}</Typography></Grid>
            <Grid size={4}><Typography variant="body2" color="text.secondary">辅材消耗</Typography><Typography>{formatMoney(first.materialCost)}</Typography></Grid>
            <Grid size={4}><Typography variant="body2" color="text.secondary">总成本</Typography><Typography fontWeight="bold" color="primary">{formatMoney(first.totalCost)}</Typography></Grid>
            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary" gutterBottom>修改成本</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <TextField label="人工费" type="number" size="small" defaultValue={first.laborFee} onBlur={(e) => onUpdate(first.id, { laborFee: Number(e.target.value) || 0 })} />
                <TextField label="差旅费" type="number" size="small" defaultValue={first.travelFee} onBlur={(e) => onUpdate(first.id, { travelFee: Number(e.target.value) || 0 })} />
                <TextField label="住宿费" type="number" size="small" defaultValue={first.accommodationFee} onBlur={(e) => onUpdate(first.id, { accommodationFee: Number(e.target.value) || 0 })} />
                <TextField label="工具费" type="number" size="small" defaultValue={first.toolCost} onBlur={(e) => onUpdate(first.id, { toolCost: Number(e.target.value) || 0 })} />
                <TextField label="辅材费" type="number" size="small" defaultValue={first.materialCost} onBlur={(e) => onUpdate(first.id, { materialCost: Number(e.target.value) || 0 })} />
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}

/** ─── 问题 Tab ─── */
function IssuesTab({ issues, planId, onCreate, onUpdate, onDelete, onSuccess, onError }: any) {
  const [form, setForm] = useState({ issueType: '缺件', severity: 'medium', description: '' });
  const handleChange = (f: string) => (e: any) => setForm((p: any) => ({ ...p, [f]: e.target.value }));
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <TextField label="类型" value={form.issueType} onChange={handleChange('issueType')} size="small" select sx={{ width: 120 }}>
            {Object.keys(ISSUE_TYPE_LABELS).map((k) => <MenuItem key={k} value={k}>{ISSUE_TYPE_LABELS[k]}</MenuItem>)}
          </TextField>
          <TextField label="严重程度" value={form.severity} onChange={handleChange('severity')} size="small" select sx={{ width: 120 }}>
            <MenuItem value="low">低</MenuItem><MenuItem value="medium">中</MenuItem><MenuItem value="high">高</MenuItem><MenuItem value="critical">严重</MenuItem>
          </TextField>
          <TextField label="描述" value={form.description} onChange={handleChange('description')} size="small" sx={{ flex: 1 }} />
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={async () => {
            if (!form.description) return;
            try { await onCreate({ ...form, planId }); onSuccess('添加成功'); setForm({ issueType: '缺件', severity: 'medium', description: '' }); } catch (e) { onError(e); }
          }}>上报</Button>
        </Box>
        {issues.map((i: InstallIssue) => (
          <Paper key={i.id} sx={{ p: 1.5, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={ISSUE_TYPE_LABELS[i.issueType] || i.issueType} size="small" />
              <Chip label={SEVERITY_LABELS[i.severity]} size="small" color={SEVERITY_COLORS[i.severity]} />
              <Chip label={i.status === 'open' ? '待处理' : i.status === 'in_progress' ? '处理中' : '已解决'} size="small" color={i.status === 'resolved' ? 'success' : i.status === 'in_progress' ? 'warning' : 'error'} />
              <Box sx={{ flex: 1 }} />
              <Button size="small" onClick={() => onUpdate(i.id, { status: i.status === 'open' ? 'in_progress' : 'resolved' })}>
                {i.status === 'open' ? '开始处理' : i.status === 'in_progress' ? '解决' : ''}
              </Button>
              <IconButton size="small" color="error" onClick={async () => { try { await onDelete(i.id); onSuccess('删除成功'); } catch (e) { onError(e); } }}><DeleteIcon fontSize="small" /></IconButton>
            </Box>
            <Typography variant="body2" sx={{ mt: 0.5 }}>{i.description}</Typography>
            {i.solution && <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>解决方案: {i.solution}</Typography>}
            {i.photoUrls && i.photoUrls.length > 0 && (
              <Box sx={{ mt: 0.5 }}>{i.photoUrls.map((url: string, idx: number) => <Chip key={idx} label={`照片${idx + 1}`} size="small" variant="outlined" sx={{ mr: 0.5 }} />)}</Box>
            )}
          </Paper>
        ))}
      </CardContent>
    </Card>
  );
}

/** ─── 验收 Tab ─── */
function AcceptancesTab({ acceptances, planId, onCreate, onSuccess, onError }: any) {
  const [form, setForm] = useState({ acceptDate: new Date().toISOString().slice(0, 10), result: 'passed', issueDesc: '', warrantyStartDate: '', warrantyEndDate: '' });
  const handleChange = (f: string) => (e: any) => setForm((p: any) => ({ ...p, [f]: e.target.value }));
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField label="验收日期" type="date" value={form.acceptDate} onChange={handleChange('acceptDate')} size="small" InputLabelProps={{ shrink: true }} />
          <TextField label="结果" value={form.result} onChange={handleChange('result')} size="small" select sx={{ width: 130 }}>
            <MenuItem value="passed">通过</MenuItem><MenuItem value="with_issues">带问题通过</MenuItem><MenuItem value="failed">不通过</MenuItem>
          </TextField>
          <TextField label="问题描述" value={form.issueDesc} onChange={handleChange('issueDesc')} size="small" />
          <TextField label="质保开始" type="date" value={form.warrantyStartDate} onChange={handleChange('warrantyStartDate')} size="small" InputLabelProps={{ shrink: true }} />
          <TextField label="质保结束" type="date" value={form.warrantyEndDate} onChange={handleChange('warrantyEndDate')} size="small" InputLabelProps={{ shrink: true }} />
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={async () => {
            try {
              await onCreate({
                planId, acceptDate: form.acceptDate || undefined, result: form.result, issueDesc: form.issueDesc || undefined,
                warrantyStartDate: form.warrantyStartDate || undefined, warrantyEndDate: form.warrantyEndDate || undefined,
              });
              onSuccess('验收记录创建成功');
            } catch (e) { onError(e); }
          }}>创建验收</Button>
        </Box>
        {acceptances.map((a: InstallAcceptance) => {
          const now = new Date();
          const warrantyEnd = a.warrantyEndDate ? new Date(a.warrantyEndDate) : null;
          const daysLeft = warrantyEnd ? Math.ceil((warrantyEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
          return (
            <Paper key={a.id} sx={{ p: 2, mb: 1 }}>
              <Grid container spacing={1}>
                <Grid size={4}><Typography variant="body2" color="text.secondary">验收日期</Typography><Typography>{a.acceptDate ? formatDate(a.acceptDate) : '-'}</Typography></Grid>
                <Grid size={4}><Typography variant="body2" color="text.secondary">验收结果</Typography>
                  <Chip label={a.result === 'passed' ? '通过' : a.result === 'with_issues' ? '带问题通过' : '不通过'} size="small" color={a.result === 'passed' ? 'success' : a.result === 'with_issues' ? 'warning' : 'error'} />
                </Grid>
                <Grid size={4}><Typography variant="body2" color="text.secondary">质保期</Typography>
                  {a.warrantyStartDate && a.warrantyEndDate ? (
                    <Box>
                      <Typography variant="body2">{formatDate(a.warrantyStartDate)} ~ {formatDate(a.warrantyEndDate)}</Typography>
                      {daysLeft !== null && (
                        <Chip label={daysLeft > 0 ? `剩余 ${daysLeft} 天` : '已过期'} size="small" color={daysLeft > 30 ? 'success' : daysLeft > 0 ? 'warning' : 'error'} />
                      )}
                    </Box>
                  ) : <Typography>-</Typography>}
                </Grid>
                {a.issueDesc && (
                  <Grid size={12}><Typography variant="body2" color="text.secondary">整改问题</Typography><Typography>{a.issueDesc}</Typography></Grid>
                )}
              </Grid>
            </Paper>
          );
        })}
      </CardContent>
    </Card>
  );
}
