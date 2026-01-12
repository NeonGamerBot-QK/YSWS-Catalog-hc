const fs = require('fs');
const jsyaml = require('js-yaml');

function isValidDate(date) {
    return date instanceof Date && !isNaN(date.getTime());
}

try {
    const fileContent = fs.readFileSync('data.yml', 'utf8');
    const data = jsyaml.load(fileContent);
    let invalidDates = [];
    for (let category in data) {
        if (Array.isArray(data[category])) {
            data[category].forEach(program => {
                if (program.deadline) {
                    const d = new Date(program.deadline);
                    if (!isValidDate(d)) {
                        invalidDates.push({ name: program.name, deadline: program.deadline });
                    }
                }
            });
        }
    }
    if (invalidDates.length) {
        console.warn('Found invalid dates in data.yml:');
        console.warn(invalidDates);
        process.exit(1);
    } else {
        console.log('All dates are valid.');
    }
} catch (err) {
    console.error(err);
    process.exit(1);
}
