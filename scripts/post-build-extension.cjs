// Script para preparar o build para extensão de navegador
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const publicDir = path.join(__dirname, '..', 'public');

console.log('📦 Preparando build para extensão de navegador...\n');

// 1. Copiar manifest.json
const manifestSrc = path.join(publicDir, 'manifest.json');
const manifestDest = path.join(distDir, 'manifest.json');
fs.copyFileSync(manifestSrc, manifestDest);
console.log('✓ manifest.json copiado');

// 2. Copiar ícones PNG
const iconSizes = [16, 32, 48, 128];
iconSizes.forEach(size => {
  const iconSrc = path.join(publicDir, `icon-${size}.png`);
  const iconDest = path.join(distDir, `icon-${size}.png`);
  if (fs.existsSync(iconSrc)) {
    fs.copyFileSync(iconSrc, iconDest);
    console.log(`✓ icon-${size}.png copiado`);
  }
});

// 3. Copiar pasta de áudio
const audioSrc = path.join(publicDir, 'audio');
const audioDest = path.join(distDir, 'audio');
if (fs.existsSync(audioSrc)) {
  fs.cpSync(audioSrc, audioDest, { recursive: true });
  console.log('✓ Pasta audio/ copiada');
}

// 3.5. Copiar arquivos de background e content
const extensionFiles = ['background.js', 'content.js'];
extensionFiles.forEach(file => {
  const src = path.join(publicDir, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ ${file} copiado`);
  }
});

// 4. Corrigir caminhos absolutos no index.html para caminhos relativos
const indexPath = path.join(distDir, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Substituir /assets/ por ./assets/
indexHtml = indexHtml.replace(/href="\/assets\//g, 'href="./assets/');
indexHtml = indexHtml.replace(/src="\/assets\//g, 'src="./assets/');
// Substituir outros caminhos absolutos
indexHtml = indexHtml.replace(/href="\/favicon/g, 'href="./favicon');

fs.writeFileSync(indexPath, indexHtml);
console.log('✓ Caminhos do index.html corrigidos para extensão');

console.log('\n✅ Build da extensão preparado com sucesso!');
console.log('\n📂 Para instalar a extensão:');
console.log('   1. Abra chrome://extensions/ (ou edge://extensions/)');
console.log('   2. Ative o "Modo do desenvolvedor"');
console.log('   3. Clique em "Carregar sem compactação"');
console.log('   4. Selecione a pasta: dist/\n');
