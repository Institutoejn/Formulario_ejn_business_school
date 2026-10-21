# Validação da revisão em homolog — 21/10/2026

`npm run check`: passou. Sintaxe dos três módulos; validação de nome, e-mail, CPF, celular/DDD, máscaras, limites, datas válidas/inválidas (incluindo DD/MM/AAAA), URL e condições. Verifica placeholders e obrigatoriedade/opcionalidade no inventário completo.

`npm run test:browser`: passou em Chromium, nas larguras 1440 e 390. Fluxo completo de sete etapas com:

- Placeholder, ditado e anexo em todos os campos de texto visíveis, incluindo condicionais; opções iniciais nas seleções.
- Campos essenciais bloqueiam avanço; complementares vazios permitem avanço; CPF opcional inválido bloqueia até correção/limpeza.
- Ditado em pt-BR: hipóteses intermediárias, atualização final sem duplicação, inserção na seleção, edição posterior, e-mail falado e máscara de telefone.
- Permissão negada, serviço sem rede e navegador sem Web Speech mantêm a digitação disponível. Texto parcial é preservado em falha de rede.
- Anexos em nome/objetivo; anexo não substitui resposta obrigatória; executável é rejeitado. Anexos condicionais são descartados ao ocultar o campo.
- Revisão com anexos associados ao campo, edição, exportação JSON com texto transcrito e metadados, limpeza de dados. Ditado não cria arquivo de áudio.
- Identidade visual carregada, ausência de erros JavaScript e transbordamento horizontal nas etapas, movimento reduzido respeitado.

A integração de reconhecimento usa eventos Web Speech simulados nos testes. Não se testou voz real, precisão do serviço externo ou hardware Android/iOS/Safari. Reconhecimento real requer navegador compatível, permissão, contexto seguro e serviço disponível. Nenhum backend de inscrição foi conectado.

## Correção da publicação

A execução remota 39621341274 falhou em `actions/configure-pages@v5` com `Get Pages site failed / Not Found`. A anotação pública informa que o repositório precisa ter Pages habilitado com GitHub Actions. Não era uma falha do formulário.

Após autorização do usuário, o workflow passou a validar `homolog` e pull requests sem deploy. Somente `main` publica, após a validação. O pacote estático inclui todos os módulos e assets. Pages ainda exige habilitação administrativa nas configurações; salvar código ou concluir testes locais não ativa esse recurso.

Fonte do diagnóstico: https://github.com/Institutoejn/Formulario_ejn_business_school/actions/runs/39621341274
Documentação da ação: https://github.com/actions/configure-pages/blob/v5/action.yml — `enablement` exige um token diferente de `GITHUB_TOKEN`, com permissões administrativas.
