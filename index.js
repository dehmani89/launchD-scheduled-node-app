function printCurrentESTDateTime() {
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

// Example usage:
printCurrentESTDateTime();