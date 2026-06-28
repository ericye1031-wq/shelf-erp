@echo off
chcp 65001 >nul
title 货架ERP后端启动

echo ============================================
echo  货架ERP 后端一键启动脚本 (SQLite 模式)
echo ============================================
echo.

cd /d "%~dp0shelf-erp-server"

echo [1/3] 安装后端依赖...
call npm install
if %errorlevel% neq 0 (
    echo [错误] npm install 失败
    pause
    exit /b 1
)

echo.
echo [2/3] 初始化数据库种子数据（首次运行）...
if not exist "shelf_erp.sqlite" (
    echo 首次运行，正在创建数据库并写入种子数据...
    call npm run seed
    if %errorlevel% neq 0 (
        echo [警告] seed 执行有问题
    )
) else (
    echo 数据库已存在，跳过种子数据初始化
)

echo.
echo [3/3] 启动 NestJS 开发服务器...
echo.
echo ============================================
echo  后端 API:  http://localhost:3000
echo  Swagger:   http://localhost:3000/api/docs
echo  登录账号:  admin / admin123
echo  数据库:    SQLite (shelf_erp.sqlite)
echo ============================================
echo.
echo  提示: 另开一个终端运行 "npm run dev" 启动前端
echo ============================================
echo.
call npm run start:dev
