const {readFile} = require('fs/promises');
const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');


// Function to extract text from PDF
async function pdfToStr(path) {
    const buffer = await readFile(path);
    const pdfData = await pdf(buffer);
    return pdfData.text;
}

// Function to extract text from DOCX
async function docxToStr(path) {
    const result = await mammoth.extractRawText({ path });
    return result.value;
}

// Function to extract text from file
async function getTextFromFile(filePath) {
    if (filePath.toLowerCase().endsWith('.txt')) {
        return fs.readFileSync(filePath, 'utf-8');
    } else if (filePath.toLowerCase().endsWith('.pdf')) {
        return await pdfToStr(filePath);
    } else if (filePath.toLowerCase().endsWith('.docx')) {
        return await docxToStr(filePath);
    } else {
        console.error('Unsupported file format. Please provide a PDF or DOCX file.');
        return '';
    }
}

module.exports = getTextFromFile;



