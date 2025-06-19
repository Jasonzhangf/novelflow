@echo off
setlocal EnableDelayedExpansion

REM Set UTF-8 codepage to correctly display Chinese characters
chcp 65001 >nul

REM =============================
REM NovelFlow 开发环境管理批处理
REM =============================

set "BACKEND_PORT=8888"
set "FRONTEND_PORT=4008"
set "PID_DIR=.pids"
set "FRONTEND_PID_FILE=%PID_DIR%\frontend.pid"
set "BACKEND_PID_FILE=%PID_DIR%\backend.pid"

REM Create PID directory if it doesn't exist
if not exist "%PID_DIR%" mkdir "%PID_DIR%"

REM Main command dispatcher
goto :dispatch

REM =====================================================================
REM == SUBROUTINES
REM =====================================================================

:check_port_and_set_pid
    setlocal
    set "_port=%~1"
    set "_var_to_set=%~2"
    set "_pid="
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%_port%" ^| findstr "LISTENING"') do (
        set "_pid=%%a"
        goto :_check_port_done
    )
    :_check_port_done
    endlocal & set "%_var_to_set%=%_pid%"
    exit /b

:kill_port
    setlocal
    set "_port=%~1"
    set "_service_name=%~2"
    echo 正在清理端口 %_port% ^(%_service_name%^)...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%_port%" ^| findstr "LISTENING"') do (
        echo   - 正在终止端口 %_port% 上的进程 ^(PID: %%a^)...
        taskkill /F /PID %%a >nul
    )
    endlocal
    exit /b

:start_frontend
    echo.
    echo --- 启动前端服务 ---
    if exist "frontend\package.json" (
        cd frontend
        echo 检查前端依赖...
        call npm install >nul 2>nul
        echo 启动前端开发服务 ^(端口 %FRONTEND_PORT%^)...
        start "Frontend_NovelFlow" cmd /c "npm run dev > ..\frontend.log 2>&1"
        cd ..
    ) else (
        echo [错误] 未找到 'frontend' 目录或 'package.json'。
        exit /b 1
    )
    
    echo 等待前端服务启动...
    ping 127.0.0.1 -n 9 >nul

    call :check_port_and_set_pid %FRONTEND_PORT% frontend_pid
    if defined frontend_pid (
        echo %frontend_pid% > "%FRONTEND_PID_FILE%"
        echo [成功] 前端服务已启动 ^(PID: !frontend_pid!^)
        echo   - 前端访问地址: http://localhost:%FRONTEND_PORT%
    ) else (
        echo [错误] 前端服务启动失败。请检查 'frontend.log' 获取详情。
        exit /b 1
    )
    exit /b 0

:start_backend
    echo.
    echo --- 启动后端服务 ---
    if exist "backend\package.json" (
        cd backend
        echo 检查后端依赖...
        call npm install >nul 2>nul
        echo 启动后端开发服务 ^(端口 %BACKEND_PORT%^)...
        start "Backend_NovelFlow" cmd /c "npm run dev > ..\backend.log 2>&1"
        cd ..
    ) else (
        echo [错误] 未找到 'backend' 目录或 'package.json'。
        exit /b 1
    )

    echo 等待后端服务启动...
    ping 127.0.0.1 -n 6 >nul
    
    call :check_port_and_set_pid %BACKEND_PORT% backend_pid
    if defined backend_pid (
        echo %backend_pid% > "%BACKEND_PID_FILE%"
        echo [成功] 后端服务已启动 ^(PID: !backend_pid!^)
    ) else (
        echo [错误] 后端服务启动失败。请检查 'backend.log' 获取详情。
        exit /b 1
    )
    exit /b 0

REM =====================================================================
REM == MAIN COMMANDS
REM =====================================================================

:start_service
    echo [信息] 启动 NovelFlow 开发环境...
    call :kill_port %FRONTEND_PORT% "Frontend"
    call :kill_port %BACKEND_PORT% "Backend"
    
    call :start_backend
    if errorlevel 1 (
        echo [错误] 后端启动失败，中止操作。
        goto :eof
    )
    
    call :start_frontend
    if errorlevel 1 (
        echo [错误] 前端启动失败。
        goto :eof
    )
    
    echo.
    echo [成功] NovelFlow 环境启动完成。
    echo   - 使用 "dev.bat status" 查看状态。
    echo   - 使用 "dev.bat stop" 停止服务。
    goto :eof

