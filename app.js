import { schemas, normalize, fieldError } from './form-model.js';
import { createDictation } from './speech-input.js';
const app = document.querySelector('#app');
const labels = ['Sobre você', 'Onde você mora', 'Seu momento', 'Seu negócio', 'Seus objetivos', 'Seu compromisso', 'Revisão'];
const titles = ['O começo é<br>com <em>você.</em>', 'De onde vem<br>sua <em>história?</em>', 'Seu momento.<br>Seu <em>potencial.</em>', 'Uma ideia.<br>Muitas <em>possibilidades.</em>', 'O que você quer<br><em>construir?</em>', 'Vamos dar o<br>próximo <em>passo.</em>', 'Sua jornada,<br>por <em>inteiro.</em>'];
const descriptions = ['Vamos começar pelos seus dados de contato.', 'Queremos saber de onde você vai participar.', 'Sua experiência ajuda a conhecer seu ponto de partida.', 'Conte sobre seu projeto ou a ideia que você quer tirar do papel.', 'Aqui, sua experiência encontra novos caminhos.', 'Conte sobre sua disponibilidade e o apoio que precisa.', 'Confira suas respostas. Você pode editar qualquer etapa.'];
const values = {};
const textFields = schemas.flat().filter(f => !f.options);
const files = Object.fromEntries(textFields.map(f => [f.key, []]));
let step = -1;
let transitioning = false;
let sound = false;
let audioContext;
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const announce = text => { document.querySelector('#announcement').textContent = text; };

function tone() {
  if (!sound) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume().catch(() => {});
    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();
    oscillator.connect(volume); volume.connect(audioContext.destination);
    oscillator.frequency.setValueAtTime(520, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(780, audioContext.currentTime + .13);
    volume.gain.setValueAtTime(.025, audioContext.currentTime);
    volume.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .25);
    oscillator.start(); oscillator.stop(audioContext.currentTime + .26);
  } catch { announce('Seu navegador não oferece suporte ao som de navegação.'); }
}

document.querySelector('#sound').addEventListener('click', event => {
  sound = !sound;
  event.currentTarget.setAttribute('aria-pressed', sound);
  event.currentTarget.querySelector('span').textContent = sound ? 'ligado' : 'desligado';
  tone();
});
const privacy = document.querySelector('#privacy-dialog');
document.querySelector('#privacy').onclick = () => privacy.showModal();
privacy.querySelector('.dialog-close').onclick = () => privacy.close();
document.querySelector('#privacy-ok').onclick = () => privacy.close();

function hero() {
  app.innerHTML = `<section class="hero reveal"><div><p class="eyebrow">ESCOLA JOVENS DE NEGÓCIOS</p><h1>Seu negócio.<br>Sua próxima<br><em>conquista.</em></h1><p class="hero-copy">EJN Business School. Para quem quer começar a empreender ou fazer seu negócio crescer. Conhecimento, prática e conexões para construir o próximo passo.</p><button class="button" id="begin">Começar minha jornada <span aria-hidden="true"><svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg></span></button><div class="small-note"><span>◷ No seu ritmo</span><span>7 etapas · no seu ritmo</span></div></div><div class="art" aria-hidden="true"><div class="orbit"></div><div class="orbit"></div><div class="orbit"></div><span class="art-label top">PESSOAS QUE TRANSFORMAM</span><div class="orb"><img class="hero-emblem" src="./assets/emblema-ejn.png" alt="" width="512" height="512" decoding="async" fetchpriority="high"></div><span class="art-label bottom">IDEIAS QUE MOVEM O FUTURO</span><span class="art-caption">SEU POTENCIAL, EM MOVIMENTO.</span></div></section><div class="hero-bottom"><span class="line"></span><strong>Juntos, podemos criar o impossível.</strong><span><a href="https://escolajovensdenegocios.com/formacoes/" target="_blank" rel="noopener">Conheça também a formação para jovens ↗</a></span></div>`;
  document.querySelector('#begin').onclick = () => navigate(0);
}

