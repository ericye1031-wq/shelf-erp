import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ProcessRoute } from '../../m10/process-routes/process-route.entity';
import { ProcessRouteStep } from '../../m10/process-routes/process-route-step.entity';
import { Equipment } from '../../m10/equipment/equipment.entity';

/**
 * SRS §9.1 定义的货架制造14道标准工序
 * 工序编码: OP-010 ~ OP-130
 */
const STANDARD_OPERATIONS = [
  {
    stepCode: 'OP-010',
    stepName: '开平',
    sequence: 1,
    equipmentType: '开平机(纵剪线)',
    equipmentCapacity: '8000m/班',
    standardMinutes: 0.5,
    qualityKeyPoints: '板面平整度≤2mm/m、对角线≤3mm、毛刺≤0.3mm',
    reportMethod: '扫码+PLC计数',
    equipmentInterface: 'Modbus TCP/OPC-UA',
  },
  {
    stepCode: 'OP-020',
    stepName: '分条',
    sequence: 2,
    equipmentType: '分条机',
    equipmentCapacity: '12000m/班',
    standardMinutes: 0.3,
    qualityKeyPoints: '宽度公差±0.3mm、切口整齐无毛刺',
    reportMethod: '扫码+PLC计数',
    equipmentInterface: 'Modbus TCP',
  },
  {
    stepCode: 'OP-035',
    stepName: '冷弯成型',
    sequence: 3,
    equipmentType: '冷弯成型机(辊压线)',
    equipmentCapacity: '300件/班',
    standardMinutes: 2.0,
    qualityKeyPoints: '截面尺寸公差±0.5mm、弯曲角度±1°、表面无划伤压痕、直线度≤1mm/m',
    reportMethod: '扫码+PLC计数',
    equipmentInterface: 'Modbus TCP/OPC-UA',
  },
  {
    stepCode: 'OP-030',
    stepName: '冲孔',
    sequence: 4,
    equipmentType: '数控冲床/多工位冲孔线',
    equipmentCapacity: '600件/班',
    standardMinutes: 0.8,
    qualityKeyPoints: '孔位公差±0.5mm、孔径+0.1mm、孔距±0.5mm',
    reportMethod: '扫码+设备计数',
    equipmentInterface: '数控系统(SIEMENS/FANUC)',
  },
  {
    stepCode: 'OP-040',
    stepName: '折弯',
    sequence: 5,
    equipmentType: '数控折弯机(100T/160T)',
    equipmentCapacity: '400件/班',
    standardMinutes: 1.2,
    qualityKeyPoints: '角度±1°、直线度≤1mm/m、折弯半径符合图纸',
    reportMethod: '扫码+设备计数',
    equipmentInterface: '数控系统',
  },
  {
    stepCode: 'OP-050',
    stepName: '焊接',
    sequence: 6,
    equipmentType: 'CO2保护焊机/机器人焊',
    equipmentCapacity: '160/400件/班',
    standardMinutes: 3.0,
    qualityKeyPoints: '焊缝外观(GB/T12467)、焊脚高度±1mm、无气孔裂纹',
    reportMethod: '扫码+人工确认',
    equipmentInterface: '机器人焊接参数采集',
  },
  {
    stepCode: 'OP-060',
    stepName: '校正',
    sequence: 7,
    equipmentType: '校正机/液压校直机',
    equipmentCapacity: '300件/班',
    standardMinutes: 1.5,
    qualityKeyPoints: '直线度≤1.5mm/m、整体变形≤3mm',
    reportMethod: '扫码报工',
    equipmentInterface: '',
  },
  {
    stepCode: 'OP-070',
    stepName: '打磨',
    sequence: 8,
    equipmentType: '角磨机/砂带机',
    equipmentCapacity: '480件/班',
    standardMinutes: 1.0,
    qualityKeyPoints: '焊接飞溅清除、表面无毛刺锐角',
    reportMethod: '扫码报工',
    equipmentInterface: '',
  },
  {
    stepCode: 'OP-080',
    stepName: '前处理',
    sequence: 9,
    equipmentType: '脱脂→水洗→磷化→烘干线',
    equipmentCapacity: '800m²/班',
    standardMinutes: 0,
    qualityKeyPoints: '磷化膜均匀、无油污、烘干120-150°C',
    reportMethod: 'PLC自动记录',
    equipmentInterface: 'PLC温度/速度采集',
  },
  {
    stepCode: 'OP-090',
    stepName: '喷塑',
    sequence: 10,
    equipmentType: '静电喷涂线(自动+补喷)',
    equipmentCapacity: '600m²/班',
    standardMinutes: 0,
    qualityKeyPoints: '膜厚60-80μm、附着力0级、ΔE≤1.5、无漏喷/流挂',
    reportMethod: '扫码+膜厚仪',
    equipmentInterface: 'PLC喷涂参数',
  },
  {
    stepCode: 'OP-100',
    stepName: '固化',
    sequence: 11,
    equipmentType: '固化炉(天然气/电加热)',
    equipmentCapacity: '与喷涂同步',
    standardMinutes: 0,
    qualityKeyPoints: '温度200±10°C、恒温10-15min、温升曲线记录',
    reportMethod: 'PLC温度曲线自动',
    equipmentInterface: 'PLC温度采集(30s)',
  },
  {
    stepCode: 'OP-110',
    stepName: '冷却/检验',
    sequence: 12,
    equipmentType: '冷却段+检验台',
    equipmentCapacity: '与喷涂同步',
    standardMinutes: 0,
    qualityKeyPoints: '外观全检、膜厚抽检、附着力抽检',
    reportMethod: '扫码报工',
    equipmentInterface: '',
  },
  {
    stepCode: 'OP-120',
    stepName: '包装',
    sequence: 13,
    equipmentType: '打包机/缠绕机',
    equipmentCapacity: '200件/班',
    standardMinutes: 0,
    qualityKeyPoints: '包装规范(立柱缠绕+护角)、标签粘贴、防潮',
    reportMethod: '扫码+打印标签',
    equipmentInterface: '标签打印机',
  },
  {
    stepCode: 'OP-130',
    stepName: '成品入库',
    sequence: 14,
    equipmentType: '',
    equipmentCapacity: '',
    standardMinutes: 0,
    qualityKeyPoints: '数量核对、标签扫描、批次记录',
    reportMethod: 'PDA扫码入库',
    equipmentInterface: 'WMS接口',
  },
];

