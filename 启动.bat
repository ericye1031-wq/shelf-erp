@echo off
chcp 65001 >nul
echo ================================
echo  货架ERP 一键启动脚本
echo ================================
echo.

REM 检查 Docker 是否安装
docker --version >nul 2>&1
if errorlevel 1 (
  echo [错误] Docker 未安装！
  echo.
  echo 请先安装 Docker Desktop:
  echo https://www.docker.com/products/docker-desktop/
  echo.
  pause
  exit /b 1
)

REM 启动数据库
echo [1/4] 启动数据库...
cd shelf-erp-server
docker-compose up -d
if errorlevel 1 (
  echo [错误] 数据库启动失败！
  pause
  exit /b 1
)
echo ✅ 数据库已启动
echo.

REM 等待数据库就绪
echo [2/4] 等待数据库就绪...
timeout /t 10 /nobreak >nul
echo ✅ 数据库就绪
echo.

REM 运行种子数据
echo [3/4] 运行种子数据...
call npm run seed
if errorlevel 1 (
  echo [警告] 种子数据运行失败（可能已存在）
)
echo.

REM 启动后端
echo [4/4] 启动后端（新窗口）...
start "货架ERP后端" cmd /k "npm run start:dev"
echo ✅ 后端正在启动...
echo.

REM 返回前端目录
cd ..

REM 启动前端
echo 启动前端（新窗口）...
start "货架ERP前端" cmd /k "npm run dev"
echo ✅ 前端正在启动...
echo.

echo ================================
echo  ✅ 所有服务已启动！
echo ================================
echo.
echo 后端: http://localhost:3000
echo 前端: http://localhost:5173
echo.
echo 默认用户: admin
echo 默认密码: admin123
echo.
pause