function visibleFields(index = step) {
  return (schemas[index] || []).filter(f => !f.when || f.when(values));
}
function requirement(f) {
  return f.optional ? '<span class="optional">(opcional)</span>' : '<span class="required-marker" aria-label="obrigatório">*</span>';
}
function schemaField(f) {
  const label = `${escape(f.label)} ${requirement(f)}`;
  if (f.type === 'multi') return `<fieldset class="field wide"><legend>${label}</legend><p class="field-help">${escape(f.placeholder)}</p><div class="choices">${f.options.map(v => `<label class="check-option"><input type="checkbox" name="${f.key}" value="${escape(v)}" ${(values[f.key] || []).includes(v) ? 'checked' : ''}>${escape(v)}</label>`).join('')}</div><p class="error" id="${f.key}-error"></p></fieldset>`;
  const required = f.optional ? '' : 'required';
  const described = `aria-describedby="${f.key}-error ${f.key}-status"`;
  if (f.options) return `<div class="field"><label for="${f.key}">${label}</label><select id="${f.key}" name="${f.key}" ${required} aria-describedby="${f.key}-error"><option value="">${escape(f.placeholder)}</option>${f.options.map(o => `<option ${values[f.key] === o ? 'selected' : ''}>${escape(o)}</option>`).join('')}</select><p class="error" id="${f.key}-error"></p></div>`;
  const multiline = f.type === 'textarea' || f.type === 'composer';
  const control = multiline
    ? `<textarea id="${f.key}" name="${f.key}" maxlength="2000" placeholder="${escape(f.placeholder)}" ${required} ${described}>${escape(values[f.key])}</textarea>`
    : `<input id="${f.key}" name="${f.key}" type="${f.type || 'text'}" value="${escape(values[f.key])}" placeholder="${escape(f.placeholder)}" maxlength="${f.max || 120}" ${f.attrs || ''} ${required} ${described}>`;
  return `<div class="field ${multiline ? 'wide' : ''}"><label for="${f.key}">${label}</label><div class="composer">${control}<div class="composer-tools"><div><button type="button" class="tool-button" data-dictate="${f.key}" aria-controls="${f.key}" aria-pressed="false" aria-label="Ditar ${escape(f.label)}">◉ Ditar texto</button><button type="button" class="tool-button" data-attach="${f.key}" aria-label="Anexar a ${escape(f.label)}">＋ Anexar</button><input class="hidden" type="file" id="${f.key}-upload" multiple accept="image/jpeg,image/png,image/webp,application/pdf,audio/mpeg,audio/wav,audio/webm,audio/ogg,audio/mp4"></div>${multiline ? `<span class="char-count" id="${f.key}-count">${(values[f.key] || '').length}/2000</span>` : ''}</div></div><p class="speech-status field-help" id="${f.key}-status" role="status"></p><div class="attachments" id="${f.key}-files"></div><p class="error" id="${f.key}-error" role="status"></p></div>`;
}
function fields() { return visibleFields().map(schemaField).join(''); }
function bindInputs() {
  app.querySelectorAll('input[name],textarea[name],select[name]').forEach(el => {
    const f = visibleFields().find(f => f.key === el.name);
    if (!f) return;
    el.addEventListener('input', () => {
      if (f.digits) {
        const before = el.value, position = el.selectionStart;
        el.value = normalize(f.key, before);
        if (position !== null && el.type !== 'date') {
          const digitsBefore = before.slice(0, position).replace(/\D/g, '').length;
          let cursor = 0, count = 0;
          while (cursor < el.value.length && count < digitsBefore) if (/\d/.test(el.value[cursor++])) count++;
          el.setSelectionRange(cursor, cursor);
        }
      }
      if (el.getAttribute('aria-invalid') === 'true') {
        const message = fieldError(f, el.value);
        document.getElementById(`${f.key}-error`).textContent = message;
        el.setAttribute('aria-invalid', String(Boolean(message)));
      }
    });
    el.addEventListener('blur', () => {
      if (el.value || el.getAttribute('aria-invalid') === 'true') {
        const message = fieldError(f, el.value);
        document.getElementById(`${f.key}-error`).textContent = message;
        el.setAttribute('aria-invalid', String(Boolean(message)));
      }
    });
    if (f.key === 'hasBusiness') el.addEventListener('change', () => {
      if (dictation.active) return;
      collect(); render(); document.getElementById('hasBusiness')?.focus();
    });
  });
}

