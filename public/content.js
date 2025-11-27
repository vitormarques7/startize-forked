// Content Script - Widget Flutuante (Vanilla JS + Shadow DOM)
(function() {
  'use strict';

  console.log('🎯 Startize Widget: Inicializando...');

  // Evitar duplicatas
  if (document.getElementById('startize-widget-root')) {
    console.log('⚠️ Widget já existe, pulando inicialização');
    return;
  }

  // 1. Criar container host
  const hostElement = document.createElement('div');
  hostElement.id = 'startize-widget-root';
  document.body.appendChild(hostElement);

  // 2. Criar Shadow DOM para isolamento
  const shadowRoot = hostElement.attachShadow({ mode: 'open' });

  // 3. Criar estrutura do widget
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'widget-container';
  widgetContainer.style.display = 'none'; // Começa oculto

  widgetContainer.innerHTML = `
    <div class="timer-pill">
      <span class="phase-emoji" id="phase-emoji">🎯</span>
      <div class="timer-info">
        <span class="phase-text" id="phase-text">Foco</span>
        <span class="timer-text" id="timer-text">25:00</span>
      </div>
      <button class="close-btn" id="close-btn" title="Fechar widget">×</button>
    </div>
  `;

  // 4. Injetar CSS no Shadow DOM
  const style = document.createElement('style');
  style.textContent = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    #widget-container {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 2147483647;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .timer-pill {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(12px) saturate(180%);
      border-radius: 9999px;
      padding: 10px 16px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(0, 0, 0, 0.06);
      cursor: default;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .timer-pill:hover {
      box-shadow: 0 6px 32px rgba(0, 0, 0, 0.16), 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    .phase-emoji {
      font-size: 18px;
      line-height: 1;
    }

    .timer-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
    }

    .phase-text {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: rgba(0, 0, 0, 0.5);
    }

    .timer-text {
      font-size: 16px;
      font-weight: 900;
      letter-spacing: -0.3px;
      color: rgba(0, 0, 0, 0.9);
      font-variant-numeric: tabular-nums;
    }

    .close-btn {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.05);
      border: none;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      color: rgba(0, 0, 0, 0.4);
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      background: rgba(0, 0, 0, 0.1);
      color: rgba(0, 0, 0, 0.7);
    }

    .timer-pill.urgent {
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.85;
        transform: scale(1.02);
      }
    }

    /* Dark mode */
    @media (prefers-color-scheme: dark) {
      .timer-pill {
        background: rgba(30, 30, 30, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4), 0 1px 4px rgba(0, 0, 0, 0.3);
      }

      .timer-pill:hover {
        box-shadow: 0 6px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.4);
      }

      .phase-text {
        color: rgba(255, 255, 255, 0.5);
      }

      .timer-text {
        color: rgba(255, 255, 255, 0.95);
      }

      .close-btn {
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.4);
      }

      .close-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.7);
      }
    }
  `;

  shadowRoot.appendChild(style);
  shadowRoot.appendChild(widgetContainer);

  // 5. Referências aos elementos
  const pill = shadowRoot.querySelector('.timer-pill');
  const emojiEl = shadowRoot.getElementById('phase-emoji');
  const phaseEl = shadowRoot.getElementById('phase-text');
  const timerEl = shadowRoot.getElementById('timer-text');
  const closeBtn = shadowRoot.getElementById('close-btn');

  // 6. Mapeamentos de fases
  const phaseEmojis = {
    preFocus: '⚡',
    focus: '🎯',
    miniBreak: '☕',
    shortBreak: '🌿',
    longBreak: '🌟'
  };

  const phaseNames = {
    preFocus: 'Pré-foco',
    focus: 'Foco',
    miniBreak: 'Mini Pausa',
    shortBreak: 'Pausa Curta',
    longBreak: 'Pausa Longa'
  };

  // 7. Atualizar UI
  function updateWidget(state) {
    if (!state || !state.isRunning) {
      widgetContainer.style.display = 'none';
      console.log('⏸️ Widget ocultado (timer parado)');
      return;
    }

    widgetContainer.style.display = 'block';

    // Atualizar tempo
    const minutes = Math.floor(state.timeLeft / 60);
    const seconds = state.timeLeft % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    timerEl.textContent = timeString;

    // Atualizar fase
    const emoji = phaseEmojis[state.currentPhase] || '⏱️';
    const phaseName = phaseNames[state.currentPhase] || 'Timer';

    emojiEl.textContent = emoji;
    phaseEl.textContent = phaseName;

    // Animação de urgência (< 1 minuto)
    if (state.timeLeft < 60 && state.timeLeft > 0) {
      pill.classList.add('urgent');
    } else {
      pill.classList.remove('urgent');
    }

    console.log(`⏱️ Widget atualizado: ${phaseName} ${timeString}`);
  }

  // 8. Event listener - Fechar widget
  closeBtn.addEventListener('click', () => {
    widgetContainer.style.display = 'none';
    console.log('✖️ Widget fechado pelo usuário');
  });

  // 9. Sincronização com chrome.storage
  if (typeof chrome !== 'undefined' && chrome.storage) {
    // Carregar estado inicial
    chrome.storage.local.get(['timerState'], (result) => {
      if (result.timerState) {
        console.log('📥 Estado inicial carregado:', result.timerState);
        updateWidget(result.timerState);
      }
    });

    // Listener para mudanças
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.timerState) {
        const newState = changes.timerState.newValue;
        console.log('🔄 Estado atualizado:', newState);
        updateWidget(newState);
      }
    });

    // Update a cada segundo para recalcular tempo
    setInterval(() => {
      chrome.storage.local.get(['timerState'], (result) => {
        if (result.timerState && result.timerState.isRunning) {
          const now = Date.now();
          const timeLeft = Math.round((result.timerState.targetTime - now) / 1000);

          if (timeLeft > 0) {
            updateWidget({
              ...result.timerState,
              timeLeft: timeLeft
            });
          } else {
            widgetContainer.style.display = 'none';
          }
        }
      });
    }, 1000);

    console.log('✅ Widget inicializado e pronto!');
  } else {
    console.warn('⚠️ Chrome API não disponível');
  }

})();
