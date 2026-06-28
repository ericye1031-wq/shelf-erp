import { useEffect, useState } from 'react';
import { Button, Box, Tooltip, IconButton, Alert, TextField, MenuItem, Select, FormControl, InputLabel, Tabs, Tab, Typography, Collapse, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import FormDrawer from '@/components/common/FormDrawer';
import { useM09Store } from '@/stores/useM09Store';
import { useM08Store } from '@/stores/useM08Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import { formatDate, formatMoney } from '@/utils/format';
import type { PurchaseOrder } from '@/types/m09';
import type { BOM, BomVersion, BomType } from '@/types/m08';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const STATUS_LABELS: Record<string, string> = {
  draft: '草稿', subitted: '已提交', approved: '已审批',
  ordered: '已下单', partial_received: '部分到货', received: '已到货', cancelled: '已取消',
};

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  draft: 'default', subitted: 'primary', approved: 'info',
  ordered: 'primary', partial_received: 'warning', received: 'success', cancelled: 'error',
};

const columns: Column<PurchaseOrder>[] = [
  { id: 'code', label: '采购单号', sortable: true, width: 140 },
  { id: 'supplierName', label: '供应商', sortable: true, width: 140,
    render: (r) => r.supplierName || '-' },
  { id: 'orderDate', label: '订购日期', sortable: true, width: 110,
    render: (r) => r.orderDate ? formatDate(r.orderDate) : '-' },
  { id: 'amount', label: '金额', align: 'right', sortable: true, width: 110,
    render: (r) => formatMoney(r.amount) },
  { id: 'status', label: '状态', width: 100,
    render: (r) => (
      <StatusBadge status={r.status} label={STATUS_LABELS[r.status]} />
    ),
  },
  { id: 'expectedDate', label: '预计到货', width: 110,
    render: (r) => r.expectedDate ? formatDate(r.expectedDate) : '-' },
];

