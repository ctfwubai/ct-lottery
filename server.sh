#!/bin/bash

# 抽奖系统 - 前后端服务管理脚本
# 作者: Auto
# 日期: 2024-12-30

PROJECT_DIR="/opt/log-lottery-main"
NGINX_CONFIG="/etc/nginx/sites-available/log-lottery"
BACKEND_NAME="log-lottery-backend"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        return 1
    fi
    return 0
}

# 检查服务状态
check_services() {
    print_message "$BLUE" "=========================================="
    print_message "$BLUE" "检查服务状态"
    print_message "$BLUE" "=========================================="

    # 检查 PM2 是否安装
    if ! check_command pm2; then
        print_message "$RED" "❌ PM2 未安装，请先运行: npm install -g pm2"
        exit 1
    fi

    # 检查 Nginx 是否安装
    if ! check_command nginx; then
        print_message "$RED" "❌ Nginx 未安装，请先运行: sudo apt install nginx"
        exit 1
    fi

    # 检查 PM2 后端服务状态
    print_message "$YELLOW" "后端服务状态 (PM2):"
    pm2 status $BACKEND_NAME 2>/dev/null
    if [ $? -eq 0 ]; then
        print_message "$GREEN" "✓ 后端服务运行正常"
    else
        print_message "$RED" "✗ 后端服务未运行"
    fi

    # 检查 Nginx 状态
    print_message "$YELLOW" "\n前端服务状态 (Nginx):"
    if systemctl is-active --quiet nginx; then
        print_message "$GREEN" "✓ Nginx 运行正常"
    else
        print_message "$RED" "✗ Nginx 未运行"
    fi

    # 检查端口占用
    print_message "$YELLOW" "\n端口占用情况:"
    print_message "$YELLOW" "前端 (8088):"
    if netstat -tuln | grep -q ":8088"; then
        print_message "$GREEN" "✓ 端口 8088 正在监听"
    else
        print_message "$RED" "✗ 端口 8088 未监听"
    fi

    print_message "$YELLOW" "后端 (3001):"
    if netstat -tuln | grep -q ":3001"; then
        print_message "$GREEN" "✓ 端口 3001 正在监听"
    else
        print_message "$RED" "✗ 端口 3001 未监听"
    fi

    print_message "$BLUE" "=========================================="
}

# 启动所有服务
start_services() {
    print_message "$GREEN" "=========================================="
    print_message "$GREEN" "启动前后端服务"
    print_message "$GREEN" "=========================================="

    # 启动 Nginx
    print_message "$YELLOW" "启动 Nginx..."
    sudo systemctl start nginx
    if [ $? -eq 0 ]; then
        print_message "$GREEN" "✓ Nginx 启动成功"
    else
        print_message "$RED" "✗ Nginx 启动失败"
    fi

    # 启动后端服务
    print_message "$YELLOW" "启动后端服务..."
    cd $PROJECT_DIR
    pm2 start server.cjs --name $BACKEND_NAME --update-env
    if [ $? -eq 0 ]; then
        print_message "$GREEN" "✓ 后端服务启动成功"
    else
        print_message "$RED" "✗ 后端服务启动失败"
    fi

    # 等待服务启动
    print_message "$YELLOW" "\n等待服务启动..."
    sleep 3

    # 显示访问地址
    print_message "$GREEN" "\n=========================================="
    print_message "$GREEN" "服务启动完成！"
    print_message "$GREEN" "=========================================="
    print_message "$YELLOW" "前端访问地址: http://$(hostname -I | awk '{print $1}'):8088"
    print_message "$YELLOW" "后端API地址:  http://$(hostname -I | awk '{print $1}'):3001"
    print_message "$GREEN" "=========================================="

    # 检查状态
    check_services
}

# 停止所有服务
stop_services() {
    print_message "$RED" "=========================================="
    print_message "$RED" "停止前后端服务"
    print_message "$RED" "=========================================="

    # 停止后端服务
    print_message "$YELLOW" "停止后端服务..."
    pm2 stop $BACKEND_NAME
    if [ $? -eq 0 ]; then
        print_message "$GREEN" "✓ 后端服务已停止"
    else
        print_message "$YELLOW" "⚠ 后端服务可能未运行"
    fi

    # 停止 Nginx
    print_message "$YELLOW" "停止 Nginx..."
    sudo systemctl stop nginx
    if [ $? -eq 0 ]; then
        print_message "$GREEN" "✓ Nginx 已停止"
    else
        print_message "$RED" "✗ Nginx 停止失败"
    fi

    print_message "$GREEN" "=========================================="
}

# 重启所有服务
restart_services() {
    print_message "$BLUE" "=========================================="
    print_message "$BLUE" "重启前后端服务"
    print_message "$BLUE" "=========================================="

    stop_services
    sleep 2
    start_services
}

