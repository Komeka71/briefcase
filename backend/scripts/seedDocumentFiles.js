/**
 * Seeds placeholder document files in backend/storage/documents/
 * for all records in the DOCUMENT table.
 */
const fs = require('fs');
const path = require('path');
const { pools } = require('../src/config/db');

async function seedDocumentFiles() {
  const storageDir = path.join(__dirname, '../storage/documents');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  const [docs] = await pools.admin.query('SELECT document_id, title, file_path FROM DOCUMENT');
  console.log(`Found ${docs.length} document records in database.`);

  for (const doc of docs) {
    const baseName = path.basename(doc.file_path || `document_${doc.document_id}.pdf`);
    const filePath = path.join(storageDir, baseName);

    const content = `%PDF-1.4
%BriefCase Law Firm Management System
%Document ID: ${doc.document_id}
%Title: ${doc.title}
%Generated: ${new Date().toISOString()}
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 100 >>
stream
BT
/F1 14 Tf
50 700 Td
(${doc.title.replace(/[()]/g, '')}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000070 00000 n 
0000000120 00000 n 
0000000178 00000 n 
0000000263 00000 n 
trailer
<< /Root 1 0 R /Size 5 >>
startxref
415
%%EOF
`;

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ Created placeholder file: ${baseName}`);
  }

  console.log('Document files seeding complete.');
  process.exit(0);
}

seedDocumentFiles().catch((err) => {
  console.error('Failed to seed document files:', err);
  process.exit(1);
});