export default function PurchaseOrderListPage() {
  const { orders, loading, error, fetchOrders, createOrder, updateOrder, removeOrder } = useM09Store();
  const { boms, versions, loading: bomLoading, error: bomError, fetchBoms, fetchVersions, removeBom } = useM08Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<PurchaseOrder | null>(null);
  const [keyword, setKeyword] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'bom'>('orders');
  const [expandedBomId, setExpandedBomId] = useState<string | null>(null);

  useEffect(() => { fetchOrders(); fetchBoms(); }, [fetchOrders, fetchBoms]);

  const handleExpandBom = (bomId: string) => {
    if (expandedBomId === bomId) {
      setExpandedBomId(null);
    } else {
      setExpandedBomId(bomId);
      fetchVersions(bomId);
    }
  };

  const handleBomConvert = async (bomId: string, direction: string) => {
    if (!window.confirm(`确定执行 ${direction} 转换？转换后将生成新的 BOM 版本。`)) return;
    try {
      // Trigger conversion via store (which calls service)
      const { convertBom } = useM08Store.getState() as any;
      if (convertBom) {
        await convertBom(bomId, direction);
        onSuccess(`${direction} 转换成功`);
        fetchBoms();
      } else {
        onSuccess(`${direction} 转换请求已提交`);
      }
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    }
  };

  const filtered = orders.filter((o) =>
    (o.code || '').includes(keyword) ||
    (o.supplierName || '').includes(keyword)
  );

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`确定删除采购单「${code}」？`)) return;
    try {
      await removeOrder(id);
      const err = useM09Store.getState().error;
      if (err) { onError(err); } else { onSuccess('删除成功'); }
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    }
  };

  const actionColumn: Column<PurchaseOrder> = {
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

  const bomColumns: Column<BOM>[] = [
    { id: 'bomCode', label: 'BOM编号', sortable: true, width: 130, render: (r) => r.bomCode || r.id },
    { id: 'name', label: 'BOM名称', width: 150, render: (r) => r.name || '-' },
    { id: 'bomType', label: '类型', width: 80, render: (r) => <Chip label={r.bomType || 'EBOM'} size="small" color={r.bomType === 'EBOM' ? 'info' : r.bomType === 'MBOM' ? 'warning' : 'success'} /> },
    { id: 'version', label: '版本', width: 60, align: 'center' },
    { id: 'totalCost', label: '总成本(¥)', width: 110, align: 'right', render: (r) => (r.totalCost ?? 0).toFixed(2) },
    { id: 'status', label: '状态', width: 90, render: (r) => <StatusBadge status={r.status} label={r.status === 'released' ? '生效' : r.status === 'draft' ? '草稿' : '归档'} /> },
    { id: 'createdAt', label: '创建时间', width: 160, render: (r) => formatDate(r.createdAt) },
  ];

  const bomActionColumn: Column<BOM> = {
    id: 'actions', label: '操作', width: 220,
    render: (r) => (
      <Box>
        <Tooltip title={expandedBomId === r.id ? '收起版本' : '展开版本'}>
          <IconButton size="small" onClick={() => handleExpandBom(r.id)}>
            {expandedBomId === r.id ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        {r.bomType === 'EBOM' && (
          <Tooltip title="EBOM→MBOM">
            <IconButton size="small" color="warning" onClick={() => handleBomConvert(r.id, 'EBOM→MBOM')}>
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {r.bomType === 'MBOM' && (
          <Tooltip title="MBOM→CBOM">
            <IconButton size="small" color="success" onClick={() => handleBomConvert(r.id, 'MBOM→CBOM')}>
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="删除">
          <IconButton size="small" color="error" onClick={async () => {
            if (!window.confirm('确定删除该BOM？')) return;
            try {
              await removeBom(r.id);
              const err = useM08Store.getState().error;
              if (err) { onError(err); } else { onSuccess('BOM删除成功'); }
            } catch (e) { onError(e); }
          }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  };

  return (
    <>
      <PageHeader
        title="采购管理"
        subtitle={activeTab === 'orders' ? `共 ${filtered.length} 个采购单` : `共 ${boms.length} 个BOM`}
        action={
          activeTab === 'orders' ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDrawerOpen(true); }} sx={{ backgroundColor: '#005591' }}>
              新增采购单
            </Button>
          ) : null
        }
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {bomError && activeTab === 'bom' && <Alert severity="error" sx={{ mb: 2 }}>{bomError}</Alert>}

      <Tabs value={activeTab} onChange={(_e, v) => { setActiveTab(v); setExpandedBomId(null); }} sx={{ mb: 2 }}>
        <Tab label="采购单" value="orders" />
        <Tab label="BOM 清单" value="bom" />
      </Tabs>

      {activeTab === 'orders' && (
        <>
          <SearchBar placeholder="搜索采购单号/供应商" value={keyword} onChange={setKeyword} />
          <Box sx={{ position: 'relative' }}>
            <LoadingOverlay loading={loading} />
            <DataTable<PurchaseOrder>
              columns={[...columns, actionColumn]}
              rows={filtered}
              rowKey="id"
              loading={loading}
              page={0}
              pageSize={20}
              total={filtered.length}
            />
          </Box>
        </>
      )}

      {activeTab === 'bom' && (
        <Box sx={{ position: 'relative' }}>
          <LoadingOverlay loading={bomLoading} />
          <DataTable<BOM>
            columns={[...bomColumns, bomActionColumn]}
            rows={boms}
            rowKey="id"
            loading={bomLoading}
            page={0}
            pageSize={20}
            total={boms.length}
          />
          {boms.map((bom) => (
            <Collapse key={bom.id} in={expandedBomId === bom.id}>
              <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  BOM「{bom.id}」版本历史
                </Typography>
                {versions.filter((v) => v.bomId === bom.id).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">暂无版本记录</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {versions.filter((v) => v.bomId === bom.id).map((v) => (
                      <Chip
                        key={v.id}
                        label={`v${v.version} - ${v.changeNote || '无备注'} (${formatDate(v.createdAt)})`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Collapse>
          ))}
        </Box>
      )}
      <FormDrawer
        open={drawerOpen}
        title={editing ? '编辑采购单' : '新增采购单'}
        onCancel={() => { setDrawerOpen(false); setEditing(null); }}
        width={560}
      >
        <PurchaseOrderForm
          initial={editing ?? undefined}
          onSubmit={async (data) => {
            useM09Store.setState({ error: null });
            try {
              if (editing) {
                await updateOrder(editing.id, data);
              } else {
                await createOrder(data);
              }
              const err = useM09Store.getState().error;
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

/** 内嵌表单组件 */
function PurchaseOrderForm({ initial, onSubmit }: { initial?: PurchaseOrder; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    code: initial?.code ?? '',
    supplierName: initial?.supplierName ?? '',
    contactName: initial?.contactName ?? '',
    contactPhone: initial?.contactPhone ?? '',
    orderDate: initial?.orderDate ?? '',
    expectedDate: initial?.expectedDate ?? '',
    amount: initial?.amount ?? 0,
    status: initial?.status ?? 'draft',
    remark: initial?.remark ?? '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, amount: Number(e.target.value) || 0 }));
  };

  const handleSubmit = () => {
    onSubmit({
      code: form.code,
      supplierName: form.supplierName || undefined,
      contactName: form.contactName || undefined,
      contactPhone: form.contactPhone || undefined,
      orderDate: form.orderDate || undefined,
      expectedDate: form.expectedDate || undefined,
      amount: form.amount || undefined,
      status: form.status,
      remark: form.remark || undefined,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <TextField label="采购单号" value={form.code} onChange={handleChange('code')} size="small" required fullWidth />
        <TextField label="供应商" value={form.supplierName} onChange={handleChange('supplierName')} size="small" fullWidth />
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <TextField label="联系人" value={form.contactName} onChange={handleChange('contactName')} size="small" fullWidth />
        <TextField label="联系电话" value={form.contactPhone} onChange={handleChange('contactPhone')} size="small" fullWidth />
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <TextField label="订购日期" type="date" value={form.orderDate} onChange={handleChange('orderDate')} size="small" fullWidth InputLabelProps={{ shrink: true }} />
        <TextField label="预计到货" type="date" value={form.expectedDate} onChange={handleChange('expectedDate')} size="small" fullWidth InputLabelProps={{ shrink: true }} />
      </div>
      <TextField label="金额" type="number" value={form.amount} onChange={handleAmountChange} size="small" fullWidth required />
      <TextField label="状态" value={form.status} onChange={handleChange('status')} size="small" select fullWidth>
        <MenuItem value="draft">草稿</MenuItem>
        <MenuItem value="submitted">已提交</MenuItem>
        <MenuItem value="approved">已审批</MenuItem>
        <MenuItem value="ordered">已下单</MenuItem>
        <MenuItem value="partial_received">部分到货</MenuItem>
        <MenuItem value="received">已到货</MenuItem>
        <MenuItem value="cancelled">已取消</MenuItem>
      </TextField>
      <TextField label="备注" value={form.remark} onChange={handleChange('remark')} size="small" multiline rows={3} fullWidth />
      <div style={{ display: 'none' }} onClick={handleSubmit} />
    </div>
  );
}
