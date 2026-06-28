import { useState, useEffect } from 'react';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TextField, IconButton, Typography, Alert, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM13Store } from '@/stores/useM13Store';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatMoney } from '@/utils/format';
import type { VoucherEntry } from '@/types/m13';

interface EntryRow {
  key: number;
  accountId: string;
  summary: string;
  debitAmount: number;
  creditAmount: number;
  sortOrder: number;
}

let nextKey = 1;
function makeEntry(): EntryRow {
  return { key: nextKey++, accountId: '', summary: '', debitAmount: 0, creditAmount: 0, sortOrder: 0 };
}

export default function VoucherEntryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  const { currentVoucher, loading, error, fetchVoucherById, createVoucher, updateVoucher, accounts, fetchAccounts, accountTree, fetchAccountTree } = useM13Store();

  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().slice(0, 10));
  const [remark, setRemark] = useState('');
  const [entries, setEntries] = useState<EntryRow[]>([makeEntry(), makeEntry()]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchAccounts({ pageSize: 200 });
    fetchAccountTree();
  }, [fetchAccounts, fetchAccountTree]);

  useEffect(() => {
    if (editId) {
      fetchVoucherById(editId);
    }
  }, [editId, fetchVoucherById]);

  useEffect(() => {
    if (editId && currentVoucher) {
      setVoucherDate(currentVoucher.voucherDate?.slice(0, 10) || '');
      setRemark(currentVoucher.remark || '');
      if (currentVoucher.entries && currentVoucher.entries.length > 0) {
        setEntries(currentVoucher.entries.map((e, i) => ({
          key: nextKey++,
          accountId: e.accountId,
          summary: e.summary || '',
          debitAmount: Number(e.debitAmount),
          creditAmount: Number(e.creditAmount),
          sortOrder: i,
        })));
      }
    }
  }, [editId, currentVoucher]);

  const debitSum = entries.reduce((s, e) => s + (e.debitAmount || 0), 0);
  const creditSum = entries.reduce((s, e) => s + (e.creditAmount || 0), 0);
  const balanced = Math.abs(debitSum - creditSum) < 0.005;

  const updateEntry = (key: number, field: keyof EntryRow, value: string | number) => {
    setEntries((prev) =>
      prev.map((e) => (e.key === key ? { ...e, [field]: field === 'debitAmount' || field === 'creditAmount' ? Number(value) || 0 : value } : e)),
    );
  };

  const addRow = () => setEntries((prev) => [...prev, makeEntry()]);
  const removeRow = (key: number) => {
    if (entries.length <= 2) return;
    setEntries((prev) => prev.filter((e) => e.key !== key));
  };

  const handleSave = async () => {
    if (!voucherDate) { setMsg({ type: 'error', text: '请选择凭证日期' }); return; }
    if (entries.some((e) => !e.accountId)) { setMsg({ type: 'error', text: '每行分录必须选择科目' }); return; }
    if (!balanced) { setMsg({ type: 'error', text: `借贷不平衡：借 ${formatMoney(debitSum)} ≠ 贷 ${formatMoney(creditSum)}` }); return; }

    setSubmitting(true);
    setMsg(null);
    try {
      const payload = {
        voucherDate,
        remark,
        entries: entries.map((e, i) => ({
          accountId: e.accountId,
          summary: e.summary,
          debitAmount: e.debitAmount,
          creditAmount: e.creditAmount,
          sortOrder: i,
        })),
      };
      if (editId) {
        await updateVoucher(editId, payload);
      } else {
        await createVoucher(payload);
      }
      const err = useM13Store.getState().error;
      if (err) { setMsg({ type: 'error', text: err }); } else {
        setMsg({ type: 'success', text: editId ? '更新成功' : '凭证保存成功' });
        if (!editId) {
          setEntries([makeEntry(), makeEntry()]);
          setRemark('');
        }
      }
    } catch (e) {
      setMsg({ type: 'error', text: e instanceof Error ? e.message : String(e) });
    } finally {
      setSubmitting(false);
    }
  };

  // 构建科目下拉选项（树形展开）
  const flattenAccounts = (tree: any[], depth = 0): { id: string; label: string }[] => {
    const result: { id: string; label: string }[] = [];
    for (const a of tree) {
      const indent = depth > 0 ? `${'　'.repeat(depth)}` : '';
      result.push({ id: a.id, label: `${indent}${a.code} ${a.name}` });
      if (a.children) {
        result.push(...flattenAccounts(a.children, depth + 1));
      }
    }
    return result;
  };

  const accountOptions = flattenAccounts(accountTree);

  return (
    <>
      <PageHeader title={editId ? '编辑凭证' : '录入凭证'}
        subtitle={editId ? `凭证号: ${currentVoucher?.voucherNo || ''}` : undefined}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/m13/vouchers')}>返回</Button>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}
              disabled={submitting} sx={{ backgroundColor: '#005591' }}>
              {submitting ? '保存中...' : '保存凭证'}
            </Button>
          </Box>
        } />

      {msg && <Alert severity={msg.type} sx={{ mb: 2 }} onClose={() => setMsg(null)}>{msg.text}</Alert>}

      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <TextField label="凭证日期" type="date" size="small"
              value={voucherDate} onChange={(e) => setVoucherDate(e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ width: 200 }} />
            <TextField label="摘要/备注" size="small"
              value={remark} onChange={(e) => setRemark(e.target.value)}
              sx={{ flex: 1 }} />
          </Box>
        </Paper>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={40}>#</TableCell>
                <TableCell width={240}>科目</TableCell>
                <TableCell>摘要</TableCell>
                <TableCell width={150} align="right">借方金额</TableCell>
                <TableCell width={150} align="right">贷方金额</TableCell>
                <TableCell width={60}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry, idx) => (
                <TableRow key={entry.key}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    <Box component="select" value={entry.accountId}
                      onChange={(e: any) => updateEntry(entry.key, 'accountId', e.target.value)}
                      style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}>
                      <option value="">请选择科目</option>
                      {accountOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box component="input" value={entry.summary}
                      onChange={(e: any) => updateEntry(entry.key, 'summary', e.target.value)}
                      placeholder="摘要"
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }} />
                  </TableCell>
                  <TableCell>
                    <Box component="input" type="number" min="0" step="0.01"
                      value={entry.debitAmount || ''}
                      onChange={(e: any) => updateEntry(entry.key, 'debitAmount', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, textAlign: 'right' }} />
                  </TableCell>
                  <TableCell>
                    <Box component="input" type="number" min="0" step="0.01"
                      value={entry.creditAmount || ''}
                      onChange={(e: any) => updateEntry(entry.key, 'creditAmount', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, textAlign: 'right' }} />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="删除行">
                      <IconButton size="small" color="error" onClick={() => removeRow(entry.key)} disabled={entries.length <= 2}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} align="right" sx={{ fontWeight: 600 }}>
                  合计
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: balanced ? 'success.main' : 'error.main' }}>
                  {formatMoney(debitSum)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: balanced ? 'success.main' : 'error.main' }}>
                  {formatMoney(creditSum)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button size="small" startIcon={<AddIcon />} onClick={addRow}>添加分录</Button>
          {!balanced && debitSum > 0 && creditSum > 0 && (
            <Typography variant="body2" color="error">
              差额: {formatMoney(Math.abs(debitSum - creditSum))}
            </Typography>
          )}
          {balanced && debitSum > 0 && (
            <Typography variant="body2" color="success.main">借贷平衡 ✓</Typography>
          )}
        </Box>
      </Box>
    </>
  );
}
