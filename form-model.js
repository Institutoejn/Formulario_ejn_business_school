const text = (key,label,extra={}) => ({key,label,...extra});
const choice = (key,label,options,extra={}) => ({key,label,options,...extra});
const long = (key,label,extra={}) => text(key,label,{type:'textarea',...extra});
const has = v => v.hasBusiness === 'Sim';
export const schemas = [
 [text('name','Nome completo',{attrs:'autocomplete="name"'}),text('email','E-mail',{type:'email',max:254,attrs:'autocomplete="email" autocapitalize="none" spellcheck="false"'}),text('phone','WhatsApp com DDD',{type:'tel',digits:true,max:15,placeholder:'(17) 99999-9999',attrs:'inputmode="numeric" autocomplete="tel-national"'}),text('birth','Data de nascimento',{type:'date',max:10,attrs:'autocomplete="bday"'}),text('cpf','CPF',{optional:true,digits:true,max:14,placeholder:'000.000.000-00',attrs:'inputmode="numeric"'})],
 [text('cep','CEP',{digits:true,max:9,placeholder:'15000-000',attrs:'inputmode="numeric" autocomplete="postal-code"'}),text('address','Endereço',{attrs:'autocomplete="street-address"'}),text('number','Número do endereço (ou S/N)',{max:12}),text('district','Bairro'),text('city','Cidade',{attrs:'autocomplete="address-level2"'}),choice('state','Estado',['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'])],
 [choice('education','Nível de escolaridade',['Ensino Médio cursando','Ensino Médio incompleto','Ensino Médio completo','Ensino Superior cursando','Ensino Superior incompleto','Ensino Superior completo','Pós-graduação','Outro']),text('occupation','Qual é a sua profissão ou área de atuação?'),choice('moment','Qual é sua situação profissional atual?',['Estudante','Profissional empregado(a)','Profissional autônomo(a)','Empreendedor(a)','Empreendedor(a) e empregado(a)','Empreendedor(a) e estudante','Em transição de carreira','Estou procurando uma oportunidade','Não estou trabalhando atualmente','Outra situação']),choice('stage','Em qual estágio da sua jornada empreendedora você está?',['Quero empreender, mas ainda não defini minha ideia','Tenho uma ideia de negócio','Estou validando minha ideia','Já comecei a vender','Tenho um negócio em operação'])],
 [choice('hasBusiness','Você já possui um negócio ou projeto?',['Sim','Não']),text('businessName','Nome do negócio ou projeto',{when:has}),choice('sales','Seu negócio já realiza vendas?',['Sim','Não'],{when:has}),long('businessDescription','Conte brevemente sobre seu negócio: o que oferece e há quanto tempo existe.',{when:has}),text('segment','Qual é o segmento do seu negócio ou ideia?'),long('desiredArea','Se ainda não empreende, em qual área gostaria de atuar?',{when:v=>v.hasBusiness==='Não'}),text('businessUrl','Instagram, site ou página do negócio',{optional:true,max:300,when:has,placeholder:'@seunegocio ou https://...'}),text('context','Qual é o principal desafio do seu negócio ou ideia hoje?',{type:'composer'})],
 [long('nextYear','O que você deseja conquistar com seu negócio nos próximos 12 meses?'),text('goals','Qual é seu principal objetivo ao participar da EJN Business School?',{type:'composer'}),long('motivation','Por que você decidiu participar neste momento da sua vida?'),long('outcome','O que você espera ter conquistado ao final da formação?'),long('selection','Por que você acredita que deveria ser selecionado(a) para esta turma?'),text('interests','Quais áreas você mais gostaria de desenvolver?',{type:'multi',options:['Mentalidade Empreendedora','Negócios','Marketing','Founder Led Growth','Vendas','Experiência do Cliente','Gestão','Finanças','Tecnologia e IA','Tributação','Liderança','Crescimento']})],
 [choice('availability','Você tem disponibilidade para participar de encontros presenciais?',['Sim, tenho disponibilidade','Preciso organizar minha rotina','Tenho disponibilidade parcial','Ainda tenho dúvidas sobre a disponibilidade']),choice('commitment','Você está disposto(a) a assumir atividades práticas, metas, testes, feedbacks e entregas durante a formação?',['Sim, estou totalmente disposto(a)','Sim, mas gostaria de entender melhor na entrevista','Ainda tenho dúvidas sobre minha disponibilidade']),choice('payment','Se houver investimento na turma, qual forma de pagamento você prefere?',['À vista','Parcelado','Gostaria de conhecer as condições'],{optional:true}),choice('discovery','Como você conheceu a EJN?',['Instagram','LinkedIn','WhatsApp','Indicação de amigos ou familiares','Evento ou palestra','Site da Escola Jovens de Negócios','Pesquisa no Google','Outro']),long('accessibility','Você possui alguma necessidade de acessibilidade que devemos considerar? Como podemos oferecer suporte?',{optional:true}),long('questions','Existe alguma dúvida ou informação que gostaria de receber antes de confirmar sua inscrição?',{optional:true})]
];
export const digits = value => String(value || '').replace(/\D/g,'');
export function normalize(key,value) {
 const limits={phone:11,cpf:11,cep:8};
 const d=digits(value).slice(0,limits[key] || 20);
 if(key==='cpf') return d.replace(/^(\d{3})(\d)/,'$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/,'$1.$2.$3').replace(/(\d{3}\.\d{3}\.\d{3})(\d)/,'$1-$2');
 if(key==='cep') return d.replace(/^(\d{5})(\d)/,'$1-$2');
 if(key==='phone') { if(d.length<=2)return d; return `(${d.slice(0,2)}) ${d.slice(2,7)}${d.length>7?'-'+d.slice(7):''}`; }
 return d;
}
export function validCPF(value) {
 const d=digits(value);
 if(d.length!==11 || /^(\d)\1+$/.test(d)) return false;
 for(let size=9;size<=10;size++) {
  let sum=0; for(let i=0;i<size;i++)sum+=Number(d[i])*(size+1-i);
  const check=(sum*10%11)%10;
  if(check!==Number(d[size]))return false;
 }
 return true;
}
const ddds=new Set('11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99'.split(' '));
export function validPhone(value) { const d=digits(value);return d.length===11 && ddds.has(d.slice(0,2)) && /^9\d{8}$/.test(d.slice(2)) && !/^(\d)\1{8}$/.test(d.slice(2)); }
export function validBirth(value, now=new Date()) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value || ''))return false;
 const [y,m,d]=value.split('-').map(Number), date=new Date(y,m-1,d);
 let age=now.getFullYear()-y; if(now.getMonth()<m-1 || (now.getMonth()===m-1 && now.getDate()<d))age--;
 return date.getFullYear()===y && date.getMonth()===m-1 && date.getDate()===d && date<=now && age<=120;
}
export function fieldError(f,value) {
 if(Array.isArray(value))return value.length?'':'Selecione pelo menos uma área.';
 const v=String(value || '').trim();
 if(!v)return f.optional?'':'Preencha este campo para continuar.';
 if(v.length>(f.type==='textarea'||f.type==='composer'?2000:f.max||120))return 'Sua resposta ultrapassa o limite de caracteres.';
 if(f.options && !f.options.includes(v))return 'Selecione uma opção válida.';
 if(f.key==='name' && (!/^\p{L}[\p{L}\p{M}\s’'\-]+$/u.test(v) || v.split(/\s+/).length<2))return 'Informe seu nome completo, sem números.';
 if(f.key==='email' && (!/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(v)||v.includes('..')))return 'Informe um e-mail válido, como voce@exemplo.com.';
 if(f.key==='phone' && !validPhone(v))return 'Use DDD válido e celular com 9 dígitos: (17) 98765-4321.';
 if(f.key==='cpf' && !validCPF(v))return 'CPF inválido. Confira os 11 dígitos.';
 if(f.key==='cep' && (digits(v).length!==8 || /^(\d)\1{7}$/.test(digits(v))))return 'Informe um CEP com 8 dígitos.';
 if(f.key==='birth' && !validBirth(v))return 'Informe uma data de nascimento válida, sem data futura.';
 if(f.key==='businessUrl' && !/^@[a-z\d_.]+$/i.test(v)) {
  try { const u=new URL(v);if(!['https:','http:'].includes(u.protocol)||!u.hostname.includes('.'))throw Error(); }
  catch {return 'Use https://seusite.com ou @seuperfil.';}
 }
 return '';
}
