# EJN Business School — versão 0.3

Formulário em sete etapas com identidade da Escola Jovens de Negócios, perguntas consolidadas das inscrições Business School e EJN 25+, ditado em tempo real e anexos. Os quatro links foram acessados em 21/10/2026. Leia `docs/analise-e-direcao.md` e `docs/inventario-perguntas.md`.

## Executar

Na pasta do projeto, execute `npm run dev` e abra http://localhost:5173. Não é necessário instalar dependências para usar o formulário. As fontes e a logo estão incluídas em `assets/`.

`npm run check` verifica a sintaxe e executa os testes de validação. `npm run test:browser` requer Playwright (`npm install --no-save playwright`) e Chromium (`npx playwright install chromium`). `CHROMIUM_PATH` permite informar outro executável.

## O que foi implementado

- Sete etapas: dados pessoais, endereço, momento profissional, negócio, objetivos, compromisso e revisão.
- Perguntas reais das duas fontes, consolidadas sem duplicar a formação EJN 25+.
- Perguntas condicionais para negócio existente ou ideia futura.
- WhatsApp brasileiro com DDD e 11 dígitos; CPF opcional com dígitos verificadores; máscaras e limites ao digitar, colar e substituir uma seleção; CEP, data, e-mail, UF e URL.
- Placeholders em todos os campos de entrada; exemplos de preenchimento, dicas para seleções e indicação de campos opcionais.
- Ditado em português e anexos em todos os campos de texto, incluindo nome, e-mail e telefone. A fala aparece progressivamente no próprio campo; o texto pode ser corrigido após encerrar o ditado. Não cria gravações.
- Até 3 anexos de 10 MB por campo; downloads individuais e JSON de respostas/metadados. Anexos não substituem os textos obrigatórios.
- Logo oficial, fontes Poppins locais, verde escuro, amarelo, fundo claro e cartões arredondados.
- Entrada em sequência, saída e entrada entre etapas, profundidade na abertura, luz ambiente e movimento sutil que acompanha o ponteiro. Sem capturar a rolagem e com suporte a movimento reduzido.
- Respostas em memória: nenhuma gravação em localStorage, cookie ou analytics.

## Limites para publicação

Este pacote mantém o comportamento de demonstração do original: não há backend e não envia inscrições. A interface informa isso antes da conclusão. Não confundir exportar respostas com inscrição concluída.

A duração, faixa etária, dias, horários e preço do programa unificado precisam ser definidos pela EJN: as duas páginas atuais divergem. Perguntas de disponibilidade e pagamento foram neutralizadas; não se impôs limite etário nem cobrança. A formação para jovens permanece separada, com link para a página institucional existente; esse site externo ainda precisa ser atualizado para mostrar apenas duas formações.

Validação de CPF não consulta Receita Federal. E-mail e celular são validados pelo formato, sem confirmação de existência ou titularidade. CEP é validado pelo formato, sem consulta de endereço. Dados reais devem ser validados novamente no backend quando ele for conectado.

## Arquivos

- `form-model.js`: inventário, condições e funções de validação.
- `app.js`: navegação, estado, anexos e exportação.
- `speech-input.js`: integração com reconhecimento de voz do navegador.
- `style.css`: estilos e movimento.
- `index.html`: estrutura e privacidade.
- `.github/workflows/pages.yml`: pacote estático completo para GitHub Pages, incluindo assets e modelo.

## Campos obrigatórios e opcionais

Obrigatórios: nome completo, e-mail, WhatsApp, cidade, UF, situação profissional, estágio empreendedor, existência de negócio/projeto, nome do negócio quando aplicável, objetivo principal, disponibilidade e compromisso. São os dados essenciais para identificar, contatar e encaminhar a pessoa na formação. A confirmação de revisão também é necessária na demonstração.

Opcionais: nascimento, CPF, endereço completo, escolaridade, profissão, informações complementares do negócio, desafios, expectativas adicionais, interesses, origem do contato, pagamento, acessibilidade e dúvidas. Complementam a conversa sem bloquear o contato inicial. Se preenchidos, CPF, CEP, data e perfil continuam sendo validados.

## Ditado e privacidade

Usa `SpeechRecognition`/`webkitSpeechRecognition`, em português (`pt-BR`), com resultados intermediários. Depende de HTTPS/localhost, suporte do navegador, autorização do microfone e disponibilidade do serviço. O provedor do navegador pode processar o áudio online. Não há chave nem backend de transcrição próprio. O formulário não gera arquivos de gravação. O ditado encerra após até dois minutos ou quando o serviço encerra a sessão; pode ser iniciado novamente.

Em caso de navegador incompatível, conexão indisponível ou permissão negada, a interface explica o problema e permite digitar. Nenhum desses casos produz uma transcrição fictícia. Os testes de integração simulam os eventos Web Speech; não comprovam a qualidade do reconhecimento de voz em dispositivos reais.

## Publicação

- Push em `homolog`: valida JavaScript, regras e arquivos públicos, sem deploy.
- Pull requests para `main` ou `homolog`: somente validação.
- Push ou execução manual em `main`: validação seguida de publicação no GitHub Pages.

O pacote inclui `form-model.js`, `speech-input.js`, fontes e logo. Nenhum segredo ou dependência de instalação é necessário para os jobs de validação.

**Pré-requisito administrativo:** no repositório, abrir **Settings → Pages → Build and deployment → Source → GitHub Actions** e salvar. Sem isso, `actions/configure-pages` retorna `Get Pages site failed / Not Found`. O `GITHUB_TOKEN` padrão do workflow não pode habilitar Pages automaticamente; não se adicionou token administrativo ao código.

Depois de habilitar, executar novamente o workflow **Validar e publicar GitHub Pages** na branch `main`, ou usar **Re-run all jobs** na execução que falhou. A URL confirmada aparece na etapa de publicação. A branch `homolog` não publica nem altera o site Pages.
