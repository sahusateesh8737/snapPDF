#!/bin/bash

# Start LibreOffice listener in the background
# This keeps a "warm" instance of LibreOffice running on port 2002
# Start LibreOffice listener in the background
# This keeps a "warm" instance of LibreOffice running on port 2002
# We isolate the UserInstallation to /tmp to ensure writability on cloud platforms
# Use unoserver to manage the LibreOffice daemon instead of unoconv/soffice
echo "Starting LibreOffice listener via unoserver..."
unoserver --daemon --user-installation=/tmp/libreoffice_server_profile &

# Wait for the listener to be ready
# unoserver usually initializes very quickly compared to raw soffice
sleep 5

echo "LibreOffice listener started."

# Start the main Node.js application
echo "Starting Node.js application..."
exec pnpm --filter api start
