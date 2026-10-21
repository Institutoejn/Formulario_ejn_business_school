import { normalize } from './form-model.js';
// O serviço de reconhecimento é fornecido pelo navegador. Não produz arquivos de áudio.
export function createDictation({ onState, onError }) {
  let session = null;
  function finish(current) {
    if (session !== current) return;
    clearTimeout(current.timer);
    clearTimeout(current.stopTimer);
    current.input.readOnly = current.wasReadOnly;
    session = null;
    onState(current.key, false);
  }
  function stop() {
    const current = session;
    if (!current) return;
    try {
      current.recognition.stop();
      if (session !== current) return;
      // Alguns navegadores não disparam onend após uma interrupção do serviço.
      current.stopTimer = setTimeout(() => {
        finish(current);
        try { current.recognition.abort(); } catch { /* Já encerrado. */ }
      }, 2000);
    } catch { finish(current); }
  }
  function start(field, input) {
    if (session) { stop(); return; }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition || !window.isSecureContext) {
      onError(field.key, 'O ditado não está disponível neste navegador. Use um navegador compatível em HTTPS ou digite sua resposta.');
      return;
    }
    let recognition;
    try { recognition = new Recognition(); }
    catch { onError(field.key, 'Não foi possível iniciar o ditado. Você pode digitar sua resposta.'); return; }
    const selectionStart = input.selectionStart ?? input.value.length;
    const selectionEnd = input.selectionEnd ?? input.value.length;
    const current = {
      key: field.key, input, recognition, wasReadOnly: input.readOnly,
      prefix: input.value.slice(0, selectionStart), suffix: input.value.slice(selectionEnd)
    };
    session = current;
    input.readOnly = true;
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    onState(field.key, true, 'Aguardando microfone…');
    recognition.onstart = () => {
      if (session === current) onState(field.key, true, 'Ouvindo… fale sua resposta.');
    };
    recognition.onresult = event => {
      if (session !== current) return;
      // A lista inclui resultados anteriores e hipóteses revisadas. Reconstruir
      // o trecho ditado evita duplicar palavras a cada resultado intermediário.
      let spoken = Array.from(event.results, result => result[0].transcript.trim()).filter(Boolean).join(' ');
      if (field.key === 'name') spoken = spoken.replace(/[.,;:!?]+$/, '');
      if (field.key === 'email') spoken = spoken.toLowerCase().replace(/\barroba\b/g, '@').replace(/\bponto\b/g, '.').replace(/\s/g, '').replace(/[.,;!?]+$/, '');
      if (field.key === 'businessUrl') spoken = spoken.replace(/\barroba\b/gi, '@').replace(/\bponto\b/gi, '.').replace(/\s/g, '');
      const join = (left, right) => left && right && !/\s$/.test(left) && !/^\s/.test(right) ? `${left} ${right}` : left + right;
      const compact = field.digits || field.key === 'email' || field.key === 'businessUrl';
      const combined = compact ? current.prefix + spoken + current.suffix : join(join(current.prefix, spoken), current.suffix);
      const candidate = field.digits ? normalize(field.key, combined) : combined;
      const max = field.type === 'textarea' || field.type === 'composer' ? 2000 : field.max || 120;
      input.value = candidate.slice(0, max);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      if (candidate.length > max) {
        onError(field.key, `O campo atingiu o limite de ${max} caracteres. Revise o texto antes de continuar.`);
        stop();
      }
    };
    recognition.onerror = event => {
      if (session !== current) return;
      const messages = {
        'not-allowed': 'Acesso ao microfone não autorizado. Libere a permissão no navegador ou digite sua resposta.',
        'service-not-allowed': 'O serviço de transcrição não está autorizado neste navegador. Você pode digitar sua resposta.',
        'audio-capture': 'Não foi possível acessar o microfone. Confira o dispositivo ou digite sua resposta.',
        'no-speech': 'Não identificamos fala. Tente ditar novamente ou digite sua resposta.',
        network: 'O serviço de transcrição está sem conexão. Seu texto foi mantido; você pode continuar digitando.',
        'language-not-supported': 'O serviço não oferece transcrição em português neste navegador. Você pode digitar sua resposta.'
      };
      if (event.error !== 'aborted') onError(field.key, messages[event.error] || 'O ditado foi interrompido. Seu texto foi mantido; você pode continuar digitando.');
      finish(current);
      try { recognition.abort(); } catch { /* Já encerrado. */ }
    };
    recognition.onend = () => finish(current);
    current.timer = setTimeout(stop, 120000);
    try { recognition.start(); }
    catch {
      finish(current);
      onError(field.key, 'Não foi possível iniciar o ditado. Confira o microfone ou digite sua resposta.');
    }
  }
  return { start, stop, get active() { return Boolean(session); } };
}
