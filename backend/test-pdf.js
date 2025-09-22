import puppeteer from 'puppeteer';
import fs from 'fs';

async function testPDF() {
  console.log('Iniciando prueba de PDF...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Test PDF</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #2c5530; }
        </style>
      </head>
      <body>
        <h1>Prueba de PDF</h1>
        <p>Este es un PDF de prueba generado con Puppeteer.</p>
        <p>Fecha: ${new Date().toLocaleDateString('es-CO')}</p>
      </body>
      </html>
    `;
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    // Guardar el PDF en el sistema de archivos
    fs.writeFileSync('test-output.pdf', pdfBuffer);
    
    console.log('PDF generado exitosamente!');
    console.log('Tamaño del buffer:', pdfBuffer.length, 'bytes');
    console.log('Archivo guardado como: test-output.pdf');
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

testPDF().catch(console.error);