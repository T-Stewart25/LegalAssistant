# Running Legal Assistant on a VM

This guide provides instructions for running the Legal Assistant application on a virtual machine (VM).

## Prerequisites

- A VM with a Linux-based operating system (Ubuntu, CentOS, Debian, etc.)
- Node.js (v18.0.0 or higher) installed
- Git installed (for cloning the repository)
- Basic knowledge of Linux commands

### Installing Node.js

If you don't have Node.js installed on your VM, you can use the provided installation script:

```bash
./install-nodejs.sh
```

This script will:
- Detect your Linux distribution
- Install Node.js v18.x and npm using the appropriate package manager
- Verify the installation

The script supports Ubuntu/Debian, CentOS/RHEL, and Alpine Linux. For other distributions, it will attempt to install Node.js using NVM (Node Version Manager).

## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <your-repository-url>
   cd LegalAssistant
   ```

2. **Install dependencies**

   The start script will automatically install dependencies if they're not already installed, but you can also install them manually:

   ```bash
   npm run install-all
   ```

   This will install dependencies for the root project, the UI (frontend), and the server (backend).

## Running the Application

### Starting the Application

To start both the frontend and backend servers:

```bash
./start-app.sh
```

This script will:
- Build the frontend (React app)
- Start the backend server on port 3001
- Serve the built frontend on port 5173
- Display URLs for accessing the application

The script will continue running in the terminal. You can keep it running to see logs, or press Ctrl+C to stop the script (the servers will continue running in the background).

### Stopping the Application

To stop all running services:

```bash
./stop-app.sh
```

This script will:
- Stop the frontend server
- Stop the backend server
- Check for any remaining processes and stop them

### Testing the Application

To verify that the application is running correctly:

```bash
./test-app.sh
```

This script will:
- Check if both frontend and backend servers are running
- Test API endpoints to ensure they're accessible
- Verify process IDs and log files
- Display access URLs for the application

## Accessing the Application

After starting the application, you can access it using:

- **Frontend**: `http://<your-vm-ip>:5173`
- **Backend API**: `http://<your-vm-ip>:3001/api`
- **Health Check**: `http://<your-vm-ip>:3001/api/health`

Replace `<your-vm-ip>` with your VM's IP address.

## Logs

Logs are stored in the `logs` directory:

- **Backend logs**: `logs/backend.log`
- **Frontend logs**: `logs/frontend.log`

You can view these logs to troubleshoot any issues:

```bash
tail -f logs/backend.log
tail -f logs/frontend.log
```

## Customizing the Configuration

If you need to change ports or other settings, you can edit the `start-app.sh` script:

- `BACKEND_PORT`: The port for the Node.js server (default: 3001)
- `FRONTEND_PORT`: The port for the frontend server (default: 5173)
- `HOST`: The host to bind to (default: 0.0.0.0, which binds to all network interfaces)

After changing these settings, make sure to restart the application.

## Running as a Service

To run the application as a service that starts automatically when the VM boots:

1. Create a systemd service file:

   ```bash
   sudo nano /etc/systemd/system/legal-assistant.service
   ```

2. Add the following content (adjust paths as needed):

   ```
   [Unit]
   Description=Legal Assistant Application
   After=network.target

   [Service]
   Type=simple
   User=<your-username>
   WorkingDirectory=/path/to/LegalAssistant
   ExecStart=/path/to/LegalAssistant/start-app.sh
   ExecStop=/path/to/LegalAssistant/stop-app.sh
   Restart=on-failure
   RestartSec=10
   StandardOutput=syslog
   StandardError=syslog
   SyslogIdentifier=legal-assistant

   [Install]
   WantedBy=multi-user.target
   ```

3. Enable and start the service:

   ```bash
   sudo systemctl enable legal-assistant
   sudo systemctl start legal-assistant
   ```

4. Check the status:

   ```bash
   sudo systemctl status legal-assistant
   ```

## Troubleshooting

### Application won't start

1. Check if ports are already in use:

   ```bash
   sudo lsof -i:3001
   sudo lsof -i:5173
   ```

2. Check the logs for errors:

   ```bash
   cat logs/backend.log
   cat logs/frontend.log
   ```

3. Make sure all dependencies are installed:

   ```bash
   npm run install-all
   ```

### Can't access the application

1. Make sure your VM's firewall allows traffic on ports 3001 and 5173:

   ```bash
   # For UFW (Ubuntu)
   sudo ufw allow 3001/tcp
   sudo ufw allow 5173/tcp
   
   # For firewalld (CentOS/RHEL)
   sudo firewall-cmd --permanent --add-port=3001/tcp
   sudo firewall-cmd --permanent --add-port=5173/tcp
   sudo firewall-cmd --reload
   ```

2. Check if the application is running:

   ```bash
   ps aux | grep node
   ps aux | grep vite
   ```

3. Verify the IP address you're using to access the application.
