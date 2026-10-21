# Análise dos links e do código — 21/10/2026

## Fontes consultadas

| Link | O que foi observado | Aplicação e diferença |
| --- | --- | --- |
| https://escolajovensdenegocios.com/formacoes/ | Catálogo institucional ainda com três jornadas: jovens, EJN 25+ e Business School. Verde, amarelo, branco, grade de fundo, títulos fortes, cartões arredondados e detalhes gráficos. | O novo formulário apresenta somente Business School e mantém um link para a formação de jovens. O catálogo externo não foi editado. |
| https://escolajovensdenegocios.com/inscricaobusinessschool/ | Formulário completo com identificação, endereço, escolaridade, profissão, estágio empreendedor, negócio, candidatura e compromisso. A página anuncia 6 meses, 144h, público 18–30 e encontros segundas, quartas e sextas 19h–21h. | Principal base das perguntas. Condições não aplicadas automaticamente ao programa unificado. |
| https://escolajovensdenegocios.com/inscricaoejn25/ | Formulário completo com negócio/projeto, área desejada, objetivos, áreas de desenvolvimento, motivação, disponibilidade, pagamento, descoberta, acessibilidade e dúvidas. Anuncia 3 meses, 12 encontros, terças 19h–21h, público 25+, 3x R$66,90 ou R$180 à vista. | Conteúdo incorporado sob Business School, com duração e preços antigos removidos das perguntas. |
| https://www.gustavozinatto.com.br/ | Página atual com luzes sobre fundo escuro, camadas de profundidade, textos segmentados, cartões, seções de processo, acordeões e formulário de contato. Foram observadas duas imagens de fundo com animação `hero-current-drift`. | Referência de atmosfera e movimento, traduzida para as cores EJN. O briefing antigo mencionado pelo usuário não foi encontrado nem reproduzido. |

A pesquisa web recuperou o catálogo, mas não recuperou os outros três links. Os quatro foram abertos no navegador; os formulários completos, opções e atributos dos controles foram inspecionados sem enviar candidaturas. Nenhuma inscrição real foi criada. Não foram preenchidos dados fictícios nos formulários públicos para evitar envio implícito em serviços de terceiros.

## Identidade

Cores observadas na página: verde dos rótulos `#004D40`, verde institucional próximo de `#013E35`, amarelo/laranja `#FFA500`. A implementação usa verde `#004D40`, fundo claro e amarelo `#FFB800` para o destaque. Poppins foi confirmada nos estilos dos rótulos e títulos; os arquivos Regular e Bold foram obtidos do próprio domínio. O título publicitário das páginas tem tratamento gráfico próprio; não foi afirmado que todos os títulos originais usam Poppins.

Logo oficial: https://escolajovensdenegocios.com/wp-content/webp-express/webp-images/uploads/2024/03/logo-escola-jovens-de-negocios.png.webp

Fontes: https://escolajovensdenegocios.com/visual/2024/03/Poppins-Regular.woff2 e https://escolajovensdenegocios.com/visual/2024/03/Poppins-Bold.woff2

Esses arquivos acompanham o pacote para evitar dependência de carregamento externo. O favicon com as letras EJN é um recurso de navegação criado para este pacote, não uma nova versão da logo.

## Revisão do código original

Foram lidos `index.html`, `app.js`, `style.css`, `favicon.svg`, `package.json`, README, documentação, teste e workflow de publicação. O código original tinha quatro etapas, dados genéricos, marca tipográfica improvisada, paleta bege e laranja e nenhuma pergunta de CPF/endereço/escolaridade. A validação aceitava telefones de 10 a 15 dígitos sem regra de celular brasileiro. A gravação, limites de anexos, escape de HTML e descarte em memória foram preservados. A revisão, exportação, progresso e navegação foram ajustados para sete etapas.

O workflow foi corrigido para publicar também `form-model.js` e `assets/`. Os testes antigos, específicos das perguntas provisórias, foram substituídos pelos testes do novo inventário.

## Critérios de consolidação

O nome público é EJN Business School. O formulário do EJN 25+ contribui com perguntas, sem manter um terceiro programa. A jornada de jovens não foi reconstruída porque o pedido e os dois formulários fornecidos se referem à consolidação Business School/25+.

Perguntas equivalentes foram unificadas e sua origem consta do inventário. Dados conflitantes de agenda, idade, preço e duração não foram apresentados como condição definitiva. A pergunta de pagamento oferece preferência à vista/parcelado, sem cobrar ou informar valores. Acessibilidade e dúvidas são opcionais; nas páginas de origem há campos de acessibilidade obrigatórios. CPF foi adicionado opcionalmente por solicitação do usuário; não aparece nos formulários consultados.

O termo original de autorização de uso de dados para processo seletivo está registrado no inventário. Como não existe envio de dados nesta versão, a confirmação da revisão explica o comportamento local e não simula um consentimento de inscrição. Ao conectar o backend, deve-se exibir o termo correspondente à finalidade real e a política de privacidade da instituição.

## Pendências concretas

1. Definir condições do programa consolidado: público, duração, horário, investimento e seleção.
2. Conectar destino real das inscrições; repetir validações no servidor e configurar armazenamento privado de anexos, controles de acesso e retenção.
3. Atualizar os três endereços institucionais para refletir apenas jovens e Business School; redirecionar o endereço antigo quando essa migração for autorizada.
4. Publicar e validar microfone em HTTPS, incluindo Safari/iOS e Android reais.
