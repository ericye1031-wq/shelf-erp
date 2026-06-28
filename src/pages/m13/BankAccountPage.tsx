import { useEffect, useState } from 'react';
import {
  Button, Box, Card, CardContent, Typography, Grid, Tooltip, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import FormDrawer from '@/components/common/FormDrawer';
import { useM13Store } from '@/stores/useM13Store';
import { formatMoney } from '@/utils/format';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import type { BankAccountEntity } from '@/types/m13';

const TYPE_LABELS: Record<string, string> = { cash: '现金', bank: '银行', other: '其他' };

export default function BankAccountPage() {
  const { bankAccounts, loading, error, fetchBankAccounts, createBankAccount, updateBankAccount, removeBankAccount } = useM13Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [keyword, setKeyword] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<BankAccountEntity | null>(null);

  useEffect(() => { fetchBankAccounts(); }, [fetchBankAccounts]);

  const filtered = bankAccounts.filter((a) =>
    (a.name || '').includes(keyword) || (a.accountNo || '').includes(keyword) || (a.bankName || '').includes(keyword)
  );

  const totalBalance = filtered.reduce((s, a) => s + (a.balance || 0), 0);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`确定删除银行账户「${name}」？`)) return;
    try {
      await removeBankAccount(id);
      const err = useM13Store.getState().error;
      if (err) onError(err); else onSuccess('删除成功');
    } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
  };

  return (
    <>
      <PageHeader title="银行账户" subtitle={`共 ${filtered.length} 个账户 · 总余额 ${formatMoney(totalBalance)}`}
        action={
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => { setEditing(null); setDrawerOpen(true); }} sx={{ backgroundColor: '#005591' }}>
            新增账户
          </Button>} />
      {error && <Box sx={{ p: 2, mb: 2, bgcolor: '#fff0f0', borderRadius: 1, color: 'error.main' }}>错误：{error}</Box>}
      <SearchBar placeholder="搜索账户名称/账号/银行" value={keyword} onChange={setKeyword} />
      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <Grid container spacing={2}>
          {filtered.map((account) => (
            <Grid key={account.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card variant="outlined" sx={{
                borderLeft: `4px solid ${account.active ? '#1565c0' : '#9e9e9e'}`,
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: 3 },
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountBalanceIcon sx={{ color: '#1565c0' }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>{account.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{account.bankName}</Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Tooltip title="编辑">
                        <IconButton size="small" onClick={() => { setEditing(account); setDrawerOpen(true); }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="删除">
                        <IconButton size="small" color="error" onClick={() => handleDelete(account.id, account.name)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">账号</Typography>
                    <Typography variant="body2" fontFamily="monospace">{account.accountNo}</Typography>
                  </Box>
                  <Box sx={{ mt: 1, display: 'flex', gap: 3 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">币种</Typography>
                      <Typography variant="body2">{account.currency}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">类型</Typography>
                      <Typography variant="body2">{TYPE_LABELS[account.accountType] || account.accountType}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">当前余额</Typography>
                    <Typography variant="h5" sx={{ color: '#1565c0', fontWeight: 700 }}>
                      {formatMoney(account.balance)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {filtered.length === 0 && !loading && (
            <Grid size={12}>
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>暂无银行账户</Box>
            </Grid>
          )}
        </Grid>
      </Box>

      <FormDrawer open={drawerOpen} title={editing ? '编辑账户' : '新增账户'} onCancel={() => { setDrawerOpen(false); setEditing(null); }} width={460}>
        <BankAccountForm initial={editing ?? undefined} onSubmit={async (data) => {
          useM13Store.setState({ error: null });
          try {
            if (editing) { await updateBankAccount(editing.id, data); }
            else { await createBankAccount(data); }
            const err = useM13Store.getState().error;
            if (err) onError(err); else { onSuccess(editing ? '更新成功' : '创建成功'); fetchBankAccounts(); }
            setDrawerOpen(false); setEditing(null);
          } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
        }} />
      </FormDrawer>
    </>
  );
}

function BankAccountForm({ initial, onSubmit }: {
  initial?: BankAccountEntity; onSubmit: (d: Record<string, unknown>) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [accountNo, setAccountNo] = useState(initial?.accountNo || '');
  const [bankName, setBankName] = useState(initial?.bankName || '');
  const [branchName, setBranchName] = useState(initial?.branchName || '');
  const [currency, setCurrency] = useState(initial?.currency || 'CNY');
  const [balance, setBalance] = useState(initial?.balance ? String(initial.balance) : '0');
  const [accountType, setAccountType] = useState(initial?.accountType || 'bank');
  const [remark, setRemark] = useState(initial?.remark || '');
  const [submitting, setSubmitting] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
      <Box component="input" value={name} onChange={(e: any) => setName(e.target.value)}
        placeholder="账户名称 *" style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
      <Box component="input" value={accountNo} onChange={(e: any) => setAccountNo(e.target.value)}
        placeholder="账号 *" style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
      <Box component="input" value={bankName} onChange={(e: any) => setBankName(e.target.value)}
        placeholder="银行名称 *" style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
      <Box component="input" value={branchName} onChange={(e: any) => setBranchName(e.target.value)}
        placeholder="支行名称" style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Box component="select" value={currency} onChange={(e: any) => setCurrency(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}>
            <option value="CNY">CNY 人民币</option>
            <option value="USD">USD 美元</option>
            <option value="EUR">EUR 欧元</option>
          </Box>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box component="select" value={accountType} onChange={(e: any) => setAccountType(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}>
            <option value="bank">银行账户</option>
            <option value="cash">现金</option>
            <option value="other">其他</option>
          </Box>
        </Box>
      </Box>
      <Box component="input" type="number" min="0" step="0.01" value={balance} onChange={(e: any) => setBalance(e.target.value)}
        placeholder="期初余额" style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
      <Box component="input" value={remark} onChange={(e: any) => setRemark(e.target.value)}
        placeholder="备注" style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
      <Button variant="contained" onClick={async () => { setSubmitting(true); await onSubmit({ name, accountNo, bankName, branchName, currency, balance: Number(balance), accountType, remark }); setSubmitting(false); }}
        disabled={submitting || !name || !accountNo || !bankName} sx={{ backgroundColor: '#005591' }}>保存</Button>
    </Box>
  );
}
