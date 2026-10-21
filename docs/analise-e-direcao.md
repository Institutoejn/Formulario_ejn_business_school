# EJN Business School — análise e direção

## Situação das fontes

As quatro URLs indicadas foram consultadas em 21/10/2026. Todas retornaram `Tunnel connection failed: 403 Forbidden` pelo proxy do ambiente. Uma nova consulta ao formulário Business School, após salvar os domínios no rascunho de configuração, continuou bloqueada. O conector Sites indicado pelo usuário não estava disponível nas ferramentas desta sessão.

| Fonte | Objetivo da análise | Resultado |
| --- | --- | --- |
| https://escolajovensdenegocios.com/formacoes/ | Oferta de formações, posicionamento e identidade | Acesso bloqueado; não analisada |
| https://escolajovensdenegocios.com/inscricaobusinessschool/ | Perguntas, opções, textos e condições de cada etapa | Acesso bloqueado; não analisada |
| https://escolajovensdenegocios.com/inscricaoejn25/ | Perguntas e particularidades a consolidar | Acesso bloqueado; não analisada |
| https://www.gustavozinatto.com.br/ | Referência de imersão, composição e movimento | Acesso bloqueado; não analisada |

Não houve avanço pelos formulários originais. Nenhuma pergunta deste protótipo deve ser atribuída aos sites. Fontes, cores, ícones, favicon e marca oficial permanecem pendentes de levantamento. A marca tipográfica, o favicon de seta, a paleta e os textos implementados são propostas, não ativos oficiais extraídos.

## Decisões confirmadas pelo briefing

- Unificar Business School e EJN 25+ em EJN Business School.
- Preservar separadamente a formação de jovens; esse formulário não altera sua oferta.
- Criar uma experiência de tela ampla, com pequenas etapas e movimento.
- Permitir texto, áudio, imagens e arquivos, sem exigir uso do microfone.
- Usar a identidade da EJN após sua verificação; a referência Gustavo serve para imersão.

## Inventário proposto, ainda não validado contra as fontes

| Etapa | Campos propostos |
| --- | --- |
| Sobre você | Nome completo, e-mail, WhatsApp, cidade/UF |
| Seu momento | Momento profissional, área de atuação, experiência e desafio atual |
| Seu próximo passo | Transformação desejada, interesse de desenvolvimento, origem do contato |
| Revisão | Resumo editável e confirmação de que se trata de uma demonstração |

Desafio e transformação aceitam texto ou áudio. Cada resposta admite até três anexos de até 10 MB cada. A gravação é limitada a dois minutos e pode ser ouvida, baixada e removida. Os tipos permitidos são JPG, PNG, WebP, PDF, MP3, WAV, WebM, Ogg e M4A/MP4, conforme o MIME informado pelo navegador.

## Direção implementada

Fundo claro, texto escuro, destaque alaranjado e títulos com contraste tipográfico. Uma esfera em CSS e linhas orbitais dão profundidade à abertura sem vídeo pesado. Transições acompanham as etapas, com respeito a `prefers-reduced-motion`. O som de passagem é sintetizado no navegador e começa desligado. A interface inclui navegação por teclado, foco ao mudar de etapa, mensagens de validação e progresso acessível.

## Pendências para produção

1. Aplicar a liberação dos domínios nas configurações do ambiente e repetir a coleta de todas as etapas, sem enviar inscrições. Alternativamente, disponibilizar exportações ou capturas de cada etapa dos formulários e dos ativos visuais oficiais.
2. Consolidar o inventário real: pergunta, texto de apoio, tipo, opções, obrigatoriedade, condições e diferenças entre as duas formações. Validar faixas etárias, disponibilidade, preços e qualquer regra com a equipe, sem inferi-los.
3. Substituir a direção visual provisória pelos ativos e tokens oficiais verificados.
4. Definir o destino das inscrições e a política de privacidade. A aplicação atual não envia dados, não armazena rascunhos nem realiza uma inscrição.
5. Implementar o backend com validação, armazenamento privado de anexos, limites, controle de acesso e tratamento de falhas. A validação atual é apenas do protótipo no navegador.
6. Publicar via HTTPS para permitir o microfone em dispositivos reais. Testar Safari/iOS e Android com hardware real; a validação automatizada usa Chromium.

Áudios e anexos ficam somente em memória. O JSON exportado inclui respostas e metadados dos anexos, não os arquivos. Os anexos podem ser baixados individualmente. Recarregar a página descarta os dados.
