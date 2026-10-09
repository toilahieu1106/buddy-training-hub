const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dir = fs.readdirSync('.');
const target = dir.find(f => f.includes('Phân rã') || f.includes('5W1H'));
console.log('Target file:', target);

if (target) {
  // Use powershell script to extract document.xml
  const script = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('${target}')
$entry = $zip.GetEntry('word/document.xml')
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$content = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()
[System.IO.File]::WriteAllText('temp_doc.xml', $content)
`;
  fs.writeFileSync('extract.ps1', script, 'utf8');
  execSync('powershell -ExecutionPolicy Bypass -File extract.ps1');
  
  const xml = fs.readFileSync('temp_doc.xml', 'utf8');
  // Simple XML parsing to extract text paragraphs
  const clean = xml
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  
  fs.writeFileSync('yeu_cau_phan_ra_5w1h.txt', clean, 'utf8');
  console.log('Successfully written to yeu_cau_phan_ra_5w1h.txt. Preview:');
  console.log(clean.slice(0, 1500));
}