/**
 * SRS §9.2 定义的4条标准工艺路线
 */
const STANDARD_ROUTES = [
  {
    routeCode: 'RT-HEAVY-UPRIGHT',
    name: '重型立柱标准工艺路线',
    productPart: '重型立柱',
    description: '重型货架立柱生产全过程：开平→分条→冷弯成型→冲孔→打磨→前处理→喷塑→固化→冷却检验→包装→成品入库',
    stdTotalHours: 10.5,
    // 工序序列: OP-010→OP-020→OP-035→OP-030→OP-070→OP-080→OP-090→OP-100→OP-110→OP-120→OP-130
    stepCodes: ['OP-010', 'OP-020', 'OP-035', 'OP-030', 'OP-070', 'OP-080', 'OP-090', 'OP-100', 'OP-110', 'OP-120', 'OP-130'],
  },
  {
    routeCode: 'RT-HEAVY-BEAM',
    name: '重型横梁标准工艺路线',
    productPart: '重型横梁',
    description: '重型货架横梁生产全过程：开平→分条→冷弯成型→冲孔→焊接→校正→前处理→喷塑→固化→冷却检验→包装→成品入库',
    stdTotalHours: 12.2,
    // 工序序列: OP-010→OP-020→OP-035→OP-030→OP-050→OP-060→OP-080→OP-090→OP-100→OP-110→OP-120→OP-130
    stepCodes: ['OP-010', 'OP-020', 'OP-035', 'OP-030', 'OP-050', 'OP-060', 'OP-080', 'OP-090', 'OP-100', 'OP-110', 'OP-120', 'OP-130'],
  },
  {
    routeCode: 'RT-PALLET',
    name: '钢托盘标准工艺路线',
    productPart: '钢托盘',
    description: '钢托盘生产全过程：开平→分条→冷弯成型→焊接→校正→打磨→前处理→喷塑→固化→冷却检验→包装→成品入库',
    stdTotalHours: 8.5,
    // 工序序列: OP-010→OP-020→OP-035→OP-050→OP-060→OP-070→OP-080→OP-090→OP-100→OP-110→OP-120→OP-130
    stepCodes: ['OP-010', 'OP-020', 'OP-035', 'OP-050', 'OP-060', 'OP-070', 'OP-080', 'OP-090', 'OP-100', 'OP-110', 'OP-120', 'OP-130'],
  },
  {
    routeCode: 'RT-CUSTOM-RACK',
    name: '非标料架标准工艺路线',
    productPart: '非标料架',
    description: '非标料架生产全过程：开平→分条→冲孔→折弯→焊接→校正→打磨→前处理→喷塑→固化→冷却检验→包装→成品入库',
    stdTotalHours: 15.5,
    // 工序序列: OP-010→OP-020→OP-030→OP-040→OP-050→OP-060→OP-070→OP-080→OP-090→OP-100→OP-110→OP-120→OP-130
    stepCodes: ['OP-010', 'OP-020', 'OP-030', 'OP-040', 'OP-050', 'OP-060', 'OP-070', 'OP-080', 'OP-090', 'OP-100', 'OP-110', 'OP-120', 'OP-130'],
  },
];

