# LaunchD Service Management Instructions

## 1. Copy plist file to LaunchAgents
```bash
# Copy the plist file to the user's LaunchAgents directory
cp com.user.helloworld.plist ~/Library/LaunchAgents/
```

## 2. Start the service
```bash
# Bootstrap (load and start) the service
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.user.helloworld.plist

# Verify the service is running
launchctl list | grep com.user.helloworld
```

## 3. Check service status and logs
```bash
# View service details
launchctl print gui/$(id -u)/com.user.helloworld

# Monitor logs in real-time
tail -f stdout.log
tail -f stderr.log
```

## 4. Stop the service
```bash
# Stop and unload the service
launchctl bootout gui/$(id -u)/com.user.helloworld

# Verify it's stopped (should return no results)
launchctl list | grep com.user.helloworld
```

## 5. Completely remove the service
```bash
# First stop the service (if running)
launchctl bootout gui/$(id -u)/com.user.helloworld

# Remove the plist file from LaunchAgents
rm ~/Library/LaunchAgents/com.user.helloworld.plist

# Clean up log files (optional)
rm stdout.log stderr.log
```

## Troubleshooting
```bash
# If service won't stop, force kill it
launchctl kill SIGTERM gui/$(id -u)/com.user.helloworld

# Check plist syntax
plutil -lint ~/Library/LaunchAgents/com.user.helloworld.plist

# Find and kill process manually if needed
ps aux | grep "index.js"
kill [PID]
```