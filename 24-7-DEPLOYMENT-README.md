# 24/7 Deployment Guide for Legal Assistant

This guide explains how to ensure your Legal Assistant application runs continuously (24/7) on your Ubuntu server, even after SSH disconnections or server reboots.

## Files Included

We've created several files to help you set up a robust, always-running deployment:

1. **legal-assistant.service**: A systemd service configuration file
2. **install-service.sh**: A script to automate the installation of the systemd service
3. **check-service.sh**: A script to verify the service is running correctly
4. **SYSTEMD_SETUP_GUIDE.md**: Detailed manual instructions for setting up the service
5. **SSH_CONNECTION_GUIDE.md**: Information about handling SSH disconnections

## Quick Setup (Recommended)

For the easiest setup, use the automated installation script:

1. Make sure you're in the Legal Assistant directory on your Ubuntu server
2. Run the installation script with sudo:

   ```bash
   sudo ./install-service.sh
   ```

3. Follow the prompts to complete the installation
4. The service will be set up to start automatically on boot and restart if it crashes

## What This Solves

This setup addresses the following issues:

- **SSH Disconnections**: The application will continue running even if your SSH session disconnects
- **Server Reboots**: The application will automatically start when the server boots
- **Application Crashes**: The service will automatically restart the application if it crashes
- **24/7 Operation**: The application will run continuously without manual intervention

## Verifying the Deployment

After setting up the service, you can verify it's working correctly:

1. Use the check-service script (recommended):

   ```bash
   ./check-service.sh
   ```

   This script will:
   - Verify the service is installed and running
   - Check if the backend and frontend are responding
   - Display access URLs and service status

2. Check the service status manually:

   ```bash
   sudo systemctl status legal-assistant
   ```

3. Access your application:
   - Frontend: `http://your-server-ip:5173`
   - Backend API: `http://your-server-ip:3001/api`

4. View the logs:

   ```bash
   sudo journalctl -u legal-assistant -n 50
   ```

## Common Management Tasks

### Restarting the Application

If you need to restart the application (e.g., after making changes):

```bash
sudo systemctl restart legal-assistant
```

### Stopping the Application

If you need to stop the application:

```bash
sudo systemctl stop legal-assistant
```

### Viewing Real-time Logs

To follow the application logs in real-time:

```bash
sudo journalctl -u legal-assistant -f
```

## Troubleshooting

If you encounter issues with the service:

1. Check the service status for error messages:

   ```bash
   sudo systemctl status legal-assistant
   ```

2. View the detailed logs:

   ```bash
   sudo journalctl -u legal-assistant -n 100
   ```

3. Make sure the paths in the service file are correct:

   ```bash
   sudo nano /etc/systemd/system/legal-assistant.service
   ```

4. After making changes to the service file, reload the daemon:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart legal-assistant
   ```

## Manual Setup

If you prefer to set up the service manually or need more control over the configuration, refer to the detailed instructions in `SYSTEMD_SETUP_GUIDE.md`.

## SSH Connection Issues

If you're experiencing SSH connection issues (like "Broken pipe" errors), refer to `SSH_CONNECTION_GUIDE.md` for information on maintaining stable SSH connections and running commands that survive disconnections.

## Additional Resources

- [Systemd Documentation](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
- [Ubuntu Service Documentation](https://ubuntu.com/tutorials/create-a-systemd-service)
