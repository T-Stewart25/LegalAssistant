# SSH Connection Guide

This guide provides information on handling SSH connection issues when working with your VM.

## Understanding "Broken pipe" Errors

The error message `client_loop: send disconnect: Broken pipe` typically indicates that your SSH connection to the VM was unexpectedly terminated. This can happen due to:

- Network instability
- Inactivity timeout
- Server-side connection limits
- Client-side network changes

## Reconnecting to Your VM

To reconnect to your VM after a disconnection:

```bash
ssh username@your-vm-ip
```

Replace `username` with your VM username and `your-vm-ip` with your VM's IP address.

## Running Long-Running Processes

When running long-running processes like our application scripts, it's a good idea to use tools that allow the processes to continue even if your SSH connection drops:

### Using Screen

1. Install screen (if not already installed):
   ```bash
   # Ubuntu/Debian
   sudo apt-get install screen
   
   # CentOS/RHEL
   sudo yum install screen
   ```

2. Start a new screen session:
   ```bash
   screen -S legalassistant
   ```

3. Run your commands inside the screen session:
   ```bash
   ./start-app.sh
   ```

4. Detach from the screen session (without terminating it):
   - Press `Ctrl+A` followed by `D`

5. Reconnect to the screen session later:
   ```bash
   screen -r legalassistant
   ```

### Using tmux

1. Install tmux (if not already installed):
   ```bash
   # Ubuntu/Debian
   sudo apt-get install tmux
   
   # CentOS/RHEL
   sudo yum install tmux
   ```

2. Start a new tmux session:
   ```bash
   tmux new -s legalassistant
   ```

3. Run your commands inside the tmux session:
   ```bash
   ./start-app.sh
   ```

4. Detach from the tmux session (without terminating it):
   - Press `Ctrl+B` followed by `D`

5. Reconnect to the tmux session later:
   ```bash
   tmux attach -t legalassistant
   ```

### Using nohup

For simpler cases, you can use `nohup` to keep processes running after disconnection:

```bash
nohup ./start-app.sh > nohup.out 2>&1 &
```

This will:
- Start the application in the background
- Keep it running even if you disconnect
- Save output to `nohup.out`
- Return control to your terminal immediately

To check the status:
```bash
tail -f nohup.out
```

## Preventing SSH Timeouts

To prevent SSH from disconnecting due to inactivity:

1. Edit your local SSH config file:
   ```bash
   nano ~/.ssh/config
   ```

2. Add the following settings:
   ```
   Host *
     ServerAliveInterval 60
     ServerAliveCountMax 3
   ```

3. Save and close the file.

These settings will send a keep-alive packet every 60 seconds, helping to maintain your connection.

## Running as a Service

For the most reliable operation, consider setting up the application as a system service as described in the VM_DEPLOYMENT.md guide. This ensures the application runs independently of SSH connections and starts automatically when the VM boots.
