# Validação da entrega — 21/10/2026

`npm run check`: passou. Sintaxe de app.js/form-model.js e regras de CPF, celular/DDD, máscaras, truncamento de caracteres, datas válidas e inválidas, e-mail, URL, nome e condições dos campos.

`npm run test:browser`: passou com Chromium 145 em 1440×960 e 390×960. Testou fluxo completo de sete etapas, bloqueio de campos vazios, máscara por colagem com letras, rejeição de CPF inválido, persistência de CPF formatado, endereço, seleções, negócio existente e troca para sem negócio (remoção dos dados ocultos), áudio com microfone simulado, PDF, rejeição de executável, múltipla escolha, revisão, retorno/edição, exportação JSON e limpeza de respostas. Não houve erro JavaScript capturado nas duas larguras, nem transbordamento horizontal na abertura/conclusão.

Movimento reduzido: passou; animação da esfera desativada quando a preferência é reduce.

As capturas `previews/ejn-1440.png` e `previews/ejn-390.png` foram feitas após carregar fontes e concluir a animação de entrada. A revisão longa também foi inspecionada por captura durante os testes.

Limites: não testado em hardware Android/iOS real ou Safari; a gravação usa microfone simulado. Nenhum formulário público foi enviado. Nenhum backend foi conectado ou publicação executada. Verificações são locais; não comprovam cadastro/posse de CPF, CEP, e-mail ou conta WhatsApp.