function render() {
  if (step === -1) return hero();
  app.innerHTML = `<section class="step-layout"><aside class="sidebar reveal"><div class="step-count">SUA JORNADA / 0${step + 1}</div><h2 tabindex="-1" id="step-title">${titles[step]}</h2><p>${descriptions[step]}</p><ol class="steps">${labels.map((label, i) => `<li class="${i === step ? 'active' : i < step ? 'done' : ''}" ${i === step ? 'aria-current="step"' : ''}>${label}</li>`).join('')}</ol></aside><div class="form-area reveal"><div class="form-top"><span>${step === 6 ? 'QUASE LÁ. ESSE É O SEU RETRATO.' : 'PRAZER EM CONHECER SUA HISTÓRIA.'}</span><span>0${step + 1} / 07</span></div><div class="progress" role="progressbar" aria-label="Etapas da jornada" aria-valuemin="0" aria-valuemax="7" aria-valuenow="${step + 1}"><div style="width:${(step + 1) / 7 * 100}%"></div></div><form novalidate>${step < 6 ? `<p class="input-help field-help">Digite ou use o ditado para ver sua fala virar texto. Revise antes de continuar. O ditado depende do navegador e pode usar seu serviço de reconhecimento online.</p><p class="input-help field-help">Anexos opcionais: até 3 por campo, com 10 MB cada. Imagens, PDF e áudio. Anexos não substituem respostas obrigatórias.</p>` : ''}<div class="${step === 6 ? '' : 'fields'}">${step === 6 ? review() : fields()}</div><div class="form-actions"><button class="back" type="button" id="back"><svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 12H4m7-7-7 7 7 7"/></svg> ${step === 0 ? 'Início' : 'Voltar'}</button><button class="button" type="submit">${step === 6 ? 'Preparar minha cópia' : 'Continuar'} <span aria-hidden="true"><svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg></span></button></div><p class="reassurance">${step === 6 ? 'Protótipo: nenhuma inscrição será enviada.' : 'Suas respostas ficam nesta aba. Campos com * são obrigatórios.'}</p></form></div></section>`;
  bindInputs();
  document.querySelector('#back').onclick = () => navigate(step - 1);
  app.querySelector('form').onsubmit = event => {
    event.preventDefault();
    if (dictation.active) { announce('Encerre o ditado antes de continuar.'); return; }
    collect();
    if (!validate()) return;
    tone();
    if (step === 6) finish(); else navigate(step + 1);
  };
  app.querySelectorAll('[data-edit]').forEach(button => button.onclick = () => navigate(Number(button.dataset.edit)));
  for (const { key } of textFields) {
    if (!document.getElementById(`${key}-files`)) continue;
    renderFiles(key);
    if (!document.getElementById(key)) continue;
    document.querySelector(`[data-attach="${key}"]`).onclick = () => document.getElementById(`${key}-upload`).click();
    document.getElementById(`${key}-upload`).onchange = event => {
      const errors = [];
      for (const file of event.target.files) {
        if (files[key].length >= 3) { errors.push('Limite de 3 anexos por resposta.'); break; }
        if (file.size > 10 * 1024 * 1024) { errors.push(`${file.name}: o limite é 10 MB.`); continue; }
        if (!/^(image\/(jpeg|png|webp)|application\/pdf|audio\/(mpeg|wav|x-wav|webm|ogg|mp4))$/.test(file.type)) { errors.push(`${file.name}: formato não suportado.`); continue; }
        files[key].push({file, url: URL.createObjectURL(file)});
      }
      event.target.value = '';
      document.getElementById(`${key}-error`).textContent = errors.join(' ');
      renderFiles(key);
    };
    document.querySelector(`[data-dictate="${key}"]`).onclick = () => {
      const input = document.getElementById(key);
      document.getElementById(`${key}-status`).textContent = '';
      delete document.getElementById(`${key}-status`).dataset.error;
      if (dictation.active) dictation.stop();
      else dictation.start(textFields.find(f => f.key === key), input);
    };
    document.getElementById(key).oninput = event => {
      const count = document.getElementById(`${key}-count`);
      if (count) count.textContent = `${event.target.value.length}/2000`;
    };
  }
}

function collect() {
  app.querySelectorAll('input[name]:not([type=checkbox]), textarea[name], select[name]').forEach(el => { values[el.name] = el.value.trim(); });
  visibleFields().filter(f => f.type === 'multi').forEach(f => {
    values[f.key] = [...app.querySelectorAll(`input[name="${f.key}"]:checked`)].map(el => el.value);
  });
  const hidden = textFields.filter(f => f.when && !f.when(values));
  for (const { key } of hidden) {
    delete values[key];
    files[key].forEach(item => URL.revokeObjectURL(item.url));
    files[key].length = 0;
  }
  if (values.hasBusiness === 'Não') delete values.sales;
}

