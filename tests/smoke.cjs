const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const fs=require('node:fs'),path=require('node:path');
const server=require('node:http').createServer((req,res)=>{ const f=path.join(process.cwd(),req.url==='/'?'index.html':req.url);try {const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.statusCode=404;res.end();}});
if(!process.env.EJN_TEST_URL)await new Promise(r=>server.listen(5174,'127.0.0.1',r));

const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
for(const width of [1440,390]){
 const ctx=await browser.newContext({viewport:{width,height:960},permissions:['microphone'],acceptDownloads:true});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(process.env.EJN_TEST_URL||'http://127.0.0.1:5174');
 await page.screenshot({path:`/tmp/ejn-${width}.png`,fullPage:true});
 assert(await page.locator('.brand-logo').evaluate(e=>e.naturalWidth>0));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.locator('#begin').click(); await page.locator('#name').waitFor();
 await page.locator('button[type=submit]').click();assert.equal(await page.locator('[aria-invalid=true]').count(),4);
 const fill=async(id,v)=>page.locator('#'+id).fill(v);
 const next=async(id)=>{await page.locator('button[type=submit]').click();await page.locator('#'+id).waitFor();};
 await fill('name','Pessoa de Teste');await fill('email','teste@example.com');await fill('phone','17abc987654321');assert.equal(await page.locator('#phone').inputValue(),'(17) 98765-4321');
 await fill('cpf','11111111111');await fill('birth','2000-02-29');await page.locator('button[type=submit]').click();assert.match(await page.locator('#cpf-error').innerText(),/CPF inválido/);
 await fill('cpf','52998224725');await next('cep');
 await fill('cep','15000000');await fill('address','Rua de Teste');await fill('number','S/N');await fill('district','Centro');await fill('city','São José do Rio Preto');await page.locator('#state').selectOption('SP');await next('education');
 await page.locator('#education').selectOption('Ensino Médio completo');await fill('occupation','Educação');await page.locator('#moment').selectOption('Empreendedor(a)');await page.locator('#stage').selectOption('Tenho um negócio em operação');await next('hasBusiness');
 await page.locator('#hasBusiness').selectOption('Sim');await page.locator('#businessName').waitFor();await fill('businessName','Projeto Teste');await page.locator('#sales').selectOption('Sim');await fill('businessDescription','Um projeto de educação.');
 await page.locator('#hasBusiness').selectOption('Não');await page.locator('#desiredArea').waitFor();assert.equal(await page.locator('#sales').count(),0);
 await fill('desiredArea','Serviços educacionais');await fill('segment','Educação');
 await page.locator('[data-record=context]').click();await page.getByRole('button',{name:/Parar/}).waitFor();await page.waitForTimeout(1300);await page.getByRole('button',{name:/Parar/}).click();await page.locator('audio').waitFor();
 await page.locator('#context-upload').setInputFiles({name:'teste.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 TEST')});
 await next('nextYear');await fill('nextYear','Estruturar uma operação sustentável.');await fill('goals','Quero melhorar minha gestão.');await fill('motivation','Estou organizando meu projeto.');await fill('outcome','Ter um negócio estruturado.');await fill('selection','Tenho disposição para aprender e colaborar.');
 await page.locator('input[value="Vendas"]').check();
 await page.locator('#goals-upload').setInputFiles({name:'teste.exe',mimeType:'application/octet-stream',buffer:Buffer.from('x')});assert.match(await page.locator('#goals-error').innerText(),/formato não suportado/);
 await next('availability');await page.locator('#availability').selectOption('Sim, tenho disponibilidade');await page.locator('#commitment').selectOption('Sim, estou totalmente disposto(a)');await page.locator('#discovery').selectOption('Instagram');await next('confirm');
 assert.equal(await page.locator('.review-section').count(),6);assert.equal(await page.locator('audio').count(),1);
 assert(!(await page.locator('main').innerText()).includes('Projeto Teste'));
 await page.locator('[data-edit="0"]').click();await page.locator('#name').waitFor();assert.equal(await page.locator('#cpf').inputValue(),'529.982.247-25');await fill('name','Pessoa Teste Editada');
 for(const id of ['cep','education','hasBusiness','nextYear','availability','confirm'])await next(id);
 await page.screenshot({path:`/tmp/ejn-review-${width}.png`,fullPage:true});
 await page.locator('#confirm').check();await page.locator('button[type=submit]').click();await page.locator('#download').waitFor();
 const downloadP=page.waitForEvent('download');await page.locator('#download').click();const download=await downloadP;const data=JSON.parse(require('fs').readFileSync(await download.path(),'utf8'));
 assert.equal(data.respostas.name,'Pessoa Teste Editada');assert.equal(data.respostas.businessName,undefined);assert.deepEqual(data.respostas.interests,['Vendas']);assert.equal(data.anexos.context.length,2);
 assert.equal(data.status,'prototipo_nao_enviado');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.locator('#clear').click();await page.locator('#begin').click();await page.locator('#name').waitFor();assert.equal(await page.locator('#name').inputValue(),'');assert.deepEqual(errors,[]);
 console.log(`PASS ${width}px: fluxo completo, máscaras, CPF inválido, condicionais, áudio, anexos, edição, revisão, exportação e limpeza.`);await ctx.close();
}
const ctx=await browser.newContext({reducedMotion:'reduce'});const page=await ctx.newPage();await page.goto('http://127.0.0.1:5174');assert.equal(await page.locator('.orb').evaluate(e=>getComputedStyle(e).animationName),'none');console.log('PASS: movimento reduzido.');await browser.close();server.close();
})().catch(e=>{console.error(e);process.exit(1)});
