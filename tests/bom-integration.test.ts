import { calculateBom } from '@/utils/bomCalculator';
import { m04MockShelfTypes, m04MockConfigs, m04MockSpecs } from '@/mock/m04';
import { materialDataService } from '@/services/material-data.service';

// 测试BOM计算
const shelfType = m04MockShelfTypes[0];
const config = m04MockConfigs[0];
const specs = m04MockSpecs;

console.log('BOM Engine Test (with real profile data)');
console.log('='.repeat(50));
console.log('Shelf type:', shelfType.name);
console.log('Config:', config.name);
console.log('Parameters:', config.parameters);

const result = calculateBom(config, shelfType, specs);

console.log('\nResult:');
console.log('Total weight:', result.totalWeight, 'kg');
console.log('Total cost:', result.totalCost);
console.log('Items:', result.items.length);
console.log('\nDetails:');
result.items.forEach((item, i) => {
  console.log(`  ${i + 1}. ${item.partName} | spec: ${item.spec} | qty: ${item.quantity} ${item.unit} | weight: ${item.unitWeight}kg | cost: ${item.unitCost} | total: ${item.totalCost}`);
});

// Test material data service
console.log('\nMaterial Data Service Test');
console.log('='.repeat(50));
console.log('Column profiles:', materialDataService.getAllColumnProfiles().length);
console.log('Beam profiles:', materialDataService.getAllBeamProfiles().length);
console.log('Bolts:', materialDataService.getAllBolts().length);
console.log('Connectors:', materialDataService.getAllConnectors().length);
console.log('Powder colors:', materialDataService.getPowderColors().length);

const colProfile = materialDataService.getColumnBySpec('90*70*2.0');
console.log('\nLookup column 90*70*2.0:', colProfile ? `Found (weight: ${colProfile.weightPerMeter}kg/m)` : 'Not found');

const beamProfile = materialDataService.getBeamBySpec('100*50*1.5');
console.log('Lookup beam 100*50*1.5:', beamProfile ? `Found (weight: ${beamProfile.weightPerMeter}kg/m)` : 'Not found');

const bolt = materialDataService.getBolt('flange_bolt', '10*20');
console.log('Lookup bolt flange_bolt 10*20:', bolt ? `Found (price: ${bolt.price})` : 'Not found');

console.log('\nBOM + Material Data Service test completed!');
