import { useState, useEffect } from 'react';
import { TextField, MenuItem, Box, Stack, Autocomplete } from '@mui/material';
import { useM02Store } from '@/stores/useM02Store';
import type { Contract } from '@/types/m06';
import type { Customer } from '@/types/m02';

const CURRENCIES = [
  { value: 'CNY', label: '人民币' },
  { value: 'USD', label: '美元' },
  { value: 'EUR', label: '欧元' },
];

const PAYMENT_TERMS = ['预付30%/发货前70%', '预付50%/发货前50%', '月结30天', '月结60天'];

interface ContractFormProps {
  initial?: Contract;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}

export default function ContractForm({ initial, onSubmit }: ContractFormProps) {
  const [form, setForm] = useState({
    code: initial?.code ?? '',
    title: initial?.title ?? '',
    customerId: initial?.customerId ?? '',
    customerName: initial?.customerName ?? '',
    amount: initial?.amount ?? 0,
    currencyId: initial?.currencyId ?? 'CNY',
    signDate: initial?.signDate ?? '',
    deliveryDate: initial?.deliveryDate ?? '',
    paymentTerms: initial?.paymentTerms ?? '',
    terms: initial?.terms ?? '',
    quotationId: initial?.quotationId ?? '',
  });

  const { customers, fetchCustomers } = useM02Store();
  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, amount: Number(e.target.value) || 0 }));
  };

  const handleCustomerChange = (_: unknown, value: Customer | null) => {
    setForm((prev) => ({
      ...prev,
      customerId: value?.id ?? '',
      customerName: value?.name ?? '',
    }));
  };

  const handleSubmit = () => {
    onSubmit({
      code: form.code,
      title: form.title,
      customerId: form.customerId,
      customerName: form.customerName || undefined,
      amount: form.amount || undefined,
      currencyId: form.currencyId || undefined,
      signDate: form.signDate || undefined,
      deliveryDate: form.deliveryDate || undefined,
      paymentTerms: form.paymentTerms || undefined,
      terms: form.terms || undefined,
      quotationId: form.quotationId || undefined,
    });
  };

  const selectedCustomer = customers.find((c) => c.id === form.customerId) ?? null;

  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      <TextField label="合同编号" value={form.code} onChange={handleChange('code')} size="small" fullWidth required />
      <TextField label="项目名称" value={form.title} onChange={handleChange('title')} size="small" fullWidth required />
      <Autocomplete
        options={customers}
        getOptionLabel={(c) => c.name}
        value={selectedCustomer}
        onChange={handleCustomerChange}
        renderInput={(params) => <TextField {...params} label="客户*" size="small" required />}
        isOptionEqualToValue={(o, v) => o.id === v.id}
      />
      <TextField label="合同金额" type="number" value={form.amount} onChange={handleAmountChange} size="small" fullWidth required />
      <TextField label="币种" select value={form.currencyId} onChange={handleChange('currencyId')} size="small" fullWidth>
        {CURRENCIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
      </TextField>
      <TextField label="签订日期" type="date" value={form.signDate} onChange={handleChange('signDate')} size="small" fullWidth InputLabelProps={{ shrink: true }} />
      <TextField label="交货日期" type="date" value={form.deliveryDate} onChange={handleChange('deliveryDate')} size="small" fullWidth InputLabelProps={{ shrink: true }} />
      <TextField label="付款条款" select value={form.paymentTerms} onChange={handleChange('paymentTerms')} size="small" fullWidth>
        {PAYMENT_TERMS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
      </TextField>
      <TextField label="合同条款" value={form.terms} onChange={handleChange('terms')} size="small" fullWidth multiline rows={3} />
      {/* 隐藏提交触发器：FormDrawer 的提交按钮会调用 onSubmit */}
      <Box sx={{ display: 'none' }} onClick={handleSubmit} />
    </Stack>
  );
}
