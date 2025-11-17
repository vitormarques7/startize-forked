// Service Worker Robust for Chrome Manifest V3

let timerInterval = null;

// Inicializar
chrome.runtime.onInstalled.addListener(() => {
  console.log('Startize Pomodoro instalado e pronto.');
  chrome.storage.local.set({ timerState: { isRunning: false, timeLeft: 0 } });
});

// Gerenciador de Mensagens
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'START_TIMER':
      startTimer(message.data);
      sendResponse({ success: true });
      break;
    case 'STOP_TIMER':
      stopTimer();
      sendResponse({ success: true });
      break;
    case 'GET_TIMER_STATE':
      // Retorna o estado atual calculado em tempo real
      getRealTimeState().then(state => sendResponse({ state }));
      return true; // Resposta assíncrona
  }
  return true;
});

// --- Lógica do Timer (Baseada em Timestamp) ---

function startTimer(timerData) {
  if (timerInterval) clearInterval(timerInterval);

  const now = Date.now();
  // Calcula o momento exato no futuro em que o timer deve acabar
  const targetTime = now + (timerData.timeLeft * 1000);

  const initialState = {
    ...timerData,
    isRunning: true,
    targetTime: targetTime,
    lastUpdated: now
  };

  // Salva no storage para persistência (sobrevive se o Chrome fechar)
  chrome.storage.local.set({ timerState: initialState });

  // Inicia o loop apenas para atualizar a UI (Badge) e verificar o fim
  runTimerLoop();
}

function runTimerLoop() {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(async () => {
    const result = await chrome.storage.local.get(['timerState']);
    const state = result.timerState;

    if (!state || !state.isRunning) {
      stopTimer();
      return;
    }

    const now = Date.now();
    const timeLeft = Math.round((state.targetTime - now) / 1000);

    if (timeLeft <= 0) {
      stopTimer();
      notifyCompletion(state);
      // Atualiza estado final zerado
      chrome.storage.local.set({ 
        timerState: { ...state, isRunning: false, timeLeft: 0 } 
      });
    } else {
      // Atualiza o badge
      updateBadge(timeLeft, state.currentPhase);
    }

  }, 1000);
}

async function getRealTimeState() {
  const result = await chrome.storage.local.get(['timerState']);
  const state = result.timerState;

  if (!state || !state.isRunning) return state;

  // Recalcula tempo restante baseado no relógio do sistema
  const now = Date.now();
  const timeLeft = Math.round((state.targetTime - now) / 1000);

  return {
    ...state,
    timeLeft: timeLeft > 0 ? timeLeft : 0
  };
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  
  chrome.action.setBadgeText({ text: '' });
  
  // Atualiza storage para dizer que parou
  chrome.storage.local.get(['timerState'], (result) => {
    if (result.timerState) {
      chrome.storage.local.set({
        timerState: { ...result.timerState, isRunning: false }
      });
    }
  });
}

// --- UI e Notificações ---

function updateBadge(seconds, phase) {
  // Se > 60s mostra minutos (ex: "25m"), senão mostra segundos (ex: "59s")
  const text = seconds > 60 
    ? `${Math.ceil(seconds / 60)}m` 
    : `${seconds}s`;

  chrome.action.setBadgeText({ text });
  
  // Verde para Foco, Azul para Pausa
  const color = (phase === 'focus' || phase === 'preFocus') ? '#10B981' : '#3B82F6';
  chrome.action.setBadgeBackgroundColor({ color });
}

function notifyCompletion(state) {
  const titles = {
    focus: 'Foco concluído! 🎯',
    shortBreak: 'Pausa curta finalizada! ☕',
    longBreak: 'Pausa longa finalizada! 🔋'
  };

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon-128.png', // Caminho relativo à raiz da extensão
    title: 'Startize Pomodoro',
    message: titles[state.currentPhase] || 'Timer finalizado!',
    priority: 2
  });

  // Toca som (Requer permissão no manifest e arquivo de audio)
  // chrome.offscreen... (implementação avançada de áudio omitida para simplificar)
}