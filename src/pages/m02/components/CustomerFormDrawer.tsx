import FormDrawer from '@/components/common/FormDrawer';
import { TextField, MenuItem, Stack } from '@mui/material';
import { useM02Store } from '@/stores/useM02Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';

const CUSTOMER_TYPES = [
  { value: 'direct', label: '直客' },
  { value: 'agent', label: '代理商' },
  { value: 'distributor', label: '经销商' },
];

const CUSTOMER_LEVELS = [
  { value: 'A', label: 'A级' }, { value: 'B', label: 'B级' },
  { value: 'C', label: 'C级' }, { value: 'D', label: 'D级' },
];

interface CustomerFormDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CustomerFormDrawer({ open, onClose }: CustomerFormDrawerProps) {
  const { createCustomer } = useM02Store();
  const { onSuccess, onError } = useCrudFeedback();

  const handleSubmit = async () => {
    useM02Store.setState({ error: null });
    await createCustomer({
      name: '', code: '', shortName: '', type: 'direct', industry: '', region: '',
      level: 'C', source: '', status: 'active',
    });
    const err = useM02Store.getState().error;
    if (err) {
      onError(err);
    } else {
      onSuccess('客户创建成功');
    }
    onClose();
  };

  return (
    <FormDrawer open={open} title="新增客户" onCancel={onClose} onSubmit={handleSubmit}>
      <Stack spacing={2} sx={{ pt: 1 }}>
        <TextField label="客户名称" size="small" fullWidth required />
        <TextField label="客户编码" size="small" fullWidth required />
        <TextField label="简称" size="small" fullWidth />
        <TextField label="客户类型" size="small" fullWidth select defaultValue="direct">
          {CUSTOMER_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
        </TextField>
        <TextField label="行业" size="small" fullWidth />
        <TextField label="区域" size="small" fullWidth />
        <TextField label="等级" size="small" fullWidth select defaultValue="C">
          {CUSTOMER_LEVELS.map((l) => <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>)}
        </TextField>
        <TextField label="来源" size="small" fullWidth />
      </Stack>
    </FormDrawer>
  );
}