/**
 * SRS §9.1 对应的12类生产设备
 */
const PRODUCTION_EQUIPMENT = [
  { code: 'EQ-001', name: '开平机(纵剪线)', type: 'leveling_line', workshop: '下料车间', status: 'running', capacity: 8000 },
  { code: 'EQ-002', name: '分条机', type: 'slitting', workshop: '下料车间', status: 'running', capacity: 12000 },
  { code: 'EQ-003', name: '冷弯成型机(辊压线)', type: 'roll_forming', workshop: '冷弯车间', status: 'running', capacity: 300 },
  { code: 'EQ-004', name: '数控冲床', type: 'cnc_punch', workshop: '冲压车间', status: 'running', capacity: 600 },
  { code: 'EQ-005', name: '数控折弯机(100T)', type: 'bending_100t', workshop: '折弯车间', status: 'running', capacity: 400 },
  { code: 'EQ-006', name: '数控折弯机(160T)', type: 'bending_160t', workshop: '折弯车间', status: 'running', capacity: 350 },
  { code: 'EQ-007', name: 'CO2保护焊机(手工)', type: 'welding_co2', workshop: '焊接车间', status: 'running', capacity: 160 },
  { code: 'EQ-008', name: '焊接机器人站', type: 'welding_robot', workshop: '焊接车间', status: 'running', capacity: 400 },
  { code: 'EQ-009', name: '校正机', type: 'straightening', workshop: '校正区', status: 'running', capacity: 300 },
  { code: 'EQ-010', name: '前处理线', type: 'pretreatment', workshop: '涂装车间', status: 'running', capacity: 800 },
  { code: 'EQ-011', name: '静电喷涂线', type: 'powder_coating', workshop: '涂装车间', status: 'running', capacity: 600 },
  { code: 'EQ-012', name: '固化炉', type: 'curing_oven', workshop: '涂装车间', status: 'running', capacity: 600 },
];

