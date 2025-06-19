#!/bin/bash

# NovelFlow 开发环境管理脚本
# 使用方法：
#   ./dev.sh start    - 启动服务（自动处理端口冲突）
#   ./dev.sh stop     - 停止所有服务
#   ./dev.sh restart  - 重启服务
#   ./dev.sh status   - 查看服务状态
#   ./dev.sh kill     - 强制杀死所有相关进程
#   ./dev.sh build    - 仅构建前端

set -e  # 遇到错误立即退出

BACKEND_PORT=8888
FRONTEND_PORT=4008
PID_DIR=".pids"
FRONTEND_PID_FILE="$PID_DIR/frontend.pid"
BACKEND_PID_FILE="$PID_DIR/backend.pid"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 确保 PID 目录存在
ensure_pid_dir() {
    mkdir -p $PID_DIR
}

# 检查端口占用
check_port() {
    local port=$1
    lsof -ti:$port 2>/dev/null || true
}

# 杀死端口上的进程
kill_port() {
    local port=$1
    local service_name=$2
    local force=${3:-true} # 默认改为强制
    local pids=$(check_port $port)
    
    if [ ! -z "$pids" ]; then
        if [ "$force" = true ]; then
            print_warning "正在强制终止端口 $port ($service_name) 上的进程: $pids"
            kill -9 $pids 2>/dev/null || true
            sleep 1
        else
            print_warning "端口 $port ($service_name) 已被进程 $pids 占用"
            echo -n "是否要终止该进程? (y/N): "
            read -r response
            if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
                kill -9 $pids 2>/dev/null || true
                sleep 1
                print_success "已终止进程 $pids"
            else
                print_error "用户取消，端口 $port 仍被占用，启动中止"
                return 1
            fi
        fi
    fi
    return 0
}

# 启动前端
start_frontend() {
    print_status "检查前端依赖 (frontend)..."
    (cd frontend && npm install > /dev/null 2>&1)
    print_success "前端依赖检查完成"

    print_status "🚀 启动前端开发服务 (端口 $FRONTEND_PORT)..."
    (cd frontend && npm run dev &) > frontend.log 2>&1
    
    # 等待一段时间让服务启动
    print_status "等待前端服务启动..."
    sleep 8
    
    local pid=$(check_port $FRONTEND_PORT)
    if [ -z "$pid" ]; then
        print_error "前端服务启动失败。请检查 'frontend.log' 文件获取详细信息。"
        return 1
    fi

    echo $pid > "$FRONTEND_PID_FILE"
    print_success "前端服务已启动 (PID: $pid)"
    print_status "🌐 前端访问地址: http://localhost:$FRONTEND_PORT"
}

# 启动后端
start_backend() {
    print_status "检查后端依赖 (backend)..."
    (cd backend && npm install > /dev/null 2>&1)
    print_success "后端依赖检查完成"

    print_status "🚀 启动后端开发服务 (端口 $BACKEND_PORT)..."
    (cd backend && npm run dev &) > backend.log 2>&1
    
    # 等待一段时间让服务启动
    print_status "等待后端服务启动..."
    sleep 5

    local pid=$(check_port $BACKEND_PORT)
    if [ -z "$pid" ]; then
        print_error "后端服务启动失败。请检查 'backend.log' 文件获取详细信息。"
        return 1
    fi
    
    echo $pid > "$BACKEND_PID_FILE"
    print_success "后端服务已启动 (PID: $pid)"
}

# 启动服务
start_service() {
    print_status "🚀 启动 NovelFlow 开发环境..."
    ensure_pid_dir
    
    # 强制清理端口
    if ! kill_port $FRONTEND_PORT "Frontend" true || ! kill_port $BACKEND_PORT "Backend" true; then
        exit 1
    fi
    
    # 启动服务
    start_backend
    start_frontend
    
    echo ""
    print_success "✅ NovelFlow 环境启动完成"
    print_status "使用 './dev.sh status' 查看状态或 './dev.sh stop' 停止服务。"
}

# 停止服务
stop_service() {
    print_status "🛑 停止 NovelFlow 服务..."
    ensure_pid_dir

    if [ -f "$FRONTEND_PID_FILE" ]; then
        local pid=$(cat "$FRONTEND_PID_FILE")
        if ps -p $pid > /dev/null; then
            print_status "停止前端服务 (PID: $pid)..."
            kill -15 $pid 2>/dev/null || true
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi

    if [ -f "$BACKEND_PID_FILE" ]; then
        local pid=$(cat "$BACKEND_PID_FILE")
        if ps -p $pid > /dev/null; then
            print_status "停止后端服务 (PID: $pid)..."
            kill -15 $pid 2>/dev/null || true
        fi
        rm -f "$BACKEND_PID_FILE"
    fi

    # 强制清理端口，以防万一
    kill_port $FRONTEND_PORT "Frontend" true
    kill_port $BACKEND_PORT "Backend" true

    print_success "服务已停止"
}

# 查看服务状态
show_status() {
    print_status "📊 NovelFlow 服务状态"
    echo ""
    
    local frontend_pid=$(check_port $FRONTEND_PORT)
    if [ ! -z "$frontend_pid" ]; then
        print_success "前端服务运行中 (PID: $frontend_pid, 端口: $FRONTEND_PORT)"
        echo "  - 访问地址: http://localhost:$FRONTEND_PORT"
    else
        print_warning "前端服务未运行 (端口: $FRONTEND_PORT)"
    fi
    
    local backend_pid=$(check_port $BACKEND_PORT)
    if [ ! -z "$backend_pid" ]; then
        print_success "后端服务运行中 (PID: $backend_pid, 端口: $BACKEND_PORT)"
    else
        print_warning "后端服务未运行 (端口: $BACKEND_PORT)"
    fi
    
    echo ""
}

# 强制杀死所有相关进程
force_kill() {
    print_warning "🔥 强制清理所有 NovelFlow 相关进程..."
    stop_service
    print_success "强制清理完成"
}

# 重启服务
restart_service() {
    print_status "🔄 重启 NovelFlow 服务..."
    stop_service
    sleep 2
    start_service
}

# 构建前端
build_frontend() {
    print_status "📦 构建前端生产版本..."
    (cd frontend && npm install > /dev/null 2>&1 && npm run build)
    print_success "前端构建完成，产物位于 'frontend/dist'"
}

# 显示帮助信息
show_help() {
    echo "NovelFlow 开发环境管理脚本"
    echo ""
    echo "使用方法:"
    echo "  ./dev.sh start    - 启动开发服务 (前端 + 后端占位符)"
    echo "  ./dev.sh stop     - 停止所有服务"
    echo "  ./dev.sh restart  - 重启服务"
    echo "  ./dev.sh status   - 查看服务状态"
    echo "  ./dev.sh kill     - 强制杀死所有相关进程"
    echo "  ./dev.sh build    - 仅构建前端"
    echo "  ./dev.sh help     - 显示此帮助信息"
    echo ""
    echo "端口信息:"
    echo "  - 前端开发服务: $FRONTEND_PORT"
    echo "  - 后端服务: $BACKEND_PORT (当前未实现)"
}

# 主命令处理
case "${1:-help}" in
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        restart_service
        ;;
    status)
        show_status
        ;;
    kill)
        force_kill
        ;;
    build)
        build_frontend
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "未知命令: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 