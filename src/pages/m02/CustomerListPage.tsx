import { useState, useEffect } from 'react';
import { Box, Button, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable, { Column } from '@/components/common/DataTable';
import FormDrawer from '@/components/common/FormDrawer';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useM02Store } from '@/stores/useM02Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import type { Customer } from '@/types/m02';

const CUSTOMER_TYPES = [
  { value: 'direct', label: '直客' },
  { value: 'agent', label: '代理商' },
  { value: 'distributor', label: '经销商' },
];
const CUSTOMER_LEVELS = ['A', 'B', 'C', 'D'];
const STATUS_OPTIONS = ['active', 'inactive', 'draft'];
const STATUS_MAP: Record<string, string> = { active: '活跃', inactive: '停用', draft: '草稿' };

const columns: Column<Customer>[] = [
  { id: 'code', label: '编码', sortable: true, width: 120 },
  { id: 'name', label: '名称', sortable: true, width: 180 },
  { id: 'level', label: '等级', width: 80, align: 'center' },
  { id: 'type', label: '类型', width: 80, render: (r) => CUSTOMER_TYPES.find(t => t.value === r.type)?.label || r.type },
  { id: 'industry', label: '行业', width: 120 },
  { id: 'region', label: '区域', width: 100 },
  { id: 'status', label: '状态', width: 90, render: (r) => <StatusBadge status={r.status} label={STATUS_MAP[r.status] || r.status} /> },
];

export default function CustomerListPage() {
  const { customers, loading, error, fetchCustomers, createCustomer, updateCustomer, removeCustomer } = useM02Store();
  const { onSuccess } = useCrudFeedback();
  const [keyword, setKeyword] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<Customer | null>(null);
  const [deleteItem, setDeleteItem] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', code: '', shortName: '', type: 'direct', industry: '', region: '', level: 'C', source: '', status: 'active' });
  const navigate = useNavigate();

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const filtered = keyword
    ? customers.filter((c) => c.name.includes(keyword) || c.code.includes(keyword) || (c.region || '').includes(keyword))
    : customers;

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', code: '', shortName: '', type: 'direct', industry: '', region: '', level: 'C', source: '', status: 'active' });
    setDrawerOpen(true);
  };

  const openEdit = (item: Customer) => {
    setEditItem(item);
    setForm({
      name: item.name, code: item.code, shortName: item.shortName || '',
      type: item.type, industry: item.industry || '', region: item.region || '',
      level: item.level, source: item.source || '', status: item.status,
    });
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (editItem) {
      await updateCustomer(editItem.id, form);
      onSuccess('更新成功');
    } else {
      await createCustomer(form);
      onSuccess('创建成功');
    }
    setDrawerOpen(false);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <PageHeader title="客户档案" action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
          sx={{ backgroundColor: '#005591', '&:hover': { backgroundColor: '#004477' } }}>
          新增客户
        </Button>
      } />
      <SearchBar placeholder="搜索客户名称/编码/区域" value={keyword} onChange={setKeyword} />
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey="id"
        actions={[
          { label: '详情', onClick: (row) => navigate(`/m02/customers/${(row as Customer).id}`) },
          { label: '编辑', onClick: (row) => openEdit(row as Customer) },
          { label: '删除', onClick: (row) => setDeleteItem(row as Customer), color: 'error' },
        ]}
      />
      <FormDrawer open={drawerOpen} onCancel={() => setDrawerOpen(false)} title={editItem ? '编辑客户' : '新增客户'} width={480} onSave={handleSave}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormDrawer.TextField label="客户编码" value={form.code} onChange={(v) => setForm({ ...form, code: v })} required />
          <FormDrawer.TextField label="客户名称" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <FormDrawer.TextField label="简称" value={form.shortName} onChange={(v) => setForm({ ...form, shortName: v })} />
          <FormDrawer.Select label="客户类型" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={CUSTOMER_TYPES} />
          <FormDrawer.TextField label="行业" value={form.industry} onChange={(v) => setForm({ ...form, industry: v })} />
          <FormDrawer.TextField label="区域" value={form.region} onChange={(v) => setForm({ ...form, region: v })} />
          <FormDrawer.Select label="等级" value={form.level} onChange={(v) => setForm({ ...form, level: v })} options={CUSTOMER_LEVELS.map(l => ({ label: `${l}级`, value: l }))} />
          <FormDrawer.TextField label="来源" value={form.source} onChange={(v) => setForm({ ...form, source: v })} />
          <FormDrawer.Select label="状态" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={STATUS_OPTIONS.map(s => ({ label: STATUS_MAP[s] || s, value: s }))} />
        </Box>
      </FormDrawer>
      <ConfirmDialog open={!!deleteItem} title="确认删除" content={`确定要删除客户 "${deleteItem?.name}" 吗？`} onConfirm={async () => { if (deleteItem) { await removeCustomer(deleteItem.id); setDeleteItem(null); onSuccess('删除成功'); } }} onCancel={() => setDeleteItem(null)} />
    </Box>
  );
}
