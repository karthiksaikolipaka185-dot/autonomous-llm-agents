const fs = require('fs');
const content = fs.readFileSync('models_list.txt', 'utf8');
const lines = content.split('\n');
lines.forEach(line => {
    if (line.includes('name') || line.includes('Name')) {
        console.log(line.trim());
    }
});