# 查看日志
view_logs() {
    print_message "$BLUE" "=========================================="
    print_message "$BLUE" "查看日志"
    print_message "$BLUE" "=========================================="

    echo ""
    echo "选择要查看的日志:"
    echo "1) 后端服务日志 (PM2)"
    echo "2) Nginx 访问日志"
    echo "3) Nginx 错误日志"
    echo "4) 实时查看后端日志"
    echo "5) 实时查看 Nginx 访问日志"
    echo "6) 实时查看 Nginx 错误日志"
    echo "0) 返回"
    echo ""
    read -p "请选择 (0-6): " log_choice

    case $log_choice in
        1)
            print_message "$YELLOW" "后端服务日志 (PM2):"
            pm2 logs $BACKEND_NAME --lines 50
            ;;
        2)
            print_message "$YELLOW" "Nginx 访问日志 (最近50行):"
            sudo tail -n 50 /var/log/nginx/access.log
            ;;
        3)
            print_message "$YELLOW" "Nginx 错误日志 (最近50行):"
            sudo tail -n 50 /var/log/nginx/error.log
            ;;
        4)
            print_message "$YELLOW" "实时查看后端日志 (Ctrl+C 退出):"
            pm2 logs $BACKEND_NAME
            ;;
        5)
            print_message "$YELLOW" "实时查看 Nginx 访问日志 (Ctrl+C 退出):"
            sudo tail -f /var/log/nginx/access.log
            ;;
        6)
            print_message "$YELLOW" "实时查看 Nginx 错误日志 (Ctrl+C 退出):"
            sudo tail -f /var/log/nginx/error.log
            ;;
        0)
            return
            ;;
        *)
            print_message "$RED" "无效选择"
            ;;
    esac
}

# 重新部署
redeploy() {
    print_message "$BLUE" "=========================================="
    print_message "$BLUE" "重新部署"
    print_message "$BLUE" "=========================================="

    print_message "$YELLOW" "停止服务..."
    stop_services

    print_message "$YELLOW" "进入项目目录..."
    cd $PROJECT_DIR

    print_message "$YELLOW" "安装依赖..."
    pnpm install

    print_message "$YELLOW" "构建项目..."
    pnpm run build

    if [ $? -ne 0 ]; then
        print_message "$RED" "✗ 构建失败"
        exit 1
    fi

    print_message "$GREEN" "✓ 构建成功"

    print_message "$YELLOW" "部署到 Nginx..."
    sudo cp -r dist/* /var/www/log-lottery/
    sudo cp -r public/fonts /var/www/log-lottery/
    sudo cp -r public/templates /var/www/log-lottery/

    print_message "$YELLOW" "设置权限..."
    sudo chown -R www-data:www-data /var/www/log-lottery
    sudo chmod -R 755 /var/www/log-lottery

    print_message "$GREEN" "✓ 部署成功"

    print_message "$YELLOW" "启动服务..."
    start_services
}

# 显示帮助信息
show_help() {
    print_message "$BLUE" "=========================================="
    print_message "$BLUE" "抽奖系统服务管理脚本"
    print_message "$BLUE" "=========================================="
    echo ""
    echo "用法: ./server.sh [选项]"
    echo ""
    echo "选项:"
    echo "  start      启动前后端服务"
    echo "  stop       停止前后端服务"
    echo "  restart    重启前后端服务"
    echo "  status     查看服务状态"
    echo "  logs       查看日志"
    echo "  redeploy   重新部署 (构建+部署+启动)"
    echo "  help       显示帮助信息"
    echo ""
    echo "示例:"
    echo "  ./server.sh start      # 启动服务"
    echo "  ./server.sh status     # 查看状态"
    echo "  ./server.sh logs       # 查看日志"
    echo ""
    print_message "$BLUE" "=========================================="
}

# 主菜单
show_menu() {
    print_message "$GREEN" "=========================================="
    print_message "$GREEN" "抽奖系统服务管理"
    print_message "$GREEN" "=========================================="
    echo ""
    echo "1) 启动服务"
    echo "2) 停止服务"
    echo "3) 重启服务"
    echo "4) 查看状态"
    echo "5) 查看日志"
    echo "6) 重新部署"
    echo "7) 退出"
    echo ""
}

# 主函数
main() {
    case "$1" in
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        status)
            check_services
            ;;
        logs)
            view_logs
            ;;
        redeploy)
            redeploy
            ;;
        help|--help|-h)
            show_help
            ;;
        "")
            # 交互式菜单
            while true; do
                show_menu
                read -p "请选择 (1-7): " choice
                case $choice in
                    1) start_services ;;
                    2) stop_services ;;
                    3) restart_services ;;
                    4) check_services ;;
                    5) view_logs ;;
                    6) redeploy ;;
                    7)
                        print_message "$GREEN" "再见！"
                        exit 0
                        ;;
                    *)
                        print_message "$RED" "无效选择，请重新输入"
                        ;;
                esac
                echo ""
                read -p "按 Enter 继续..."
                clear
            done
            ;;
        *)
            print_message "$RED" "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
