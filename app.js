const app = document.querySelector('#app');
const labels = ['Sobre você', 'Seu momento', 'Seu próximo passo', 'Revisão'];
const titles = ['Toda jornada começa<br>com <em>você.</em>', 'Onde você<br>está <em>hoje?</em>', 'Vamos olhar<br>para <em>frente.</em>', 'Sua história.<br>Do <em>seu jeito.</em>'];
const descriptions = ['Antes de falar de negócios, queremos conhecer quem está por trás das ideias.', 'Cada trajetória é única. Conte um pouco sobre a sua relação com o mundo dos negócios.', 'O que move você? Aqui, suas ideias podem ganhar voz, imagem e novas possibilidades.', 'Reserve um instante para conferir suas respostas. Você pode voltar e ajustar o que quiser.'];
const values = {};
const files = { context: [], goals: [] };
let step = -1;
let recorder = null;
let recordingKey = null;
let recordingTimer;
let pendingMicrophone = false;
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
  app.innerHTML = `<section class="hero reveal"><div><p class="eyebrow">EJN BUSINESS SCHOOL · NOVOS CAMINHOS</p><h1>Seu próximo<br>capítulo<br>começa <em>aqui.</em></h1><p class="hero-copy">Grandes negócios começam com pessoas.<br>E toda transformação começa com uma escolha: a sua.</p><button class="button" id="begin">Começar minha jornada <span aria-hidden="true"><svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg></span></button><div class="small-note"><span>◷ No seu ritmo</span><span>4 etapas para se conectar</span></div></div><div class="art" aria-hidden="true"><div class="orbit"></div><div class="orbit"></div><div class="orbit"></div><span class="art-label top">PESSOAS QUE TRANSFORMAM</span><div class="orb"><span class="orb-arrow"><svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg></span></div><span class="art-label bottom">IDEIAS QUE MOVEM O FUTURO</span><span class="art-caption">SEU POTENCIAL, EM MOVIMENTO.</span></div></section><div class="hero-bottom"><span class="line"></span><strong>Aprender. Conectar. Transformar.</strong><span>Uma conversa sobre quem você quer se tornar.</span></div>`;
  document.querySelector('#begin').onclick = () => navigate(0);
}

