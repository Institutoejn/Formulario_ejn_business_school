const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// A integração Web Speech é simulada: testa hipóteses intermediárias, finais e
// falhas sem depender do serviço externo de reconhecimento nem de áudio real.
function speechMock() {
  class Recognition {
    start() { window.__recognition = this; queueMicrotask(() => this.onstart?.()); }
    stop() { this.onend?.(); }
    abort() { this.onend?.(); }
    emit(items) {
      this.onresult?.({results: items.map(({text, final = false}) => {
        const result = [{transcript: text}]; result.isFinal = final; return result;
      })});
    }
    fail(error) { this.onerror?.({error}); }
  }
  window.SpeechRecognition = Recognition;
  window.webkitSpeechRecognition = Recognition;
}

(async () => {
  const server = require('node:http').createServer((req, res) => {
    const file = path.join(process.cwd(), req.url === '/' ? 'index.html' : req.url);
    try {
      const types = {'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
      res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      res.end(fs.readFileSync(file));
    } catch { res.statusCode = 404; res.end(); }
  });
  if (!process.env.EJN_TEST_URL) await new Promise(resolve => server.listen(5174, '127.0.0.1', resolve));
  const base = process.env.EJN_TEST_URL || 'http://127.0.0.1:5174';
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox']});
  try {
    for (const width of [1440, 390]) {
      const ctx = await browser.newContext({viewport:{width,height:960}, acceptDownloads:true, reducedMotion:'reduce'});
      await ctx.addInitScript(speechMock);
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(String(error)));
      await page.goto(base);
      assert(await page.locator('.brand-logo').evaluate(el => el.naturalWidth > 0));
      const fill = async (key, value) => page.locator(`#${key}`).fill(value);
      const next = async key => { await page.locator('button[type=submit]').click(); await page.locator(`#${key}`).waitFor(); };
      const tools = async () => {
        for (const input of await page.locator('input[name]:not([type=checkbox]),textarea[name]').all()) {
          const key = await input.getAttribute('name');
          assert(await input.getAttribute('placeholder'), `${key}: placeholder`);
          assert.equal(await page.locator(`[data-dictate="${key}"]`).count(), 1, key);
          assert.equal(await page.locator(`[data-attach="${key}"]`).count(), 1, key);
          assert.equal(await page.locator(`[data-dictate="${key}"] .microphone-icon`).count(), 1, `${key}: ícone de microfone`);
          assert.equal(await page.locator(`[data-attach="${key}"] .attachment-icon`).count(), 1, `${key}: ícone de anexo`);
        }
        for (const select of await page.locator('select').all()) assert.equal(await select.locator('option').first().textContent(), 'Selecione uma opção');
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      };
      const emit = items => page.evaluate(items => window.__recognition.emit(items), items);
      await page.locator('#begin').click(); await tools();
      await page.locator('#name-upload').setInputFiles({name:'identificacao.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 TEST')});
      await page.locator('button[type=submit]').click();
      assert.equal(await page.locator('[aria-invalid=true]').count(), 3, 'Somente nome/e-mail/WhatsApp obrigatórios na etapa 1; anexo não substitui texto');
      await page.locator('[data-dictate=name]').click();
      assert(await page.locator('button[type=submit]').isDisabled());
      assert.equal(await page.evaluate(() => window.__recognition.lang), 'pt-BR');
      assert.equal(await page.evaluate(() => window.__recognition.interimResults), true);
      await emit([{text:'Pes'}]); assert.equal(await page.locator('#name').inputValue(), 'Pes');
      await emit([{text:'Pessoa de Teste',final:true}]); assert.equal(await page.locator('#name').inputValue(), 'Pessoa de Teste');
      await emit([{text:'Pessoa de Teste',final:true},{text:'Silva'}]);
      assert.equal(await page.locator('#name').inputValue(), 'Pessoa de Teste Silva', 'Hipóteses não duplicam texto');
      await page.locator('[data-dictate=name]').click();
      assert.equal(await page.locator('#name').evaluate(el => el.readOnly), false);
      await fill('name', 'Pessoa de Teste');
      await page.locator('#name').evaluate(el => el.setSelectionRange(0,6));
      await page.locator('[data-dictate=name]').click(); await emit([{text:'Ana',final:true}]);
      assert.equal(await page.locator('#name').inputValue(), 'Ana de Teste', 'Substituição de seleção mantém texto restante');
      await page.locator('[data-dictate=name]').click();
      await fill('name', 'Pessoa de Teste');
      await page.locator('[data-dictate=email]').click(); await emit([{text:'teste arroba exemplo ponto com',final:true}]);
      await page.locator('[data-dictate=email]').click(); assert.equal(await page.locator('#email').inputValue(), 'teste@exemplo.com');
      await page.locator('[data-dictate=phone]').click(); await emit([{text:'17 98765 4321',final:true}]);
      await page.locator('[data-dictate=phone]').click(); assert.equal(await page.locator('#phone').inputValue(), '(17) 98765-4321');
      await fill('cpf', '11111111111');
      await page.locator('button[type=submit]').click(); assert.match(await page.locator('#cpf-error').innerText(), /CPF inválido/);
      await fill('cpf', ''); // Opcionais vazios são aceitos, preenchidos são validados.
      await fill('birth', '29022000'); assert.equal(await page.locator('#birth').inputValue(), '29/02/2000');
      await page.screenshot({path:`/tmp/ejn-inputs-${width}.png`, fullPage:true});
      await next('cep'); await tools();
      await fill('city','São José do Rio Preto'); await page.locator('#state').selectOption('SP');
      await next('education'); await tools();
      await page.locator('#moment').selectOption('Empreendedor(a)'); await page.locator('#stage').selectOption('Tenho uma ideia de negócio');
      await next('hasBusiness');
      await page.locator('#hasBusiness').selectOption('Sim'); await tools();
      await page.locator('button[type=submit]').click(); assert.match(await page.locator('#businessName-error').innerText(), /Preencha/);
      await fill('businessName', 'Projeto Teste');
      await page.locator('#businessName-upload').setInputFiles({name:'projeto.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 TEST')});
      await page.locator('#hasBusiness').selectOption('Não'); await tools();
      assert.equal(await page.locator('#businessName').count(), 0);
      // Todos os campos adicionais desta etapa são opcionais.
      await next('nextYear'); await tools();
      await page.locator('#goals-upload').setInputFiles({name:'teste.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 TEST')});
      await page.locator('button[type=submit]').click(); assert.match(await page.locator('#goals-error').innerText(), /Preencha/);
      await page.locator('[data-dictate=goals]').click(); await emit([{text:'Quero melhorar'}]);
      assert.equal(await page.locator('#goals').inputValue(), 'Quero melhorar');
      await emit([{text:'Quero melhorar minha gestão.',final:true}]); await page.locator('[data-dictate=goals]').click();
      await page.locator('#goals-upload').setInputFiles({name:'teste.exe',mimeType:'application/octet-stream',buffer:Buffer.from('x')});
      assert.match(await page.locator('#goals-error').innerText(), /formato não suportado/);
      await next('availability'); await tools();
      await page.locator('[data-dictate=questions]').click();
      await page.evaluate(() => window.__recognition.fail('not-allowed'));
      assert.match(await page.locator('#questions-status').innerText(), /não autorizado/);
      assert(!(await page.locator('button[type=submit]').isDisabled()));
      await page.locator('[data-dictate=questions]').click(); await emit([{text:'Texto preservado', final:true}]);
      await page.evaluate(() => window.__recognition.fail('network'));
      assert.equal(await page.locator('#questions').inputValue(), 'Texto preservado');
      assert.match(await page.locator('#questions-status').innerText(), /sem conexão/);
      await fill('questions', '');
      await page.locator('#availability').selectOption('Sim, tenho disponibilidade');
      await page.locator('#commitment').selectOption('Sim, estou totalmente disposto(a)');
      await next('confirm');
      assert.equal(await page.locator('.review-section').count(), 6);
      assert.equal(await page.locator('#name-files .file-row').count(), 1);
      assert.equal(await page.locator('#businessName-files').count(), 0);
      assert.equal(await page.locator('#goals-files .file-row').count(), 1);
      assert.equal(await page.locator('audio').count(), 0, 'Ditado não cria arquivo de áudio');
      await page.locator('[data-edit="0"]').click(); await fill('name','Pessoa Teste Editada');
      for (const key of ['cep','education','hasBusiness','nextYear','availability','confirm']) await next(key);
      await page.locator('#confirm').check(); await page.locator('button[type=submit]').click();
      const downloadP = page.waitForEvent('download'); await page.locator('#download').click();
      const data = JSON.parse(fs.readFileSync(await (await downloadP).path(), 'utf8'));
      assert.equal(data.respostas.name, 'Pessoa Teste Editada'); assert.equal(data.respostas.businessName, undefined);
      assert.deepEqual(data.anexos.businessName, []); assert.equal(data.anexos.name.length, 1);
      assert.equal(data.respostas.goals, 'Quero melhorar minha gestão.');
      assert.equal(data.status, 'prototipo_nao_enviado');
      await page.locator('#clear').click(); await page.locator('#begin').click(); assert.equal(await page.locator('#name').inputValue(), '');
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}px: placeholders/ferramentas em todos os campos, ditado progressivo/final, seleção, máscaras, permissões/rede, anexos, opcionais, condicionais, revisão, exportação e limpeza.`);
      await ctx.close();
    }
    const ctx = await browser.newContext({reducedMotion:'reduce'});
    await ctx.addInitScript(() => { window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined; });
    const page = await ctx.newPage(); await page.goto(base);
    assert.equal(await page.locator('.orb').evaluate(el => getComputedStyle(el).animationName), 'none');
    await page.locator('#begin').click(); await page.locator('[data-dictate=name]').click();
    assert.match(await page.locator('#name-status').innerText(), /não está disponível/);
    assert(!(await page.locator('button[type=submit]').isDisabled()));
    await page.locator('#name').fill('Digitação Normal'); assert.equal(await page.locator('#name').inputValue(), 'Digitação Normal');
    console.log('PASS: navegador sem reconhecimento mantém digitação; movimento reduzido.');
    await ctx.close();
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exit(1); });
