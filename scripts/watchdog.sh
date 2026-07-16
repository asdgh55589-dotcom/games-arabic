#!/bin/bash
# watchdog.sh — بيراقب الخادم ويعيد تشغيله لو مات

cd /home/z/my-project

while true; do
  # تحقق لو الخادم شغّال
  if ! curl -s --max-time 5 http://127.0.0.1:3000/ > /dev/null 2>&1; then
    echo "[$(date)] Server is down, restarting..."
    pkill -9 -f "node.*standalone" 2>/dev/null
    sleep 2
    NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000 NODE_OPTIONS="--max-old-space-size=2048" nohup node .next/standalone/server.js > /home/z/my-project/server.log 2>&1 &
    disown
    echo "[$(date)] Server restarted with PID $!"
    sleep 5
  fi
  sleep 30  # تحقق كل 30 ثانية
done
