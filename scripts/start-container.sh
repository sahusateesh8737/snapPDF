#!/bin/bash

# Start LibreOffice listener in the background
# This keeps a "warm" instance of LibreOffice running on port 2002
# Start LibreOffice listener in the background
# This keeps a "warm" instance of LibreOffice running on port 2002
# We isolate the UserInstallation to /tmp to ensure writability on cloud platforms
echo "Starting LibreOffice listener..."
soffice --headless --accept="socket,host=127.0.0.1,port=2002;urp;" \
  "-env:UserInstallation=file:///tmp/libreoffice_server_profile" \
  --nofirststartwizard --nologo --nodefault --norestore --java-disable &

# Wait for the listener to be ready
# We give it 10 seconds to account for slower cloud CPU resources
sleep 10

echo "LibreOffice listener started."

# Start the main Node.js application
echo "Starting Node.js application..."
exec pnpm --filter api start