function error(key, message) {
  document.getElementById(`${key}-error`).textContent = message;
  const input = document.getElementById(key);
  if (input) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', `${key}-error${files[key] ? ` ${key}-status` : ''}`); }
}
function validate() {
  let valid = true;
  app.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
  app.querySelectorAll('.error').forEach(el => { el.textContent = ''; });
  visibleFields().forEach(f => {
    let message = fieldError(f, values[f.key]);
    if (message) { error(f.key, message); valid = false; }
  });
  if (step === 6 && !document.querySelector('#confirm').checked) { document.querySelector('#confirm-error').textContent = 'Confirme a revisão para preparar sua cópia.'; valid = false; }
  if (!valid) { (app.querySelector('[aria-invalid=true]') || app.querySelector('.error:not(:empty)')?.closest('fieldset')?.querySelector('input') || document.querySelector('#confirm'))?.focus(); announce('Confira os campos destacados antes de continuar.'); }
  return valid;
}

function renderFiles(key) {
  const container = document.getElementById(`${key}-files`);
  container.innerHTML = files[key].map((item, i) => `<div class="file-row"><span>${escape(item.file.name)} <span class="optional">· ${(item.file.size / 1024).toFixed(0)} KB</span></span>${item.file.type.startsWith('audio/') ? `<audio controls preload="metadata" src="${item.url}" aria-label="Ouvir ${escape(item.file.name)}"></audio>` : ''}<div class="file-actions"><a href="${item.url}" download="${escape(item.file.name)}" aria-label="Baixar ${escape(item.file.name)}"><svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3v17m-7-7 7 7 7-7"/></svg></a><button type="button" data-remove="${i}" aria-label="Remover ${escape(item.file.name)}">×</button></div></div>`).join('');
  container.querySelectorAll('[data-remove]').forEach(button => button.onclick = () => {
    const [item] = files[key].splice(Number(button.dataset.remove), 1);
    URL.revokeObjectURL(item.url); renderFiles(key); announce('Anexo removido.');
  });
}

const dictation = createDictation({
  onState(key, active, status = '') {
    app.querySelectorAll('.form-actions button, select, [data-attach], [data-edit]').forEach(button => { button.disabled = active; });
    app.querySelectorAll('[data-dictate]').forEach(button => {
      const current = button.dataset.dictate === key;
      button.disabled = active && !current;
      button.setAttribute('aria-pressed', String(active && current));
      button.classList.toggle('recording', active && current);
      if (current) {
        button.textContent = active ? '■ Encerrar ditado' : '◉ Ditar texto';
        button.setAttribute('aria-label', `${active ? 'Encerrar ditado de' : 'Ditar'} ${textFields.find(f => f.key === key).label}`);
      }
    });
    const message = document.getElementById(`${key}-status`);
    if (message && (active || !message.dataset.error)) message.textContent = status || 'Ditado encerrado. Revise o texto; você pode corrigi-lo antes de continuar.';
    announce(active ? status : 'Ditado encerrado. Revise o texto transcrito.');
  },
  onError(key, message) {
    const status = document.getElementById(`${key}-status`);
    if (status) { status.textContent = message; status.dataset.error = 'true'; }
    announce(message);
  }
});
async function navigate(next) {
  if (dictation.active) return;
  if (transitioning) return;
  transitioning = true;
  collect();
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    await app.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-12px)'}],{duration:160,easing:'ease-in',fill:'forwards'}).finished;
  }
  step = next; tone(); app.getAnimations().forEach(a => a.cancel()); render(); transitioning = false;
  window.scrollTo({top: 0, behavior: 'instant'});
  document.querySelector('#step-title')?.focus({preventScroll:true});
  announce(step >= 0 ? `Etapa ${step + 1} de 7: ${labels[step]}` : 'Início da jornada.');
}

