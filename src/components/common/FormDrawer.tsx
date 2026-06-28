import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  Stack,
  TextField as MuiTextField,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface FormDrawerProps {
  open: boolean;
  title: string;
  width?: number;
  children: React.ReactNode;
  onSubmit?: () => void;
  onCancel: () => void;
  onClose?: () => void;
  onSave?: () => Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

/** 表单内文本字段 */
function FormTextField({
  label,
  value,
  onChange,
  required,
  multiline,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <MuiTextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      fullWidth
      required={required}
      multiline={multiline}
      rows={rows}
    />
  );
}

/** 表单内选择字段 */
function FormSelect({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  required?: boolean;
}) {
  return (
    <MuiTextField
      select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      fullWidth
      required={required}
    >
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </MuiTextField>
  );
}

/** 侧滑表单抽屉 */
function FormDrawerComponent({
  open,
  title,
  width = 480,
  children,
  onSubmit,
  onCancel,
  onClose,
  onSave,
  submitLabel = '保存',
  cancelLabel = '取消',
  loading = false,
}: FormDrawerProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose ?? onCancel} PaperProps={{ sx: { width, p: 0 } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}>
          <Typography variant="h6" fontWeight={700} color="#005591">
            {title}
          </Typography>
          <IconButton onClick={onCancel} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />

        {/* Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2 }}>
          {children}
        </Box>

        {/* Footer */}
        {(onSubmit || onSave) && (
          <>
            <Divider />
            <Box sx={{ px: 3, py: 2 }}>
              <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button onClick={onCancel} sx={{ color: '#666' }}>
                  {cancelLabel}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (onSave) {
                      onSave();
                    } else if (onSubmit) {
                      onSubmit();
                    }
                  }}
                  disabled={loading}
                  sx={{ backgroundColor: '#005591', '&:hover': { backgroundColor: '#004477' } }}
                >
                  {submitLabel}
                </Button>
              </Stack>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}

/** 附加静态子组件 */
const FormDrawer = Object.assign(FormDrawerComponent, {
  TextField: FormTextField,
  Select: FormSelect,
});

export default FormDrawer;
