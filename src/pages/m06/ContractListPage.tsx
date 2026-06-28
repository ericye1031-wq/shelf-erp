import { useEffect, useState } from 'react';
import { Button, Chip, Box, Tooltip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import FormDrawer from '@/components/common/FormDrawer';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM06Store } from '@/stores/useM06Store';
import { formatDate, formatMoney } from '@/utils/format';
import ContractForm from './components/ContractForm';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import type { Contract } from '@/types/m06';

const STATUS_LABELS: Record<string, string> = {
  draft: '草稿', reviewing: '审核中', approved: '已审批',
  executing: '执行中', completed: '已完成', terminated: '已终止',
};

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  draft: 'default', reviewing: 'primary', approved: 'info',
  executing: 'primary', completed: 'success', terminated: 'error',
};

const columns: Column<Contract>[] = [
  { id: 'code', label: '合同编号', sortable: true, width: 140 },
  { id: 'title', label: '项目', sortable: true },
  { id: 'customerName', label: '客户', sortable: true, width: 140,
    render: (r) => r.customerName || '-' },
  { id: 'amount', label: '金额', align: 'right', sortable: true, width: 130,
    render: (r) => formatMoney(r.amount) },
  { id: 'signDate', label: '签订日期', sortable: true, width: 110,
    render: (r) => (r.signDate) ? formatDate(r.signDate) : "-" },
  { id: 'status', label: '状态', width: 100,
    render: (r) => (
      <StatusBadge
        status={r.status}
        label={STATUS_LABELS[r.status]}
      />
    ),
  },
];

export default function ContractListPage() {
  const { contracts, loading, error, fetchContracts, createContract, updateContract, removeContract } = useM06Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [keyword, setKeyword] = useState('');

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const filtered = contracts.filter((c) =>
    (c.code || '').includes(keyword) ||
    (c.title || '').includes(keyword) ||
    (c.customerName || '').includes(keyword)
  );

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`确定删除合同「${code}」？`)) return;
    try {
      await removeContract(id);
      const err = useM06Store.getState().error;
      if (err) { onError(err); } else { onSuccess('删除成功'); }
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    }
  };

  const actionColumn: Column<Contract> = {
    id: 'actions',
    label: '操作',
    width: 120,
    render: (r) => (
      <Box>
        <Tooltip title="编辑">
          <IconButton size="small" onClick={() => { setEditing(r); setDrawerOpen(true); }}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="删除">
          <IconButton size="small" color="error" onClick={() => handleDelete(r.id, r.code)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  };

  return (
    <>
      <PageHeader
        title="合同管理"
        subtitle={`共 ${filtered.length} 份合同`}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDrawerOpen(true); }} sx={{ backgroundColor: '#005591' }}>
            新增合同
          </Button>
        }
      />
      {error && (
        <Box sx={{ p: 2, mb: 2, bgcolor: '#fff0f0', borderRadius: 1, color: 'error.main' }}>
          错误：{error}
        </Box>
      )}
      <SearchBar placeholder="搜索合同编号/项目/客户" value={keyword} onChange={setKeyword} />
      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <DataTable<Contract>
          columns={[...columns, actionColumn]}
          rows={filtered}
          rowKey="id"
          loading={loading}
          page={0}
          pageSize={20}
          total={filtered.length}
        />
      </Box>
      <FormDrawer
        open={drawerOpen}
        title={editing ? '编辑合同' : '新增合同'}
        onCancel={() => { setDrawerOpen(false); setEditing(null); }}
        width={560}
      >
        <ContractForm
          initial={editing ?? undefined}
          onSubmit={async (data) => {
            useM06Store.setState({ error: null });
            try {
              if (editing) {
                await updateContract(editing.id, data);
              } else {
                await createContract(data);
              }
              const err = useM06Store.getState().error;
              if (err) { onError(err); } else { onSuccess(editing ? '更新成功' : '创建成功'); }
              setDrawerOpen(false);
              setEditing(null);
            } catch (e) {
              onError(e instanceof Error ? e.message : String(e));
            }
          }}
        />
      </FormDrawer>
    </>
  );
}