function review() {
  return schemas.map((_, i) => `<section class="review-section"><div class="review-heading"><h3>0${i + 1} · ${labels[i]}</h3><button type="button" data-edit="${i}">Editar ↗</button></div><dl>${visibleFields(i).map(f => `<div><dt>${escape(f.label)}</dt><dd>${escape((Array.isArray(values[f.key]) ? values[f.key].join(', ') : values[f.key]) || 'Não informado')}${files[f.key] ? `<div class="attachments" id="${f.key}-files" style="margin-top:10px"></div>` : ''}</dd></div>`).join('')}</dl></section>`).join('') + `<div class="notice">Esta experiência é uma demonstração. O envio para a equipe EJN ainda não está conectado. Você pode baixar suas respostas e cada anexo para guardar uma cópia.</div><div class="check-row"><input id="confirm" type="checkbox"><label for="confirm">Revisei minhas respostas e entendo que esta cópia não realiza uma inscrição.</label></div><p class="error" id="confirm-error" role="status"></p>`;
}

function downloadJSON() {
  const data = {status:'prototipo_nao_enviado', programa:'EJN Business School', geradoEm: new Date().toISOString(), respostas: values, anexos: Object.fromEntries(Object.entries(files).map(([key, items]) => [key, items.map(({file}) => ({nome:file.name, tipo:file.type, bytes:file.size}))]))};
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {type:'application/json'}));
  const a = document.createElement('a'); a.href = url; a.download = 'minha-jornada-ejn.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function finish() {
  app.innerHTML = `<section class="success reveal"><div class="success-icon" aria-hidden="true"><svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg></div><p class="eyebrow">UM NOVO CAPÍTULO, UMA NOVA POSSIBILIDADE</p><h2>Sua história já está<br>em <em>movimento.</em></h2><p>${escape(values.name.split(' ')[0])}, suas respostas estão prontas para você guardar.<br>Esta demonstração não enviou uma inscrição para a EJN.</p><div class="notice">Baixe o arquivo de respostas e os anexos separadamente. O JSON contém os nomes dos anexos, mas não inclui os arquivos. Seus dados serão descartados ao fechar esta aba.</div><div class="success-actions"><button class="button" id="download">Baixar minhas respostas <span><svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3v17m-7-7 7 7 7-7"/></svg></span></button></div><div class="attachments" id="all-files" style="margin-top:25px">${Object.values(files).flat().map(item => `<div class="file-row"><span>${escape(item.file.name)}</span><a href="${item.url}" download="${escape(item.file.name)}">Baixar <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3v17m-7-7 7 7 7-7"/></svg></a></div>`).join('')}</div><button class="back" id="return"><svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 12H4m7-7-7 7 7 7"/></svg> Voltar à revisão</button><button class="text-button" id="clear">Apagar meus dados e recomeçar</button></section>`;
  document.querySelector('#download').onclick = downloadJSON;
  document.querySelector('#return').onclick = () => { step = 6; render(); };
  document.querySelector('#clear').onclick = () => {
    Object.keys(values).forEach(key => delete values[key]);
    Object.values(files).forEach(items => { items.forEach(item => URL.revokeObjectURL(item.url)); items.length = 0; });
    step = -1; render(); announce('Seus dados foram apagados.');
  };
  app.querySelector('h2').setAttribute('tabindex', '-1'); app.querySelector('h2').focus();
  window.scrollTo({top:0, behavior:'instant'});
}
window.addEventListener('beforeunload', () => {
  dictation.stop();
  Object.values(files).flat().forEach(item => URL.revokeObjectURL(item.url));
});
hero();

const motion = matchMedia('(prefers-reduced-motion: reduce)');
let moveFrame;
app.addEventListener('pointermove', event => {
  if (motion.matches || event.pointerType !== 'mouse' || step !== -1) return;
  if (moveFrame) return;
  moveFrame = requestAnimationFrame(() => {
    const art = app.querySelector('.art');
    if (art) {
      const rect = art.getBoundingClientRect();
      art.style.setProperty('--mx', `${Math.max(-12, Math.min(12, (event.clientX - rect.left - rect.width / 2) / 30))}px`);
      art.style.setProperty('--my', `${Math.max(-10, Math.min(10, (event.clientY - rect.top - rect.height / 2) / 30))}px`);
    }
    moveFrame = null;
  });
});
app.addEventListener('pointerleave', () => {
  app.querySelector('.art')?.style.setProperty('--mx', '0px');
  app.querySelector('.art')?.style.setProperty('--my', '0px');
});
