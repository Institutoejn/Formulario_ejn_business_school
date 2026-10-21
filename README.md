# EJN Business School — versão 0.2

Formulário em sete etapas com identidade da Escola Jovens de Negócios, perguntas consolidadas das inscrições Business School e EJN 25+, áudio e anexos. Os quatro links foram acessados em 21/10/2026. Leia `docs/analise-e-direcao.md` e `docs/inventario-perguntas.md`.

## Executar

Na pasta do projeto, execute `npm run dev` e abra http://localhost:5173. Não é necessário instalar dependências para usar o formulário. As fontes e a logo estão incluídas em `assets/`.

`npm run check` verifica a sintaxe e executa os testes de validação. `npm run test:browser` requer Playwright (`npm install --no-save playwright`) e Chromium (`npx playwright install chromium`). `CHROMIUM_PATH` permite informar outro executável.

## O que foi implementado

- Sete etapas: dados pessoais, endereço, momento profissional, negócio, objetivos, compromisso e revisão.
- Perguntas reais das duas fontes, consolidadas sem duplicar a formação EJN 25+.
- Perguntas condicionais para negócio existente ou ideia futura.
- WhatsApp brasileiro com DDD e 11 dígitos; CPF opcional com dígitos verificadores; máscaras e limites ao digitar, colar e substituir uma seleção; CEP, data, e-mail, UF e URL.
- Texto ou áudio para desafio e objetivo; até 3 anexos de 10 MB por resposta; gravação até 2 minutos. Downloads individuais e JSON de respostas/metadados.
- Logo oficial, fontes Poppins locais, verde escuro, amarelo, fundo claro e cartões arredondados.
- Entrada em sequência, saída e entrada entre etapas, profundidade na abertura, luz ambiente e movimento sutil que acompanha o ponteiro. Sem capturar a rolagem e com suporte a movimento reduzido.
- Respostas em memória: nenhuma gravação em localStorage, cookie ou analytics.

## Limites para publicação

Este pacote mantém o comportamento de demonstração do original: não há backend e não envia inscrições. A interface informa isso antes da conclusão. Não confundir exportar respostas com inscrição concluída.

A duração, faixa etária, dias, horários e preço do programa unificado precisam ser definidos pela EJN: as duas páginas atuais divergem. Perguntas de disponibilidade e pagamento foram neutralizadas; não se impôs limite etário nem cobrança. A formação para jovens permanece separada, com link para a página institucional existente; esse site externo ainda precisa ser atualizado para mostrar apenas duas formações.

Validação de CPF não consulta Receita Federal. E-mail e celular são validados pelo formato, sem confirmação de existência ou titularidade. CEP é validado pelo formato, sem consulta de endereço. Dados reais devem ser validados novamente no backend quando ele for conectado.

## Arquivos

- `form-model.js`: inventário, condições e funções de validação.
- `app.js`: navegação, estado, anexos, gravação e exportação.
- `style.css`: estilos e movimento.
- `index.html`: estrutura e privacidade.
- `.github/workflows/pages.yml`: pacote estático completo para GitHub Pages, incluindo assets e modelo.

A publicação no repositório não foi executada nesta entrega. O workflow requer habilitar GitHub Pages para GitHub Actions nas configurações do repositório.
