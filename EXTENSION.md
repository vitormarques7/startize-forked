# 🚀 Startize Pomodoro - Extensão de Navegador

Timer Pomodoro inteligente focado em microtarefas para aumentar sua produtividade, agora como extensão de navegador!

## 📦 Instalação

### Opção 1: Instalar a Extensão (Recomendado)

1. **Faça o build da extensão:**
   ```bash
   npm install
   npm run build:extension
   ```

2. **Carregue a extensão no navegador:**

   #### Chrome / Edge / Brave:
   - Abra `chrome://extensions/` (ou `edge://extensions/`, `brave://extensions/`)
   - Ative o **"Modo do desenvolvedor"** (toggle no canto superior direito)
   - Clique em **"Carregar sem compactação"**
   - Selecione a pasta `dist/` do projeto
   - ✅ A extensão está instalada!

   #### Firefox:
   - Abra `about:debugging#/runtime/this-firefox`
   - Clique em **"Carregar extensão temporária"**
   - Selecione o arquivo `manifest.json` dentro da pasta `dist/`
   - ✅ A extensão está instalada!

3. **Acesse a extensão:**
   - Clique no ícone da extensão (foguete verde 🚀) na barra de ferramentas
   - Ou use o atalho (se configurado)

### Opção 2: Desenvolvimento Local

Para desenvolver e testar mudanças em tempo real:

```bash
npm install
npm run dev
```

Acesse: `http://localhost:8080`

## 🎨 Recursos

### ✅ Modo Escuro
- Novo tema escuro disponível nas configurações
- Alterna facilmente entre claro e escuro
- Gradientes suaves e cores otimizadas

### ⏱️ Sistema Pomodoro Completo
- **Pré-foco**: 5 minutos de aquecimento (opcional)
- **Foco**: 25 minutos de trabalho concentrado (personalizável)
- **Pausas curtas**: 5 minutos (personalizável)
- **Pausas longas**: 15 minutos após 4 Pomodoros (personalizável)

### 🎵 Sons de Fundo
- Ruído Branco
- Chuva
- Oceano
- Água
- YouTube (URL personalizada)

### 🎯 Microtarefas
- Sistema de pré-foco para começar com tarefas menores
- Aquecimento de 5 minutos antes do Pomodoro principal
- Foco em microetapas gerenciáveis

### 🏆 Sistema de XP e Níveis
- Ganhe XP ao completar Pomodoros
- Sistema de níveis para acompanhar seu progresso
- Barra de progresso visual

### ⚙️ Configurações Avançadas
- **3 Predefinições salváveis**: Salve suas configurações favoritas
- **Automação completa**: Configure início automático de pausas e focos
- **Personalização total**: Ajuste todos os tempos e comportamentos
- **Sons de notificação**: Alertas ao completar cada fase

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                    # Inicia servidor de desenvolvimento

# Build
npm run build                  # Build para produção (web)
npm run build:extension        # Build otimizado para extensão

# Utilidades
npm run generate-icons         # Gera ícones PNG a partir do SVG
npm run lint                   # Verifica código com ESLint
```

## 📁 Estrutura do Projeto

```
startize/
├── dist/                      # Build da extensão (após npm run build:extension)
│   ├── manifest.json          # Manifesto da extensão
│   ├── icon-*.png            # Ícones em múltiplos tamanhos
│   ├── audio/                # Sons de fundo
│   └── ...                   # Arquivos compilados
├── public/
│   ├── manifest.json          # Manifesto fonte
│   ├── favicon.svg           # Ícone SVG original
│   └── audio/                # Sons de fundo
├── src/
│   ├── pages/                # Páginas da aplicação
│   ├── components/           # Componentes React
│   └── hooks/                # Custom hooks (incluindo useTheme)
└── scripts/
    └── post-build-extension.cjs  # Script de pós-build
```

## 🔧 Permissões da Extensão

A extensão solicita as seguintes permissões:

- **storage**: Para salvar configurações e histórico localmente
- **notifications**: Para alertas de conclusão de Pomodoro
- **host_permissions (YouTube)**: Para integração com vídeos do YouTube como som de fundo

## 🎯 Roadmap / Melhorias Futuras

Sugestões de recursos para adicionar:

1. **Notificações do navegador** quando não está com a extensão aberta
2. **Histórico de Pomodoros** com gráficos e estatísticas
3. **Sincronização na nuvem** via Chrome Storage Sync
4. **Atalhos de teclado** personalizáveis
5. **Integração com ferramentas** (Notion, Todoist, etc)
6. **Modo compacto** para manter visível durante o trabalho
7. **Sons de notificação personalizados**
8. **Export de dados** em CSV/JSON
9. **Temas personalizados** além de claro/escuro
10. **Background service worker** para continuar timer mesmo fechando popup

## 🐛 Problemas Conhecidos

Nenhum problema conhecido no momento. Reporte bugs em: [GitHub Issues](seu-repo-aqui)

## 📝 Notas de Desenvolvimento

### Modo Escuro
O tema escuro foi implementado usando:
- CSS Variables com classe `.dark` no `documentElement`
- Hook `useTheme()` para gerenciar estado e persistência
- Gradientes otimizados para modo escuro em `index.css`

### Build para Extensão
O build da extensão é otimizado para:
- Remover hash dos nomes de arquivo (necessário para manifesto)
- Copiar automaticamente manifest, ícones e assets
- Estrutura pronta para carregar no navegador

## 📄 Licença

Este projeto é privado. Todos os direitos reservados.

---

**Desenvolvido com ❤️ usando React + TypeScript + Vite + shadcn/ui**
