#!/bin/bash

# Function to send commands via SSH
send_ssh_commands() {
    ssh -o StrictHostKeyChecking=no root@91.108.121.251 << 'EOF'
        echo "Connected to server. Checking current status..."
        
        # Check what's running
        echo "=== Current processes ==="
        ps aux | grep -E "(node|npm|pm2)" | grep -v grep
        
        echo "=== Current directory ==="
        pwd
        ls -la
        
        # Check if there are any Node.js applications
        echo "=== Looking for Node.js applications ==="
        find / -name "package.json" -type f 2>/dev/null | head -10
        
        # Check if PM2 is installed and running
        echo "=== PM2 status ==="
        if command -v pm2 &> /dev/null; then
            pm2 status
        else
            echo "PM2 not found"
        fi
        
        # Check for running services on common ports
        echo "=== Services on common ports ==="
        netstat -tlnp 2>/dev/null | grep -E ":(80|3000|8080|5000|4000)" || echo "No services found on common ports"
        
        echo "=== System information ==="
        uname -a
        df -h
EOF
}

# Try to connect and run commands
echo "Attempting to connect to VPS server..."
send_ssh_commands