:stop_service
    echo [信息] 停止 NovelFlow 服务...
    if exist "%FRONTEND_PID_FILE%" (
        set /p PID=<"%FRONTEND_PID_FILE%"
        echo   - 停止旧的前端服务 ^(PID: !PID!^)...
        taskkill /F /PID !PID! >nul 2>nul
        del "%FRONTEND_PID_FILE%"
    )
    if exist "%BACKEND_PID_FILE%" (
        set /p PID=<"%BACKEND_PID_FILE%"
        echo   - 停止旧的后端服务 ^(PID: !PID!^)...
        taskkill /F /PID !PID! >nul 2>nul
        del "%BACKEND_PID_FILE%"
    )
    
    REM As a fallback, kill whatever is on the ports
    call :kill_port %FRONTEND_PORT% "Frontend"
    call :kill_port %BACKEND_PORT% "Backend"
    
    echo [成功] 服务已停止。
    goto :eof

:show_status
    echo.
    echo --- NovelFlow 服务状态 ---
    set "frontend_pid="
    call :check_port_and_set_pid %FRONTEND_PORT% frontend_pid
    if defined frontend_pid (
        echo [运行中] 前端服务 ^(PID: !frontend_pid!, 端口: %FRONTEND_PORT%^)
        echo     - 访问地址: http://localhost:%FRONTEND_PORT%
    ) else (
        echo [已停止] 前端服务 ^(端口: %FRONTEND_PORT%^)
    )
    
    set "backend_pid="
    call :check_port_and_set_pid %BACKEND_PORT% backend_pid
    if defined backend_pid (
        echo [运行中] 后端服务 ^(PID: !backend_pid!, 端口: %BACKEND_PORT%^)
    ) else (
        echo [已停止] 后端服务 ^(端口: %BACKEND_PORT%^)
    )
    echo.
    goto :eof

:force_kill
    echo [警告] 强制清理所有 NovelFlow 相关进程...
    call :stop_service
    echo [成功] 强制清理完成。
    goto :eof

:restart_service
    echo [信息] 重启 NovelFlow 服务...
    call :stop_service
    echo 等待服务完全停止...
    ping 127.0.0.1 -n 3 >nul
    call :start_service
    goto :eof

:build_frontend
    echo.
    echo --- 构建前端生产版本 ---
    if exist "frontend\package.json" (
        cd frontend
        echo 正在安装依赖...
        call npm install
        echo 正在构建...
        call npm run build
        cd ..
        echo [成功] 前端构建完成，产物位于 'frontend\dist'。
    ) else (
        echo [错误] 未找到 'frontend' 目录或 'package.json'。
    )
    goto :eof

:show_help
    echo.
    echo NovelFlow 开发环境管理批处理
    echo.
    echo 用法:
    echo   dev.bat start    - 启动开发服务 ^(前端 + 后端^)
    echo   dev.bat stop     - 停止所有服务
    echo   dev.bat restart  - 重启服务
    echo   dev.bat status   - 查看服务状态
    echo   dev.bat kill     - 强制杀死所有相关进程
    echo   dev.bat build    - 仅构建前端
    echo   dev.bat help     - 显示此帮助信息
    echo.
    echo 端口信息:
    echo   - 前端开发服务: %FRONTEND_PORT%
    echo   - 后端服务: %BACKEND_PORT%
    goto :eof

:dispatch
    if /i "%~1"=="start"   goto start_service
    if /i "%~1"=="stop"    goto stop_service
    if /i "%~1"=="restart" goto restart_service
    if /i "%~1"=="status"  goto show_status
    if /i "%~1"=="kill"    goto force_kill
    if /i "%~1"=="build"   goto build_frontend
    if /i "%~1"=="help"    goto show_help
    if /i "%~1"=="--help"  goto show_help
    if /i "%~1"=="-h"      goto show_help
    
    REM Default action
    goto show_help

:eof
endlocal 