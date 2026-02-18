const fs = require('fs');
// Try to detect encoding or just read as buffer and convert?
// Actually simpler: just read as ucs2 if we are sure.
try {
    const content = fs.readFileSync('models_list.txt', 'ucs2');
    const lines = content.split('\n');
    lines.forEach(line => {
        if (line.includes('name') || line.includes('Name')) {
            console.log(line.trim());
        }
    });
} catch (e) {
    console.error("Error reading file:", e.message);
}
