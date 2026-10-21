import assert from 'node:assert/strict';
import {validCPF,validPhone,validBirth,normalize,fieldError,schemas} from '../form-model.js';
assert.equal(validCPF('529.982.247-25'),true);
for(const v of ['52998224724','00000000000','11111111111','123',''])assert.equal(validCPF(v),false,v);
assert.equal(validPhone('(17) 98765-4321'),true);
for(const v of ['(20) 98765-4321','(17) 38765-4321','(17) 99999-9999','179876543210','179876543'])assert.equal(validPhone(v),false,v);
assert.equal(normalize('phone','a17b9876543219999'),'(17) 98765-4321');
assert.equal(normalize('cpf','a5299822472599'),'529.982.247-25');
assert.equal(normalize('cep','abc1500000099'),'15000-000');
assert.equal(validBirth('2000-02-29',new Date(2026,9,21)),true);
for(const v of ['2001-02-29','2027-01-01','1890-01-01','2000-13-01'])assert.equal(validBirth(v,new Date(2026,9,21)),false,v);
assert.equal(fieldError({key:'email'},'ana@example.com'),'');
for(const v of ['a@','a@example','a b@example.com','a..b@example.com'])assert.ok(fieldError({key:'email'},v));
assert.equal(fieldError({key:'cpf',optional:true},''),'');
assert.ok(fieldError({key:'name'},'Paulo123 Ricardo'));
assert.equal(fieldError({key:'name'},'Paulo Ricardo'),'');
assert.ok(fieldError({key:'businessUrl'},'javascript:alert(1)'));
assert.equal(fieldError({key:'businessUrl'},'@meunegocio'),'');
assert.equal(schemas[3].find(f=>f.key==='sales').when({hasBusiness:'Não'}),false);
assert.equal(schemas[3].find(f=>f.key==='sales').when({hasBusiness:'Sim'}),true);
assert.equal(new Set(schemas.flat().map(f=>f.key)).size,schemas.flat().length);
console.log('PASS: CPF, WhatsApp, máscaras, limites, datas, e-mail, URL e condições.');
// Obrigatoriedade proporcional à inscrição, com validação dos opcionais preenchidos.
for (const f of schemas.flat()) {
 assert.ok(f.placeholder, `Placeholder ausente: ${f.key}`);
 if (f.optional) assert.equal(fieldError(f, f.type === 'multi' ? [] : ''), '', f.key);
 else assert.ok(fieldError(f, ''), f.key);
}
assert.equal(fieldError(schemas[4].find(f=>f.key==='interests'), []), '');
assert.ok(fieldError(schemas[4].find(f=>f.key==='interests'), ['Área inventada']));
assert.equal(validBirth('29/02/2000',new Date(2026,9,21)),true);
assert.equal(validBirth('29/02/2001',new Date(2026,9,21)),false);
assert.equal(normalize('birth', '29022000'), '29/02/2000');
console.log('PASS: placeholders completos, campos essenciais/opcionais e nascimento brasileiro.');
