// Script para gerar ícones PNG a partir do SVG
// Para usar: node generate-icons.js
// Requer: npm install sharp

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'public', 'favicon.svg');
const publicDir = path.join(__dirname, 'public');

const sizes = [16, 32, 48, 128];

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  console.log('Gerando ícones PNG a partir do SVG...');

  for (const size of sizes) {
    const outputPath = path.join(publicDir, `icon-${size}.png`);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✓ Gerado: icon-${size}.png`);
  }

  console.log('\nTodos os ícones foram gerados com sucesso!');
}

generateIcons().catch(err => {
  console.error('Erro ao gerar ícones:', err);
  process.exit(1);
});
