# How to Schedule Node.js Scripts on macOS Using LaunchD

## Overview
This tutorial will teach you how to create a scheduled Node.js script that runs automatically on macOS using LaunchD (Launch Daemon). By the end of this tutorial, you'll have a Node.js script that prints the current date/time every few seconds and runs in the background.

## Prerequisites
- macOS computer
- Node.js installed (via nvm, Homebrew, or official installer)
- Basic terminal/command line knowledge
- Text editor (VS Code, TextEdit, etc.)

## Step 1: Create Your Node.js Script

First, create a new directory for your project and navigate to it:

```bash
mkdir scheduled-node-app
cd scheduled-node-app
```

Create an `index.js` file with the following content:

```javascript
function printCurrentDateTime() {
    const now = new Date();

    // Convert to Eastern Time (handles both EST and EDT automatically)
    const options = {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

    // Format using Intl.DateTimeFormat
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(now);

    // Extract date/time parts manually for MM-DD-YYYY HH:MM:SS
    const dateParts = {};
    parts.forEach(({ type, value }) => {
        dateParts[type] = value;
    });

    const formatted = `${dateParts.month}-${dateParts.day}-${dateParts.year} ${dateParts.hour}:${dateParts.minute}:${dateParts.second}`;
    console.log("Hello World ===> " + '[' + formatted + ']');
}

// Execute the function
printCurrentDateTime();
```

Test your script by running:
```bash
node index.js
```

You should see output like: `Hello World ===> [10-28-2024 15:30:45]`

## Step 2: Find Your Node.js Installation Path

LaunchD needs the full path to your Node.js executable. Run this command to find it:

```bash
which node
```

**Common paths:**
- If using nvm: `/Users/[username]/.nvm/versions/node/v[version]/bin/node`
- If using Homebrew: `/usr/local/bin/node` or `/opt/homebrew/bin/node`
- If using official installer: `/usr/local/bin/node`

**Important:** Copy this path - you'll need it in the next step.

## Step 3: Create the LaunchD plist File

Create a file named `com.yourname.scheduler.plist` (replace "yourname" with your actual name or company):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>com.yourname.scheduler</string>

    <key>ProgramArguments</key>
    <array>
      <string>YOUR_NODE_PATH_HERE</string>
      <string>FULL_PATH_TO_YOUR_INDEX_JS_HERE</string>
    </array>

    <key>StartInterval</key>
    <integer>10</integer>

    <key>StandardErrorPath</key>
    <string>FULL_PATH_TO_YOUR_PROJECT_FOLDER/stderr.log</string>
    <key>StandardOutPath</key>
    <string>FULL_PATH_TO_YOUR_PROJECT_FOLDER/stdout.log</string>

    <key>KeepAlive</key>
    <true/>
  </dict>
</plist>
```

**You must replace the following placeholders:**

1. **YOUR_NODE_PATH_HERE**: Replace with the path from Step 2
2. **FULL_PATH_TO_YOUR_INDEX_JS_HERE**: Replace with the full path to your index.js file
3. **FULL_PATH_TO_YOUR_PROJECT_FOLDER**: Replace with the full path to your project directory

**Example of completed plist file:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>com.john.scheduler</string>

    <key>ProgramArguments</key>
    <array>
      <string>/Users/john/.nvm/versions/node/v18.17.0/bin/node</string>
      <string>/Users/john/Desktop/scheduled-node-app/index.js</string>
    </array>

    <key>StartInterval</key>
    <integer>10</integer>

    <key>StandardErrorPath</key>
    <string>/Users/john/Desktop/scheduled-node-app/stderr.log</string>
    <key>StandardOutPath</key>
    <string>/Users/john/Desktop/scheduled-node-app/stdout.log</string>

    <key>KeepAlive</key>
    <true/>
  </dict>
</plist>
```

## Step 4: Configuration Options

### Key Configuration Options:

- **Label**: Unique identifier for your service (must match filename without .plist)
- **StartInterval**: How often to run the script (in seconds)
  - `10` = every 10 seconds
  - `60` = every minute
  - `3600` = every hour
- **KeepAlive**: Set to `<true/>` to restart if the script fails

## Step 5: Install and Start the Service

### 5.1 Copy the plist file to LaunchAgents
```bash
cp com.yourname.scheduler.plist ~/Library/LaunchAgents/
```

### 5.2 Load and start the service
```bash
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.yourname.scheduler.plist
```

### 5.3 Verify the service is running
```bash
launchctl list | grep com.yourname.scheduler
```

If you see output, the service is loaded successfully.

## Step 6: Monitor Your Service

### Check the output logs
```bash
# View the output in real-time
tail -f stdout.log

# View any errors
tail -f stderr.log
```

### Check service status
```bash
launchctl print gui/$(id -u)/com.yourname.scheduler
```

## Step 7: Managing Your Service

### Stop the service
```bash
launchctl bootout gui/$(id -u)/com.yourname.scheduler
```

### Restart the service
```bash
launchctl bootout gui/$(id -u)/com.yourname.scheduler
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.yourname.scheduler.plist
```

### Completely remove the service
```bash
# Stop the service
launchctl bootout gui/$(id -u)/com.yourname.scheduler

# Remove the plist file
rm ~/Library/LaunchAgents/com.yourname.scheduler.plist

# Clean up log files (optional)
rm stdout.log stderr.log
```

## Troubleshooting

### Common Issues:

1. **"Bootstrap failed: 5: Input/output error"**
   - Check that your node path is correct: `which node`
   - Verify your index.js file exists and is executable
   - Ensure all paths in the plist are absolute (full paths)

2. **Service loads but doesn't run**
   - Check stderr.log for error messages
   - Verify the plist syntax: `plutil -lint ~/Library/LaunchAgents/com.yourname.scheduler.plist`

3. **Can't find the service**
   - Make sure the Label in the plist matches the filename (without .plist)
   - Check if it's already loaded: `launchctl list | grep scheduler`

### Validation Commands:
```bash
# Check if node path is correct
/YOUR_NODE_PATH_HERE --version

# Test your script manually
node /path/to/your/index.js

# Validate plist syntax
plutil -lint com.yourname.scheduler.plist
```

## Best Practices

1. **Use absolute paths** for all file references in the plist
2. **Test your Node.js script** manually before scheduling it
3. **Monitor the logs** regularly to ensure everything is working
4. **Use descriptive labels** that won't conflict with other services
5. **Set appropriate intervals** - don't run scripts too frequently unless necessary

## Conclusion

You now have a scheduled Node.js script running on macOS using LaunchD! This method is more reliable than cron jobs on macOS and integrates better with the system. You can modify the `index.js` file to perform any task you need, and adjust the `StartInterval` to run at your desired frequency.

The service will automatically start when you log in and continue running in the background until you stop it or restart your computer.