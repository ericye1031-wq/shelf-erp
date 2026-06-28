import { useEffect, useState } from 'react';
import {
  Button, Box, Tooltip, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import FormDrawer from '@/components/common/FormDrawer';
import { useM13Store } from '@/stores/useM13Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import type { Account } from '@/types/m13';

const CATEGORY_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  '资产': 'primary', '负债': 'warning', '权益': 'success',
  '成本': 'error', '损益': 'info',
};

function AccountRow({ account, level, onEdit, onDelete }: {
  account: Account; level: number; onEdit: (a: Account) => void; onDelete: (a: Account) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = (account.children || []).length > 0;

  return (
    <>
      <TableRow sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
        <TableCell sx={{ pl: 2 + level * 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {hasChildren && (
              <IconButton size="small" onClick={() => setOpen(!open)}>
                {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            )}
            {!hasChildren && <Box sx={{ width: 28 }} />}
            <Chip label={account.code} size="small" variant="outlined" sx={{ mr: 1, fontFamily: 'monospace' }} />
            {account.name}
          </Box>
        </TableCell>
        <TableCell>
          <Chip label={account.category} size="small" color={CATEGORY_COLORS[account.category] || 'default'} />
        </TableCell>
        <TableCell>{account.balanceDirection === 'debit' ? '借方' : '贷方'}</TableCell>
        <TableCell>
          <Chip label={account.status === 'active' ? '启用' : '停用'} size="small"
            color={account.status === 'active' ? 'success' : 'default'} />
        </TableCell>
        <TableCell>
          <Tooltip title="编辑">
            <IconButton size="small" onClick={() => onEdit(account)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="删除">
            <IconButton size="small" color="error" onClick={() => onDelete(account)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      {hasChildren && (
        <TableRow>
          <TableCell colSpan={5} sx={{ p: 0, border: 0 }}>
            <Collapse in={open}>
              <Box>
                {(account.children || []).map((child) => (
                  <AccountRow key={child.id} account={child} level={level + 1} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function AccountListPage() {
  const { accountTree, loading, error, fetchAccountTree, createAccount, updateAccount, removeAccount } = useM13Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [keyword, setKeyword] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  useEffect(() => { fetchAccountTree(); }, [fetchAccountTree]);

  const filtered = filterTree(accountTree, keyword);

  function filterTree(tree: Account[], kw: string): Account[] {
    if (!kw) return tree;
    return tree
      .map((a) => ({
        ...a,
        children: filterTree(a.children || [], kw),
      }))
      .filter((a) => a.code.includes(kw) || a.name.includes(kw) || (a.children || []).length > 0);
  }

  const handleDelete = async (account: Account) => {
    if (!window.confirm(`确定删除科目「${account.code} ${account.name}」？`)) return;
    try {
      await removeAccount(account.id);
      const err = useM13Store.getState().error;
      if (err) onError(err); else { onSuccess('删除成功'); fetchAccountTree(); }
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <>
      <PageHeader title="科目管理" subtitle={`共 ${countTree(accountTree)} 个科目`}
        action={
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => { setEditing(null); setDrawerOpen(true); }}
            sx={{ backgroundColor: '#005591' }}>新增科目</Button>
        } />
      {error && <Box sx={{ p: 2, mb: 2, bgcolor: '#fff0f0', borderRadius: 1, color: 'error.main' }}>错误：{error}</Box>}
      <SearchBar placeholder="搜索科目编码/名称" value={keyword} onChange={setKeyword} />
      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>科目编码/名称</TableCell>
                <TableCell>类别</TableCell>
                <TableCell>余额方向</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 && !loading && (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>暂无科目</TableCell></TableRow>
              )}
              {filtered.map((account) => (
                <AccountRow key={account.id} account={account} level={0}
                  onEdit={(a) => { setEditing(a); setDrawerOpen(true); }}
                  onDelete={handleDelete} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <FormDrawer open={drawerOpen} title={editing ? '编辑科目' : '新增科目'}
        onCancel={() => { setDrawerOpen(false); setEditing(null); }} width={480}>
        <AccountForm initial={editing ?? undefined}
          onSubmit={async (data) => {
            useM13Store.setState({ error: null });
            try {
              if (editing) { await updateAccount(editing.id, data); }
              else { await createAccount(data); }
              const err = useM13Store.getState().error;
              if (err) onError(err); else { onSuccess(editing ? '更新成功' : '创建成功'); fetchAccountTree(); }
              setDrawerOpen(false); setEditing(null);
            } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
          }} />
      </FormDrawer>
    </>
  );
}

function countTree(tree: Account[]): number {
  return tree.reduce((c, a) => c + 1 + countTree(a.children || []), 0);
}

function AccountForm({ initial, onSubmit }: {
  initial?: Account; onSubmit: (data: Record<string, unknown>) => Promise<void>;
}) {
  const [code, setCode] = useState(initial?.code || '');
  const [name, setName] = useState(initial?.name || '');
  const [category, setCategory] = useState(initial?.category || '资产');
  const [balanceDirection, setBalanceDirection] = useState(initial?.balanceDirection || 'debit');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit({ code, name, category, balanceDirection, isLeaf: true });
    setSubmitting(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
      <Box>
        <Box component="label" sx={{ fontSize: 14, fontWeight: 500, mb: 0.5, display: 'block' }}>科目编码 *</Box>
        <Box component="input" value={code} onChange={(e: any) => setCode(e.target.value)}
          placeholder="如 1001" disabled={!!initial}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
      </Box>
      <Box>
        <Box component="label" sx={{ fontSize: 14, fontWeight: 500, mb: 0.5, display: 'block' }}>科目名称 *</Box>
        <Box component="input" value={name} onChange={(e: any) => setName(e.target.value)}
          placeholder="如 库存现金"
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
      </Box>
      <Box>
        <Box component="label" sx={{ fontSize: 14, fontWeight: 500, mb: 0.5, display: 'block' }}>类别 *</Box>
        <Box component="select" value={category} onChange={(e: any) => setCategory(e.target.value)}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}>
          {['资产', '负债', '权益', '成本', '损益'].map((c) => <option key={c} value={c}>{c}</option>)}
        </Box>
      </Box>
      <Box>
        <Box component="label" sx={{ fontSize: 14, fontWeight: 500, mb: 0.5, display: 'block' }}>余额方向</Box>
        <Box component="select" value={balanceDirection} onChange={(e: any) => setBalanceDirection(e.target.value)}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}>
          <option value="debit">借方</option>
          <option value="credit">贷方</option>
        </Box>
      </Box>
      <Button variant="contained" onClick={handleSubmit} disabled={submitting || !code || !name}
        sx={{ mt: 1, backgroundColor: '#005591' }}>
        {submitting ? '保存中...' : '保存'}
      </Button>
    </Box>
  );
}
