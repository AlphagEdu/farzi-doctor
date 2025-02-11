const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const Docxtemplater = require('docxtemplater');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);
        
        // Load the template file
        const templatePath = path.resolve(__dirname, '../report_draft.docx');
        const content = fs.readFileSync(templatePath, 'binary');
        const zip = new JSZip(content);
        const doc = new Docxtemplater().loadZip(zip);

        // Replace placeholders
        doc.setData({
            'Shivam Nishad': data.name,
            '16/01/2025 14:13': data.regDate,
            '16/01/2025 14:27': data.sampleCollection,
            '17/01/2025 17:24': data.printDate,
            '14 Years / Male': `${data.age} Years / ${data.gender}`
        });

        doc.render();

        // Generate modified document
        const updatedDoc = doc.getZip().generate({ type: 'nodebuffer' });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
            body: updatedDoc.toString('base64'),
            isBase64Encoded: true
        };
    } catch (error) {
        return { statusCode: 500, body: `Error: ${error.message}` };
    }
};
