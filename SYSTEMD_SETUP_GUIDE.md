# Setting Up Legal Assistant as a Systemd Service

This guide provides step-by-step instructions for setting up the Legal Assistant application as a systemd service on your Ubuntu server. This will ensure the application runs 24/7, automatically starts on server boot, and restarts if it crashes.

## Prerequisites

- Ubuntu server with systemd (standard on all modern Ubuntu versions)
- Legal Assistant application installed and working when run manually
- Root or sudo access on the server

## Step 1: Prepare the Service File

1. The `legal-assistant.service` file has been created for you. You need to modify it to match your server's configuration:

   - Edit the `User` field to match your Ubuntu username
   - Edit the `WorkingDirectory` path to match your application's location
   - Edit the `ExecStart` and `ExecStop` paths to match your script locations

   For example, if your username is `ubuntu` and the application is in `/home/ubuntu/LegalAssistant`, the paths are already correct.

## Step 2: Install the Service

1. Copy the service file to the systemd directory:

   ```bash
   sudo cp legal-assistant.service /etc/systemd/system/
   ```

2. Set the correct permissions:

   ```bash
   sudo chmod 644 /etc/systemd/system/legal-assistant.service
   ```

## Step 3: Make Scripts Executable

1. Ensure your start and stop scripts are executable:

   ```bash
   chmod +x start-app.sh stop-app.sh
   ```

## Step 4: Enable and Start the Service

1. Reload the systemd configuration to recognize the new service:

   ```bash
   sudo systemctl daemon-reload
   ```

2. Enable the service to start automatically on boot:

   ```bash
   sudo systemctl enable legal-assistant
   ```

3. Start the service:

   ```bash
   sudo systemctl start legal-assistant
   ```

## Step 5: Verify the Service is Running

1. Check the status of the service:

   ```bash
   sudo systemctl status legal-assistant
   ```

   You should see output indicating the service is active (running).

2. Test that your application is accessible by visiting:
   - Frontend: `http://your-server-ip:5173`
   - Backend API: `http://your-server-ip:3001/api`

## Managing the Service

### Viewing Logs

To view the service logs:

```bash
sudo journalctl -u legal-assistant
```

To follow the logs in real-time:

```bash
sudo journalctl -u legal-assistant -f
```

### Restarting the Service

If you need to restart the service:

```bash
sudo systemctl restart legal-assistant
```

### Stopping the Service

If you need to stop the service:

```bash
sudo systemctl stop legal-assistant
```

### Disabling the Service

If you want to prevent the service from starting automatically on boot:

```bash
sudo systemctl disable legal-assistant
```

## Troubleshooting

### Service Fails to Start

1. Check the logs for errors:

   ```bash
   sudo journalctl -u legal-assistant -n 50
   ```

2. Verify the paths in the service file are correct:

   ```bash
   sudo nano /etc/systemd/system/legal-assistant.service
   ```

3. Make sure the start-app.sh script works when run manually:

   ```bash
   cd /path/to/LegalAssistant
   ./start-app.sh
   ```

4. Check if Node.js is installed and in the PATH for the service user:

   ```bash
   sudo -u ubuntu which node
   sudo -u ubuntu node -v
   ```

### Application Crashes and Doesn't Restart

1. The `Restart=always` directive should automatically restart the service if it crashes. If it's not restarting, check the logs:

   ```bash
   sudo journalctl -u legal-assistant -n 100
   ```

2. You might need to adjust the `RestartSec` value in the service file if the application needs more time to shut down properly before restarting.

## Advanced Configuration

### Environment Variables

If your application needs additional environment variables, add them to the service file:

```
[Service]
...
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=ANOTHER_VAR=value
```

After modifying the service file, reload the daemon and restart the service:

```bash
sudo systemctl daemon-reload
sudo systemctl restart legal-assistant
```

### Resource Limits

You can set resource limits for your service to prevent it from consuming too many resources:

```
[Service]
...
LimitNOFILE=4096
MemoryLimit=2G
CPUQuota=80%
```

## Conclusion

Your Legal Assistant application should now run continuously as a systemd service. It will:

- Start automatically when the server boots
- Restart automatically if it crashes
- Run independently of SSH sessions
- Log output to the system journal

This setup ensures maximum uptime and reliability for your application.
