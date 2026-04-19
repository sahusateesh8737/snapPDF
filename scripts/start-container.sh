#!/bin/bash

# Start LibreOffice listener in the background
# This keeps a "warm" instance of LibreOffice running on port 2002
echo "Starting LibreOffice listener..."
soffice --headless --accept="socket,host=127.0.0.1,port=2002;urp;" --nofirststartwizard --nologo --nodefault --java-disable &

# Wait for the listener to be ready
# We give it a few seconds to initialize
sleep 5

echo "LibreOffice listener started."

# Start the main Node.js application
echo "Starting Node.js application..."
exec pnpm --filter api start