export async function runM10ProcessSeed(dataSource: DataSource, systemUserId: string): Promise<void> {
  console.log('📦 开始运行 M10 生产管理种子数据...');

  const routeRepo = dataSource.getRepository(ProcessRoute);
  const stepRepo = dataSource.getRepository(ProcessRouteStep);
  const equipmentRepo = dataSource.getRepository(Equipment);

  // ===== 1. 创建标准工序库 (14道工序) =====
  const routeCode = 'RT-STANDARD-OPS';
  let opsRoute = await routeRepo.findOne({ where: { routeCode } });
  if (!opsRoute) {
    const created = routeRepo.create({
      routeCode,
      name: '标准工序库',
      productPart: '通用',
      description: 'SRS §9.1 定义的货架制造14道标准工序，供所有工艺路线引用',
      stdTotalHours: 0,
      isActive: true,
      shelfTypeId: '00000000-0000-0000-0000-000000000000',
      createdBy: systemUserId,
      updatedBy: systemUserId,
    } as any);
    opsRoute = await routeRepo.save(created) as any as ProcessRoute;

    const opSteps = STANDARD_OPERATIONS.map((op) => ({
      routeId: opsRoute!.id,
      ...op,
      dependency: '',
    }));
    await stepRepo.save(stepRepo.create(opSteps as any));
    console.log(`  ✅ 标准工序库: 14道工序 (OP-010 ~ OP-130)`);
  } else {
    console.log(`  ⏭️  标准工序库已存在，跳过`);
  }

  // ===== 2. 创建4条标准工艺路线 =====
  const standardOpsMap = new Map<string, string>();
  const allOpSteps = await stepRepo.find({ where: { routeId: opsRoute!.id } });
  allOpSteps.forEach((s) => standardOpsMap.set(s.stepCode, s.id));

  for (const routeDef of STANDARD_ROUTES) {
    const existing = await routeRepo.findOne({ where: { routeCode: routeDef.routeCode } });
    if (!existing) {
      const routeSteps = routeDef.stepCodes.map((code, index) => {
        const op = STANDARD_OPERATIONS.find((o) => o.stepCode === code);
        if (!op) throw new Error(`标准工序 ${code} 未找到`);
        return {
          stepCode: op.stepCode,
          stepName: op.stepName,
          sequence: index + 1,
          equipmentType: op.equipmentType,
          equipmentCapacity: op.equipmentCapacity,
          standardMinutes: op.standardMinutes,
          dependency: index > 0 ? routeDef.stepCodes[index - 1] : '',
          qualityKeyPoints: op.qualityKeyPoints,
          reportMethod: op.reportMethod,
          equipmentInterface: op.equipmentInterface,
        };
      });

      const route = routeRepo.create({
        routeCode: routeDef.routeCode,
        name: routeDef.name,
        productPart: routeDef.productPart,
        description: routeDef.description,
        stdTotalHours: routeDef.stdTotalHours,
        isActive: true,
        shelfTypeId: '00000000-0000-0000-0000-000000000000',
        createdBy: systemUserId,
        updatedBy: systemUserId,
      } as any);
      const savedRoute = await routeRepo.save(route) as any as ProcessRoute;

      const stepsWithRouteId = routeSteps.map((s) => ({
        routeId: savedRoute.id,
        ...s,
      }));
      await stepRepo.save(stepRepo.create(stepsWithRouteId as any));

      console.log(`  ✅ 工艺路线: ${routeDef.routeCode} (${routeDef.name}) - ${routeSteps.length} 工序, 总工时 ${routeDef.stdTotalHours}min`);
    } else {
      console.log(`  ⏭️  工艺路线 ${routeDef.routeCode} 已存在，跳过`);
    }
  }

  // ===== 3. 创建标准生产设备 =====
  for (const eq of PRODUCTION_EQUIPMENT) {
    const existing = await equipmentRepo.findOne({ where: { code: eq.code } });
    if (!existing) {
      await equipmentRepo.save(equipmentRepo.create({
        ...eq,
        createdBy: systemUserId,
        updatedBy: systemUserId,
      } as any));
    }
  }
  const eqCount = await equipmentRepo.count();
  console.log(`  ✅ 生产设备: ${eqCount} 台`);

  console.log('✅ M10 生产管理种子数据完成\n');
}
