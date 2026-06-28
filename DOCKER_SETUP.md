# Docker 环境配置指南

> 本文档说明如何配置Docker环境，启动PostgreSQL和Redis数据库。

## 一、安装Docker Desktop

### Windows
1. 访问 https://www.docker.com/products/docker-desktop/
2. 下载Docker Desktop for Windows
3. 安装后重启电脑
4. 启动Docker Desktop，等待引擎启动完成

### 验证安装
```bash
docker --version
docker-compose --version
```

## 二、启动数据库

```bash
cd shelf-erp-server
docker-compose up -d
```

这会启动：
- **PostgreSQL 16**：端口 5432
- **Redis 7**：端口 6379

### 验证数据库
```bash
# PostgreSQL
docker exec -it shelf-erp-postgres psql -U erp -d shelf_erp -c "\dt"

# Redis
docker exec -it shelf-erp-redis redis-cli ping
```

## 三、配置环境变量

```bash
cd shelf-erp-server
cp .env.example .env.local
```

编辑 `.env.local`：
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=shelf_erp
DATABASE_USER=erp
DATABASE_PASSWORD=erp_dev_2025

REDIS_HOST=localhost
REDIS_PORT=6379
```

## 四、初始化数据库

```bash
cd shelf-erp-server
npm install
npm run seed
```

种子数据包括：
- 默认组织架构（销售部/技术部/生产部等）
- 8个角色（admin/manager/sales等）
- 默认用户（admin / admin123）
- 权限树

## 五、启动后端

```bash
cd shelf-erp-server
npm run start:dev
```

访问 http://localhost:3000/api/docs 查看Swagger文档。

## 六、常见问题

### 1. 端口冲突
如果5432端口被占用，修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "5433:5432"  # 宿主机端口:容器端口
```

### 2. PostgreSQL连接失败
```bash
# 检查容器状态
docker ps

# 查看日志
docker logs shelf-erp-postgres
```

### 3. uuid-ossp扩展
PostgreSQL需要安装uuid-ossp扩展：
```bash
docker exec -it shelf-erp-postgres psql -U erp -d shelf_erp -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
```

## 七、停止数据库

```bash
cd shelf-erp-server
docker-compose down
```

---

> 如已安装Docker，可直接执行 `docker-compose up -d` 启动数据库。