function input(key, label, type = 'text', placeholder = '', extra = '') {
  return `<div class="field"><label for="${key}">${label} <span aria-hidden="true">*</span></label><input id="${key}" name="${key}" type="${type}" value="${escape(values[key])}" placeholder="${placeholder}" required ${extra}><p class="error" id="${key}-error"></p></div>`;
}
function select(key, label, options) {
  return `<div class="field"><label for="${key}">${label} *</label><select id="${key}" name="${key}" required><option value="">Selecione uma opção</option>${options.map(o => `<option ${values[key] === o ? 'selected' : ''}>${escape(o)}</option>`).join('')}</select><p class="error" id="${key}-error"></p></div>`;
}
function composer(key, label) {
  return `<div class="field wide"><label for="${key}">${label} *</label><p class="field-help" id="${key}-help">Escreva ou grave um áudio de até 2 minutos. Imagens e arquivos são opcionais.</p><div class="composer"><textarea name="${key}" id="${key}" maxlength="2000" placeholder="Este espaço é seu. Conte com suas palavras…" aria-describedby="${key}-help ${key}-error">${escape(values[key])}</textarea><div class="composer-tools"><div><button type="button" class="tool-button" data-record="${key}">◉ Gravar áudio</button><button type="button" class="tool-button" data-attach="${key}">＋ Anexar</button><input class="hidden" type="file" id="${key}-upload" multiple accept="image/jpeg,image/png,image/webp,application/pdf,audio/mpeg,audio/wav,audio/webm,audio/ogg,audio/mp4"></div><span class="char-count" id="${key}-count">${(values[key] || '').length}/2000</span></div></div><p class="field-help">Até 3 anexos por resposta · JPG, PNG, WebP, PDF ou áudio · 10 MB por arquivo.</p><div class="attachments" id="${key}-files"></div><p class="error" id="${key}-error" role="status"></p></div>`;
}
function fields() {
  if (step === 0) return input('name', 'Como você se chama?', 'text', 'Seu nome completo', 'autocomplete="name" maxlength="120"') + input('email', 'Qual é o seu e-mail?', 'email', 'voce@exemplo.com', 'autocomplete="email" maxlength="254"') + input('phone', 'Seu WhatsApp', 'tel', '(00) 00000-0000', 'autocomplete="tel" maxlength="24" inputmode="tel"') + input('city', 'Em qual cidade e estado você mora?', 'text', 'Cidade / UF', 'autocomplete="address-level2" maxlength="120"');
  if (step === 1) return select('moment', 'Qual opção descreve seu momento?', ['Tenho meu próprio negócio', 'Trabalho em uma empresa', 'Estou começando a empreender', 'Estou em transição de carreira', 'Estou estudando', 'Outro momento']) + input('occupation', 'Qual é sua área de atuação?', 'text', 'Sua profissão ou área de interesse', 'maxlength="150"') + `<div class="field wide"><span class="field-label" id="experience-label">Há quanto tempo você atua nessa área? *</span><div class="choices" role="group" aria-labelledby="experience-label">${['Estou começando', 'Até 2 anos', 'De 3 a 5 anos', 'Mais de 5 anos'].map(v => `<button type="button" class="chip" data-choice="${v}" aria-pressed="${values.experience === v}">${v}</button>`).join('')}</div><p class="error" id="experience-error"></p></div>` + composer('context', 'Qual desafio você está vivendo hoje?');
  return composer('goals', 'O que você deseja transformar com a formação?') + select('interest', 'O que você mais quer desenvolver?', ['Gestão e estratégia', 'Liderança e pessoas', 'Empreendedorismo', 'Finanças e resultados', 'Vendas e comunicação', 'Ainda quero descobrir']) + select('discovery', 'Como conheceu a EJN?', ['Instagram', 'Indicação de alguém', 'Google', 'Evento ou palestra', 'Já conhecia o Instituto', 'Outro canal']);
}

function render() {
  if (step === -1) return hero();
  app.innerHTML = `<section class="step-layout"><aside class="sidebar reveal"><div class="step-count">SUA JORNADA / 0${step + 1}</div><h2 tabindex="-1" id="step-title">${titles[step]}</h2><p>${descriptions[step]}</p><ol class="steps">${labels.map((label, i) => `<li class="${i === step ? 'active' : i < step ? 'done' : ''}" ${i === step ? 'aria-current="step"' : ''}>${label}</li>`).join('')}</ol></aside><div class="form-area reveal"><div class="form-top"><span>${step === 3 ? 'QUASE LÁ. ESSE É O SEU RETRATO.' : 'PRAZER EM CONHECER SUA HISTÓRIA.'}</span><span>0${step + 1} / 04</span></div><div class="progress" role="progressbar" aria-label="Etapas da jornada" aria-valuemin="0" aria-valuemax="4" aria-valuenow="${step + 1}"><div style="width:${(step + 1) * 25}%"></div></div><form novalidate><div class="${step === 3 ? '' : 'fields'}">${step === 3 ? review() : fields()}</div><div class="form-actions"><button class="back" type="button" id="back"><svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 12H4m7-7-7 7 7 7"/></svg> ${step === 0 ? 'Início' : 'Voltar'}</button><button class="button" type="submit">${step === 3 ? 'Preparar minha cópia' : 'Continuar'} <span aria-hidden="true"><svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg></span></button></div><p class="reassurance">${step === 3 ? 'Protótipo: nenhuma inscrição será enviada.' : 'Suas respostas ficam nesta aba. Campos com * são obrigatórios.'}</p></form></div></section>`;
  document.querySelector('#back').onclick = () => navigate(step - 1);
  app.querySelector('form').onsubmit = event => {
    event.preventDefault();
    if (recorder || pendingMicrophone) { announce('Finalize a gravação antes de continuar.'); return; }
    collect();
    if (!validate()) return;
    tone();
    if (step === 3) finish(); else navigate(step + 1);
  };
  app.querySelectorAll('[data-choice]').forEach(button => button.onclick = () => {
    values.experience = button.dataset.choice;
    app.querySelectorAll('[data-choice]').forEach(b => b.setAttribute('aria-pressed', b === button));
    document.querySelector('#experience-error').textContent = '';
  });
  app.querySelectorAll('[data-edit]').forEach(button => button.onclick = () => navigate(Number(button.dataset.edit)));
  for (const key of ['context', 'goals']) {
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
        files[key].push({file, url: URL.createObjectURL(file), recorded: false});
      }
      event.target.value = '';
      document.getElementById(`${key}-error`).textContent = errors.join(' ');
      renderFiles(key);
    };
    document.querySelector(`[data-record="${key}"]`).onclick = () => toggleRecording(key);
    document.getElementById(key).oninput = event => {
      document.getElementById(`${key}-count`).textContent = `${event.target.value.length}/2000`;
    };
  }
}

