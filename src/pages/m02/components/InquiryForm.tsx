import React, { useState } from 'react';
import { TextField, MenuItem, Stack } from '@mui/material';
import { SHELF_TYPES } from '@/utils/constants';
import { useM02Store } from '@/stores/useM02Store';
import FormDrawer from '@/components/common/FormDrawer';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';

const UNITS = ['套', '组', '排', '层', '个'];

/** 询价类型 */
const INQUIRY_TYPES = [
  { value: 'standard', label: '标准货架' },
  { value: 'custom', label: '定制货架' },
  { value: 'accessory', label: '配件' },
];

/** 紧急程度 */
const URGENCY_LEVELS = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
];

/** 询价表单数据 */
export interface InquiryFormData {
  customerId: string;
  customerName: string;
  contact: string;
  inquiryType: string;
  shelfType: string;
  requirement: string;
  quantity: number;
  unit: string;
  budget: string;
  deliveryDate: string;
  urgency: string;
}

/** 默认表单数据 */
export const defaultInquiryFormData: InquiryFormData = {
  customerId: '',
  customerName: '',
  contact: '',
  inquiryType: 'standard',
  shelfType: '',
  requirement: '',
  quantity: 1,
  unit: '套',
  budget: '',
  deliveryDate: '',
  urgency: 'medium',
};

export interface InquiryFormProps {
  open: boolean;
  onClose: () => void;
}

/** 完整询价表单（自包含 FormDrawer） */
export default function InquiryForm({ open, onClose }: InquiryFormProps) {
  const { customers, createInquiry } = useM02Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [formData, setFormData] = useState<InquiryFormData>(defaultInquiryFormData);

  const handleChange = (field: keyof InquiryFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const val = e.target.value;
    if (field === 'customerId') {
      const customer = customers.find((c) => c.id === val);
      setFormData((prev) => ({ ...prev, customerId: val, customerName: customer?.name ?? '' }));
    } else if (field === 'quantity') {
      setFormData((prev) => ({ ...prev, quantity: Number(val) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: val }));
    }
  };

  const handleClose = () => {
    setFormData(defaultInquiryFormData);
    onClose();
  };

  const handleSubmit = async () => {
    useM02Store.setState({ error: null });
    await createInquiry({
      code: `INQ-${Date.now().toString().slice(-6)}`,
      customerId: formData.customerId,
      customerName: formData.customerName,
      shelfType: formData.shelfType,
      requirement: formData.requirement,
      quantity: formData.quantity,
      unit: formData.unit,
      deliveryDate: formData.deliveryDate,
      status: 'draft',
    });
    const err = useM02Store.getState().error;
    if (err) {
      onError(err);
    } else {
      onSuccess('询价单创建成功');
    }
    setFormData(defaultInquiryFormData);
    onClose();
  };

  return (
    <FormDrawer open={open} title="新增询价单" width={560} onCancel={handleClose} onSubmit={handleSubmit}>
      <Stack spacing={2} sx={{ pt: 1 }}>
        {/* 客户名称 - 下拉选择已有客户 */}
        <TextField
          label="客户名称"
          size="small"
          fullWidth
          required
          select
          value={formData.customerId}
          onChange={handleChange('customerId')}
        >
          <MenuItem value="">请选择客户</MenuItem>
          {customers.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </TextField>

        {/* 联系方式 */}
        <TextField
          label="联系方式"
          size="small"
          fullWidth
          value={formData.contact}
          onChange={handleChange('contact')}
          placeholder="电话/邮箱"
        />

        {/* 询价类型 */}
        <TextField
          label="询价类型"
          size="small"
          fullWidth
          select
          value={formData.inquiryType}
          onChange={handleChange('inquiryType')}
        >
          {INQUIRY_TYPES.map((t) => (
            <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
          ))}
        </TextField>

        {/* 货架类型 */}
        <TextField
          label="货架类型"
          size="small"
          fullWidth
          select
          value={formData.shelfType}
          onChange={handleChange('shelfType')}
        >
          <MenuItem value="">请选择</MenuItem>
          {SHELF_TYPES.map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </TextField>

        {/* 需求数量 + 单位 */}
        <TextField
          label="需求数量"
          size="small"
          fullWidth
          type="number"
          value={formData.quantity}
          onChange={handleChange('quantity')}
          required
        />
        <TextField
          label="单位"
          size="small"
          fullWidth
          select
          value={formData.unit}
          onChange={handleChange('unit')}
        >
          {UNITS.map((u) => (
            <MenuItem key={u} value={u}>{u}</MenuItem>
          ))}
        </TextField>

        {/* 需求描述 - 多行文本 */}
        <TextField
          label="需求描述"
          size="small"
          fullWidth
          multiline
          rows={3}
          value={formData.requirement}
          onChange={handleChange('requirement')}
          placeholder="详细描述客户需求..."
        />

        {/* 预算范围 */}
        <TextField
          label="预算范围"
          size="small"
          fullWidth
          value={formData.budget}
          onChange={handleChange('budget')}
          placeholder="如：10-50万元"
        />

        {/* 期望交期 */}
        <TextField
          label="期望交期"
          size="small"
          fullWidth
          type="date"
          value={formData.deliveryDate}
          onChange={handleChange('deliveryDate')}
          InputLabelProps={{ shrink: true }}
          required
        />

        {/* 紧急程度 */}
        <TextField
          label="紧急程度"
          size="small"
          fullWidth
          select
          value={formData.urgency}
          onChange={handleChange('urgency')}
        >
          {URGENCY_LEVELS.map((u) => (
            <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
          ))}
        </TextField>
      </Stack>
    </FormDrawer>
  );
}
