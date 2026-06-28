import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstallAcceptance, AcceptanceResult } from './install-acceptance.entity';
import { CreateInstallAcceptanceDto, SubmitESignatureDto } from './dto/install-acceptance.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class InstallAcceptanceService {
  constructor(
    @InjectRepository(InstallAcceptance)
    private readonly acceptanceRepo: Repository<InstallAcceptance>,
  ) {}

  async findByPlanId(planId: string): Promise<InstallAcceptance[]> {
    return this.acceptanceRepo.find({ where: { planId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<InstallAcceptance> {
    const acceptance = await this.acceptanceRepo.findOne({ where: { id } });
    if (!acceptance) throw new NotFoundException(`验收记录 ${id} 不存在`);
    return acceptance;
  }

  async create(dto: CreateInstallAcceptanceDto, userId: string): Promise<InstallAcceptance> {
    const entity = this.acceptanceRepo.create({
      planId: dto.planId,
      contractId: dto.contractId ?? null,
      acceptDate: dto.acceptDate ? new Date(dto.acceptDate) : null,
      customerSign: dto.customerSign ?? null,
      result: dto.result as AcceptanceResult,
      issueDesc: dto.issueDesc ?? null,
      warrantyStartDate: dto.warrantyStartDate ? new Date(dto.warrantyStartDate) : null,
      warrantyEndDate: dto.warrantyEndDate ? new Date(dto.warrantyEndDate) : null,
      projectId: null,
      eSignature: null,
      eSignatureDate: null,
      reportData: null,
      createdBy: userId,
    } as any);
    return this.acceptanceRepo.save(entity) as unknown as InstallAcceptance;
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.acceptanceRepo.remove(entity);
  }

  /** 提交电子签名 */
  async submitESignature(
    acceptanceId: string,
    dto: SubmitESignatureDto,
    userId: string,
  ): Promise<InstallAcceptance> {
    const acceptance = await this.findOne(acceptanceId);

    // 验证签名数据格式：支持 base64 或 data URL
    if (
      !dto.signatureData.startsWith('data:image/') &&
      !dto.signatureData.match(/^[A-Za-z0-9+/=]+$/) &&
      !dto.signatureData.startsWith('/9j/') // JPEG base64
    ) {
      // 宽松校验，只拒绝明显不合理的输入
      if (dto.signatureData.length < 20) {
        throw new BadRequestException('签名数据无效：长度不足');
      }
    }

    acceptance.eSignature = dto.signatureData;
    acceptance.eSignatureDate = new Date();
    // 更新 createdBy 为签署人（保留审计目的）
    acceptance.createdBy = userId;
    return this.acceptanceRepo.save(acceptance);
  }

  /** 根据安装计划自动生成验收报告 */
  async generateAcceptanceReport(planId: string): Promise<{
    planId: string;
    acceptances: InstallAcceptance[];
    summary: {
      total: number;
      passed: number;
      withIssues: number;
      failed: number;
      hasSignature: number;
    };
  }> {
    const acceptances = await this.acceptanceRepo.find({
      where: { planId: planId as any },
      order: { createdAt: 'ASC' },
    });

    if (acceptances.length === 0) {
      throw new NotFoundException(`安装计划 ${planId} 尚未创建验收记录，请先创建验收记录`);
    }

    const summary = {
      total: acceptances.length,
      passed: acceptances.filter((a) => a.result === 'passed').length,
      withIssues: acceptances.filter((a) => a.result === 'with_issues').length,
      failed: acceptances.filter((a) => a.result === 'failed').length,
      hasSignature: acceptances.filter((a) => !!a.eSignature).length,
    };

    return { planId, acceptances, summary };
  }

  /** 按项目ID查询所有验收记录 */
  async getAcceptanceByProject(projectId: string): Promise<InstallAcceptance[]> {
    return this.acceptanceRepo.find({
      where: { projectId: projectId as any },
      order: { createdAt: 'DESC' },
    });
  }
}