function collect() {
  app.querySelectorAll('input[name], textarea[name], select[name]').forEach(el => { values[el.name] = el.value.trim(); });
}
function error(key, message) {
  document.getElementById(`${key}-error`).textContent = message;
  const input = document.getElementById(key);
  if (input) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', `${key}-error`); }
}
function validate() {
  let valid = true;
  app.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
  app.querySelectorAll('.error').forEach(el => { el.textContent = ''; });
  app.querySelectorAll('[required]').forEach(el => {
    let message = !el.value.trim() ? 'Preencha este campo para continuar.' : !el.validity.valid ? 'Confira o formato da sua resposta.' : '';
    if (el.name === 'phone' && el.value && !/^\+?[\d\s().-]+$/.test(el.value)) message = 'Informe um telefone válido.';
    if (el.name === 'phone' && el.value && (el.value.replace(/\D/g, '').length < 10 || el.value.replace(/\D/g, '').length > 15)) message = 'Inclua o DDD e um telefone válido.';
    if (message) { error(el.id, message); valid = false; }
  });
  if (step === 1 && !values.experience) { error('experience', 'Selecione uma opção.'); valid = false; }
  const key = step === 1 ? 'context' : step === 2 ? 'goals' : null;
  if (key && !values[key] && !files[key].some(item => item.recorded || item.file.type.startsWith('audio/'))) { error(key, 'Escreva uma resposta ou adicione um áudio.'); valid = false; }
  if (step === 3 && !document.querySelector('#confirm').checked) { document.querySelector('#confirm-error').textContent = 'Confirme a revisão para preparar sua cópia.'; valid = false; }
  if (!valid) { (app.querySelector('[aria-invalid=true]') || app.querySelector('[data-choice]') || document.querySelector('#confirm'))?.focus(); announce('Confira os campos destacados antes de continuar.'); }
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

async function toggleRecording(key) {
  if (recorder) { if (recorder.state === 'recording') recorder.stop(); return; }
  if (pendingMicrophone) return;
  const message = document.getElementById(`${key}-error`);
  message.textContent = '';
  if (files[key].length >= 3) { message.textContent = 'Remova um anexo antes de gravar. O limite é 3.'; return; }
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { message.textContent = 'Gravação indisponível neste navegador. Você pode escrever ou anexar um áudio. O microfone exige HTTPS ou acesso local.'; return; }
  pendingMicrophone = true;
  const button = document.querySelector(`[data-record="${key}"]`);
  button.textContent = 'Aguardando microfone…';
  setNavigationDisabled(true);
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({audio: true});
    const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'].find(type => MediaRecorder.isTypeSupported(type));
    recorder = mimeType ? new MediaRecorder(stream, {mimeType}) : new MediaRecorder(stream);
    recordingKey = key;
    const chunks = [];
    let totalSize = 0;
    let tooLarge = false;
    recorder.ondataavailable = event => {
      if (event.data.size) { chunks.push(event.data); totalSize += event.data.size; }
      if (totalSize > 10 * 1024 * 1024 && recorder?.state === 'recording') { tooLarge = true; recorder.stop(); }
    };
    recorder.onstop = () => {
      clearInterval(recordingTimer); stream.getTracks().forEach(track => track.stop());
      const type = chunks[0]?.type || mimeType || 'audio/webm';
      const blob = new Blob(chunks, {type});
      if (!tooLarge && blob.size && blob.size <= 10 * 1024 * 1024) {
        const extension = type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm';
        const file = new File([blob], `resposta-${key}-${files[key].length + 1}.${extension}`, {type});
        files[key].push({file, url: URL.createObjectURL(file), recorded: true}); renderFiles(key);
        announce('Áudio gravado. Você pode ouvir ou remover antes de continuar.');
      } else { message.textContent = 'Não foi possível salvar este áudio. Tente novamente ou escreva sua resposta.'; }
      recorder = null; recordingKey = null;
      button.textContent = '◉ Gravar áudio'; button.classList.remove('recording');
      setNavigationDisabled(false);
    };
    recorder.start(1000);
    let elapsed = 0;
    button.textContent = '■ Parar · 0:00'; button.classList.add('recording');
    announce('Gravação iniciada. Pressione Parar quando terminar.');
    recordingTimer = setInterval(() => {
      elapsed++;
      button.textContent = `■ Parar · ${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;
      if (elapsed >= 120 && recorder?.state === 'recording') recorder.stop();
    }, 1000);
  } catch {
    stream?.getTracks().forEach(track => track.stop()); recorder = null; recordingKey = null;
    message.textContent = 'Não foi possível acessar o microfone. Confira a permissão do navegador ou escreva sua resposta.';
    button.textContent = '◉ Gravar áudio'; setNavigationDisabled(false);
  } finally { pendingMicrophone = false; }
}
function setNavigationDisabled(disabled) {
  app.querySelectorAll('.form-actions button,[data-attach]').forEach(button => { button.disabled = disabled; });
}
function navigate(next) {
  if (recorder || pendingMicrophone) return;
  collect(); step = next; tone(); render();
  window.scrollTo({top: 0, behavior: 'instant'});
  document.querySelector('#step-title')?.focus({preventScroll:true});
  announce(step >= 0 ? `Etapa ${step + 1} de 4: ${labels[step]}` : 'Início da jornada.');
}

function review() {
  const groups = [
    [['Nome', 'name'], ['E-mail', 'email'], ['WhatsApp', 'phone'], ['Cidade / UF', 'city']],
    [['Momento atual', 'moment'], ['Área de atuação', 'occupation'], ['Experiência', 'experience'], ['Desafio atual', 'context']],
    [['Sua transformação', 'goals'], ['Interesse', 'interest'], ['Como conheceu a EJN', 'discovery']]
  ];
  return groups.map((group, i) => `<section class="review-section"><div class="review-heading"><h3>0${i + 1} · ${labels[i]}</h3><button type="button" data-edit="${i}">Editar <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg></button></div><dl>${group.map(([label, key]) => `<div><dt>${label}</dt><dd>${escape(values[key] || (files[key]?.length ? 'Resposta em áudio / anexos abaixo' : '—'))}</dd></div>`).join('')}</dl>${i > 0 ? `<div class="attachments" id="${i === 1 ? 'context' : 'goals'}-files" style="margin-top:15px"></div>` : ''}</section>`).join('') + `<div class="notice">Esta experiência é uma demonstração. O envio para a equipe EJN ainda não está conectado. Você pode baixar suas respostas e cada anexo para guardar uma cópia.</div><div class="check-row"><input id="confirm" type="checkbox"><label for="confirm">Revisei minhas respostas e entendo que esta cópia não realiza uma inscrição.</label></div><p class="error" id="confirm-error" role="status"></p>`;
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
  document.querySelector('#return').onclick = () => { step = 3; render(); };
  document.querySelector('#clear').onclick = () => {
    Object.keys(values).forEach(key => delete values[key]);
    Object.values(files).forEach(items => { items.forEach(item => URL.revokeObjectURL(item.url)); items.length = 0; });
    step = -1; render(); announce('Seus dados foram apagados.');
  };
  app.querySelector('h2').setAttribute('tabindex', '-1'); app.querySelector('h2').focus();
  window.scrollTo({top:0, behavior:'instant'});
}
window.addEventListener('beforeunload', () => {
  if (recorder?.state === 'recording') recorder.stop();
  Object.values(files).flat().forEach(item => URL.revokeObjectURL(item.url));
});
hero();
