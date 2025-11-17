// Utilitário para comunicação com o background script do Chrome

declare const chrome: any;

// Verificar se está rodando como extensão
export const isExtension = () => {
  return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
};

// Iniciar timer no background
export const startBackgroundTimer = (timerData: any) => {
  if (!isExtension()) return;

  chrome.runtime.sendMessage({
    type: 'START_TIMER',
    data: timerData
  });
};

// Parar timer no background
export const stopBackgroundTimer = () => {
  if (!isExtension()) return;

  chrome.runtime.sendMessage({
    type: 'STOP_TIMER'
  });
};

// Obter estado do timer do background
export const getBackgroundTimerState = (): Promise<any> => {
  if (!isExtension()) return Promise.resolve(null);

  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'GET_TIMER_STATE' },
      (response: any) => {
        resolve(response?.state || null);
      }
    );
  });
};

// Sincronizar estado do timer com o background
export const syncWithBackgroundTimer = async (): Promise<any> => {
  if (!isExtension()) return null;

  const state = await getBackgroundTimerState();
  return state;
};

// Listener para mudanças no storage do background
export const onBackgroundTimerChange = (callback: (state: any) => void) => {
  if (!isExtension()) return () => {};

  const listener = (changes: any, area: string) => {
    if (area === 'local' && changes.timerState) {
      callback(changes.timerState.newValue);
    }
  };

  chrome.storage.onChanged.addListener(listener);

  // Retorna função para remover o listener
  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
};
