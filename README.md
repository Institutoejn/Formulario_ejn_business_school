# EJN Business School

Protótipo navegável de uma experiência de formulário em etapas, com movimento, áudio e anexos. **As perguntas e a identidade visual são provisórias:** os sites de referência estavam bloqueados pela rede. Veja [análise e pendências](docs/analise-e-direcao.md).

## Executar

Requisitos: Python 3; Node.js para a verificação de sintaxe. Não há dependências de aplicação para instalar, serviços externos ou chaves necessários.

```bash
cd /workspace/Formulario_ejn_business_school
npm run dev
```

O servidor escuta na porta 5173. O microfone requer localhost ou HTTPS e autorização do navegador. O servidor Python é apenas para desenvolvimento; publique os arquivos estáticos em um serviço com HTTPS para produção.

```bash
npm run check
python3 tests/smoke.py
```

O teste funcional requer o pacote Python `playwright`, Chromium em `/usr/bin/chromium` (ou `CHROMIUM_PATH`) e o servidor já iniciado. Ambos estão disponíveis no ambiente preparado. Os testes usam dados fictícios, microfone simulado e não enviam inscrições. `EJN_TEST_URL` permite mudar a origem de teste.

## Comportamento

- Quatro etapas com validação, revisão e edição.
- Respostas em texto ou áudio; gravação de até dois minutos com reprodução e remoção.
- Até três anexos de 10 MB por resposta, com validação de formato.
- Som opcional, animações com respeito à preferência por movimento reduzido, layout responsivo e uso por teclado.
- Respostas e arquivos somente na memória da aba. Sem analytics, cookies ou envio externo.
- Exportação JSON e download individual dos anexos. O JSON não contém os arquivos binários.

Não existe backend de inscrição. A conclusão informa explicitamente que os dados não foram enviados. Nenhuma identidade visual ou pergunta foi validada contra as páginas originais. O favicon e a marca tipográfica são provisórios.

## Publicar no GitHub Pages

O workflow `.github/workflows/pages.yml` publica os quatro arquivos da aplicação a cada push para `main`. Documentação e testes não são incluídos no site.

No repositório, configure **Settings → Pages → Build and deployment → Source → GitHub Actions**. Se o primeiro workflow tiver falhado antes de ativar Pages, execute-o novamente em **Actions → Publicar no GitHub Pages → Run workflow**.

A URL de implantação confirmada é exibida pelo job `deploy` no GitHub Actions. Essa publicação hospeda o protótipo estático com HTTPS; não conecta um backend de inscrições.
