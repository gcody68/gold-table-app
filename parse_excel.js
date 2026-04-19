const XLSX = require('/tmp/cc-agent/65659909/project/node_modules/xlsx');
const fs = require('fs');

const filePath = '/tmp/restaurant.xlsx';

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const workbook = XLSX.readFile(filePath, { cellFormula: false, cellHTML: false });

const output = {
  sheetNames: workbook.SheetNames,
  sheets: {}
};

console.log('Sheet names:', workbook.SheetNames);

for (const sheetName of workbook.SheetNames) {
  const worksheet = workbook.Sheets[sheetName];

  // Get the full range of the sheet
  const range = worksheet['!ref'];
  console.log(`\nSheet: "${sheetName}" | Range: ${range || 'empty'}`);

  // Convert to JSON (array of arrays to preserve all rows/cols)
  const jsonArrayOfArrays = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: null,
    blankrows: true
  });

  // Also convert to JSON with headers (first row as keys)
  const jsonWithHeaders = XLSX.utils.sheet_to_json(worksheet, {
    defval: null
  });

  output.sheets[sheetName] = {
    range: range || null,
    rawRows: jsonArrayOfArrays,
    rowsWithHeaders: jsonWithHeaders
  };

  console.log(`  Rows (raw): ${jsonArrayOfArrays.length}`);
  console.log(`  Rows (with headers): ${jsonWithHeaders.length}`);

  // Print first few rows as preview
  const preview = jsonArrayOfArrays.slice(0, 5);
  console.log(`  Preview (first 5 rows):`);
  preview.forEach((row, i) => {
    console.log(`    Row ${i}: ${JSON.stringify(row)}`);
  });
}

const outputPath = '/tmp/excel_data.json';
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`\nFull data saved to: ${outputPath}`);
console.log(`Output file size: ${fs.statSync(outputPath).size} bytes`);
