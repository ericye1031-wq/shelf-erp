import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Grid, TextField, Typography, MenuItem, InputAdornment, Divider, IconButton, Alert, Accordion, AccordionSummary, AccordionDetails, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM05Store } from '@/stores/useM05Store';
import { useM04Store } from '@/stores/useM04Store';
import { useM02Store } from '@/stores/useM02Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import {
  getBoltTypeOptions,
  getBoltSpecsByType,
  getConnectorNameOptions,
  getConnectorsByName,
  getPowderColorOptions,
  getSurfaceTreatmentOptions,
  calcAccessoryCost,
  calcSurfaceTreatmentCostByArea,
  type BoltType,
} from '@/services/material-data.service';

const COST_CATEGORIES = ['material', 'labor', 'overhead', 'outsourcing', 'logistics', 'other'] as const;
const CATEGORY_LABELS: Record<string, string> = {
  material: '材料', labor: '人工', overhead: '制造费用', outsourcing: '外协', logistics: '物流', other: '其他',
};

interface CostItemForm {
  category: string;
  name: string;
  amount: number;
  unit: string;
  remark: string;
}

const emptyCostItem = (): CostItemForm => ({ category: 'material', name: '', amount: 0, unit: 'pcs', remark: '' });

export default function QuotationCreatePage() {
  const navigate = useNavigate();
  const { configs, fetchConfigs } = useM04Store();
  const { customers, fetchCustomers } = useM02Store();
  const { currencies, loading, error, fetchCurrencies, createQuotation } = useM05Store();
  const { onSuccess } = useCrudFeedback();

  const [form, setForm] = useState({
    customerId: '', customerName: '', configId: '', configName: '', shelfTypeName: '',
    quantity: 1, unitPrice: 0, currencyId: '', margin: 0.15, deliveryDays: 30, validUntil: '', remark: '',
  });
  const [costItems, setCostItems] = useState<CostItemForm[]>([emptyCostItem()]);

  // 配件选择
  interface AccessoryItemForm {
    type: string;       // bolt | connector
    boltType?: BoltType;
    boltSpec?: string;
    connectorName?: string;
    connectorSpec?: string;
    qty: number;
  }
  const [accessoryItems, setAccessoryItems] = useState<AccessoryItemForm[]>([]);

  // 表面处理配置
  const [surfaceConfig, setSurfaceConfig] = useState({
    enabled: false,
    surfaceArea: 0,      // m²
    colorIndex: 0,       // 喷塑颜色索引
    treatmentCode: 'POWDER_STD', // 工艺代码
  });

  const boltTypeOptions = useMemo(() => getBoltTypeOptions(), []);
  const connectorNameOptions = useMemo(() => getConnectorNameOptions(), []);
  const powderColorOptions = useMemo(() => getPowderColorOptions(), []);
  const surfaceTreatmentOptions = useMemo(() => getSurfaceTreatmentOptions(), []);

  // 动态螺栓规格选项（根据选中的螺栓类型）
  const getBoltSpecOptions = (boltType: BoltType) => getBoltSpecsByType(boltType).map((b) => b.spec);
  // 动态连接件规格选项（根据选中的连接件名称）
  const getConnectorSpecOptions = (name: string) => getConnectorsByName(name).map((c) => c.spec);

  // 配件成本计算
  const accessoryCost = useMemo(() => {
    const bolts = accessoryItems
      .filter((a) => a.type === 'bolt' && a.boltType && a.boltSpec)
      .map((a) => ({ type: a.boltType as BoltType, spec: a.boltSpec as string, qty: a.qty }));
    const connectors = accessoryItems
      .filter((a) => a.type === 'connector' && a.connectorName && a.connectorSpec)
      .map((a) => ({ name: a.connectorName as string, spec: a.connectorSpec as string, qty: a.qty }));
    if (bolts.length === 0 && connectors.length === 0) return { totalWeight: 0, totalPrice: 0 };
    return calcAccessoryCost(bolts, connectors);
  }, [accessoryItems]);

  // 表面处理成本
  const surfaceCost = useMemo(() => {
    if (!surfaceConfig.enabled || surfaceConfig.surfaceArea <= 0) return 0;
    return calcSurfaceTreatmentCostByArea(surfaceConfig.surfaceArea, surfaceConfig.colorIndex, form.quantity);
  }, [surfaceConfig, form.quantity]);

  useEffect(() => { fetchConfigs(); fetchCurrencies(); fetchCustomers(); }, [fetchConfigs, fetchCurrencies, fetchCustomers]);

  const handleSelectCustomer = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    setForm({ ...form, customerId, customerName: customer?.name || '' });
  };

  const handleSelectConfig = (configId: string) => {
    const config = configs.find((c) => c.id === configId);
    setForm({ ...form, configId, configName: config?.name || '', shelfTypeName: config?.shelfTypeName || '' });
  };

  const manualCostTotal = costItems.reduce((s, c) => s + (c.amount || 0), 0);
  const totalCost = manualCostTotal + accessoryCost.totalPrice + surfaceCost;
  const totalPrice = totalCost * (1 + form.margin) * form.quantity;

  const handleSave = async () => {
    const validCostItems = costItems.filter((c) => c.name && c.amount > 0);
    await createQuotation({
      customerId: form.customerId,
      customerName: form.customerName,
      configId: form.configId,
      configName: form.configName,
      shelfTypeName: form.shelfTypeName,
      quantity: form.quantity,
      unitPrice: form.unitPrice,
      totalPrice,
      currencyId: form.currencyId,
      margin: form.margin,
      deliveryDays: form.deliveryDays,
      validUntil: form.validUntil,
      remark: form.remark,
    });
    onSuccess('报价创建成功');
    navigate('/m05/quotations');
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <PageHeader title="创建报价" action={<Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/m05/quotations')}>返回列表</Button>} />

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>基本信息</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth size="small" label="客户" value={form.customerId} onChange={(e) => handleSelectCustomer(e.target.value)}>
                {customers.map((c) => <MenuItem key={c.id} value={c.id}>{c.name} ({c.code})</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth size="small" label="关联配置" value={form.configId} onChange={(e) => handleSelectConfig(e.target.value)}>
                {configs.map((c) => <MenuItem key={c.id} value={c.id}>{c.name} ({c.shelfTypeName})</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth size="small" label="数量" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) || 1 })} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField select fullWidth size="small" label="币种" value={form.currencyId} onChange={(e) => setForm({ ...form, currencyId: e.target.value })}>
                {currencies.map((c) => <MenuItem key={c.id} value={c.id}>{c.name} ({c.symbol})</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth size="small" label="毛利率" type="number" value={form.margin}
                onChange={(e) => setForm({ ...form, margin: Number(e.target.value) || 0 })}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth size="small" label="交货天数" type="number" value={form.deliveryDays}
                onChange={(e) => setForm({ ...form, deliveryDays: Number(e.target.value) || 0 })}
                InputProps={{ endAdornment: <InputAdornment position="end">天</InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="有效期" type="date" value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="备注" multiline rows={2} value={form.remark || ''}
                onChange={(e) => setForm({ ...form, remark: e.target.value })} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">成本明细</Typography>
            <Button startIcon={<AddIcon />} size="small" onClick={() => setCostItems([...costItems, emptyCostItem()])}>添加成本项</Button>
          </Box>
          {costItems.map((item, idx) => (
            <Grid container spacing={1} key={idx} sx={{ mb: 1 }}>
              <Grid item xs={3}>
                <TextField select fullWidth size="small" value={item.category} onChange={(e) => { const updated = [...costItems]; updated[idx] = { ...updated[idx], category: e.target.value }; setCostItems(updated); }}>
                  {COST_CATEGORIES.map((c) => <MenuItem key={c} value={c}>{CATEGORY_LABELS[c]}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={3}><TextField fullWidth size="small" placeholder="名称" value={item.name} onChange={(e) => { const updated = [...costItems]; updated[idx] = { ...updated[idx], name: e.target.value }; setCostItems(updated); }} /></Grid>
              <Grid item xs={2}><TextField fullWidth size="small" type="number" placeholder="金额" value={item.amount || ''} onChange={(e) => { const updated = [...costItems]; updated[idx] = { ...updated[idx], amount: Number(e.target.value) || 0 }; setCostItems(updated); }} /></Grid>
              <Grid item xs={2}><TextField fullWidth size="small" placeholder="单位" value={item.unit} onChange={(e) => { const updated = [...costItems]; updated[idx] = { ...updated[idx], unit: e.target.value }; setCostItems(updated); }} /></Grid>
              <Grid item xs={1}><TextField fullWidth size="small" placeholder="备注" value={item.remark} onChange={(e) => { const updated = [...costItems]; updated[idx] = { ...updated[idx], remark: e.target.value }; setCostItems(updated); }} /></Grid>
              <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton size="small" onClick={() => setCostItems(costItems.filter((_, i) => i !== idx))}><DeleteIcon fontSize="small" /></IconButton>
              </Grid>
            </Grid>
          ))}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
            <Typography>手工成本合计: <strong>¥{manualCostTotal.toFixed(2)}</strong></Typography>
            <Typography>配件成本: <strong>¥{accessoryCost.totalPrice.toFixed(2)}</strong></Typography>
            <Typography>表面处理: <strong>¥{surfaceCost.toFixed(2)}</strong></Typography>
            <Typography>成本合计: <strong>¥{totalCost.toFixed(2)}</strong></Typography>
            <Typography>含利报价: <strong>¥{totalPrice.toFixed(2)}</strong> ({form.margin > 0 ? `毛利率 ${(form.margin * 100).toFixed(1)}%` : '无利润'})</Typography>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6">配件成本计算</Typography>
                {accessoryItems.length > 0 && <Chip size="small" color="primary" label={`¥${accessoryCost.totalPrice.toFixed(2)}`} />}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <Button startIcon={<AddIcon />} size="small" onClick={() => setAccessoryItems([...accessoryItems, { type: 'bolt', boltType: 'flange_bolt', boltSpec: '', qty: 1 }])}>添加配件</Button>
              </Box>
              {accessoryItems.map((item, idx) => (
                <Grid container spacing={1} key={idx} sx={{ mb: 1, alignItems: 'center' }}>
                  <Grid item xs={2}>
                    <TextField select fullWidth size="small" value={item.type}
                      onChange={(e) => {
                        const updated = [...accessoryItems];
                        updated[idx] = { ...updated[idx], type: e.target.value };
                        if (e.target.value === 'bolt') { updated[idx].boltType = 'flange_bolt'; updated[idx].boltSpec = ''; }
                        else { updated[idx].connectorName = connectorNameOptions[0] || ''; updated[idx].connectorSpec = ''; }
                        setAccessoryItems(updated);
                      }}>
                      <MenuItem value="bolt">螺栓</MenuItem>
                      <MenuItem value="connector">连接件</MenuItem>
                    </TextField>
                  </Grid>
                  {item.type === 'bolt' ? (
                    <>
                      <Grid item xs={3}>
                        <TextField select fullWidth size="small" value={item.boltType || ''}
                          onChange={(e) => { const updated = [...accessoryItems]; updated[idx] = { ...updated[idx], boltType: e.target.value as BoltType, boltSpec: '' }; setAccessoryItems(updated); }}>
                          {boltTypeOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                        </TextField>
                      </Grid>
                      <Grid item xs={3}>
                        <TextField select fullWidth size="small" value={item.boltSpec || ''}
                          onChange={(e) => { const updated = [...accessoryItems]; updated[idx] = { ...updated[idx], boltSpec: e.target.value }; setAccessoryItems(updated); }}>
                          <MenuItem value="">请选择</MenuItem>
                          {item.boltType && getBoltSpecOptions(item.boltType).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </TextField>
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={3}>
                        <TextField select fullWidth size="small" value={item.connectorName || ''}
                          onChange={(e) => { const updated = [...accessoryItems]; updated[idx] = { ...updated[idx], connectorName: e.target.value, connectorSpec: '' }; setAccessoryItems(updated); }}>
                          {connectorNameOptions.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                        </TextField>
                      </Grid>
                      <Grid item xs={3}>
                        <TextField select fullWidth size="small" value={item.connectorSpec || ''}
                          onChange={(e) => { const updated = [...accessoryItems]; updated[idx] = { ...updated[idx], connectorSpec: e.target.value }; setAccessoryItems(updated); }}>
                          <MenuItem value="">请选择</MenuItem>
                          {item.connectorName && getConnectorSpecOptions(item.connectorName).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </TextField>
                      </Grid>
                    </>
                  )}
                  <Grid item xs={2}>
                    <TextField fullWidth size="small" type="number" label="数量" value={item.qty || ''}
                      onChange={(e) => { const updated = [...accessoryItems]; updated[idx] = { ...updated[idx], qty: Number(e.target.value) || 0 }; setAccessoryItems(updated); }} />
                  </Grid>
                  <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton size="small" onClick={() => setAccessoryItems(accessoryItems.filter((_, i) => i !== idx))}><DeleteIcon fontSize="small" /></IconButton>
                  </Grid>
                </Grid>
              ))}
              {accessoryItems.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  配件总重: {accessoryCost.totalWeight.toFixed(3)} kg | 配件总价: ¥{accessoryCost.totalPrice.toFixed(2)}
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6">表面处理成本</Typography>
                {surfaceConfig.enabled && <Chip size="small" color="info" label={`¥${surfaceCost.toFixed(2)}`} />}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField select fullWidth size="small" label="是否启用" value={surfaceConfig.enabled ? '1' : '0'}
                    onChange={(e) => setSurfaceConfig({ ...surfaceConfig, enabled: e.target.value === '1' })}>
                    <MenuItem value="0">不启用</MenuItem>
                    <MenuItem value="1">启用</MenuItem>
                  </TextField>
                </Grid>
                {surfaceConfig.enabled && (
                  <>
                    <Grid item xs={6} sm={3}>
                      <TextField fullWidth size="small" label="喷塑面积(m²)" type="number" value={surfaceConfig.surfaceArea || ''}
                        onChange={(e) => setSurfaceConfig({ ...surfaceConfig, surfaceArea: Number(e.target.value) || 0 })} />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField select fullWidth size="small" label="颜色" value={surfaceConfig.colorIndex}
                        onChange={(e) => setSurfaceConfig({ ...surfaceConfig, colorIndex: Number(e.target.value) })}>
                        {powderColorOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField select fullWidth size="small" label="工艺" value={surfaceConfig.treatmentCode}
                        onChange={(e) => setSurfaceConfig({ ...surfaceConfig, treatmentCode: e.target.value })}>
                        {surfaceTreatmentOptions.map((o) => <MenuItem key={o.code} value={o.code}>{o.name}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField fullWidth size="small" label="计算费用" value={`¥${surfaceCost.toFixed(2)}`} InputProps={{ readOnly: true }} />
                    </Grid>
                  </>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" size="large" onClick={handleSave} disabled={!form.customerId}>保存报价</Button>
      </Box>
    </Box>
  );
}
