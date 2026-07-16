#!/bin/bash
# Start the Next.js dev server in a fully detached, robust way.
cd /home/z/my-project

# Kill any existing next processes
pkill -9 -f "next" 2>/dev/null
sleep 2

# Start the server with setsid so it survives the shell exiting,
# and redirect all stdio so it never blocks on terminal I/O.
setsid bash -c 'exec npx next dev -p 3000' > dev.log 2>&1 < /dev/null &

# Wait for it to be ready
for i in {1..30}; do
  if curl -s -m 2 "http://localhost:3000/api/home" > /dev/null 2>&1; then
    echo "Server ready after ${i}s"
    exit 0
  fi
  sleep 1
done

echo "Server failed to start in 30s"
exit 1
