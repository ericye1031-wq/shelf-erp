import { Box, Typography, Stack } from '@mui/material';
import StatusBadge from '@/components/common/StatusBadge';
import { formatMoney, formatDate } from '@/utils/format';
import type { Invoice } from '@/types/m06';

const STATUS_LABELS: Record<string, string> = { pending: '待开票', issued: '已开票', cancelled: '已作废' };
const TYPE_LABELS: Record<string, string> = { normal: '增值税普通发票', special: '增值税专用发票' };

interface InvoiceListProps {
  invoices: Invoice[];
}

export default function InvoiceList({ invoices }: InvoiceListProps) {
  if (invoices.length === 0) {
    return <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无发票信息</Typography>;
  }

  return (
    <Stack spacing={1.5}>
      {invoices.map((inv) => (
        <Box key={inv.id} sx={{ p: 2, border: '1px solid #E0E0E0', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography fontWeight={600}>{inv.code}</Typography>
            <Typography variant="body2" color="text.secondary">{TYPE_LABELS[inv.type]} · 税率 {inv.taxRate}%</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography fontWeight={600} color="#005591">{formatMoney(inv.amount)}</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
              {inv.issuedDate && <Typography variant="caption" color="text.secondary">{formatDate(inv.issuedDate)}</Typography>}
              <StatusBadge status={inv.status} label={STATUS_LABELS[inv.status]} />
            </Box>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
