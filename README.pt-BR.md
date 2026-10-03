# FlySend

[English](README.md) · [Українська](README.uk.md)

Envie mensagens repetidas do WhatsApp mais rápido usando modelos reutilizáveis — preencha as lacunas e abra uma conversa já pronta, sem copiar e colar.

## Funcionalidades

- **Modelos reutilizáveis** — salve modelos de mensagem com marcadores `{{variavel}}` e reutilize-os sempre que precisar.
- **Variáveis inteligentes de data/hora** — nomeie uma variável `date` ou `time` e ganhe um botão de um toque na tela de envio que preenche a data de hoje ou a hora atual para você.
- **Categorias** — agrupe modelos em categorias com um seletor pesquisável (escolha uma existente ou digite um nome novo para criá-la). A tela inicial agrupa automaticamente os modelos por categoria assim que você usa uma, e cada grupo pode ser recolhido.
- **Lembretes de horário de envio** — ative lembretes em um modelo (um ícone de sino aparece sempre que o campo Horário contém um horário no formato 24h `HH:MM`) para ser visualmente lembrado dos próximos envios. A tela inicial mostra um painel recolhível listando os horários correspondentes de todos os modelos com lembretes ativados para as próximas 24 horas; horários dentro da próxima hora são destacados em vermelho, entre 1 e 3 horas em amarelo, tanto no painel quanto diretamente no campo Horário onde ele aparecer. Ativar ou desativar o sino é instantâneo — não é preciso abrir ou salvar o modelo para isso. Tocar em um lembrete leva direto à tela de envio daquele modelo.
- **Reordenar modelos** — arraste e solte, ou use os botões de subir/descer, para organizar os modelos na ordem que você mais usa.
- **Busca** — filtre modelos por título, conteúdo, informação, horário ou categoria.
- **Envio direto pelo WhatsApp** — abre o WhatsApp (web ou aplicativo) com sua mensagem já preenchida, pronta para enviar.
- **Backup e restauração** — exporte todos os modelos para um arquivo de texto simples e importe-os de volta (de forma aditiva — nada que já foi salvo é sobrescrito). Como tudo fica armazenado no navegador, exportar um backup periodicamente é a única forma de manter seus modelos seguros.
- **PWA instalável** — instale na tela inicial e use offline graças a um service worker.
- **Multilíngue** — disponível em inglês, ucraniano e português (BR).
- **Armazenamento somente local** — os modelos ficam armazenados no seu navegador; nada é enviado a um servidor.

## Uso

O FlySend é um único arquivo HTML estático, sem etapa de build ou dependências. Para executá-lo:

1. Abra `index.html` diretamente no navegador, ou
2. Sirva a pasta com qualquer servidor de arquivos estáticos (ex.: `npx serve .`) e abra no navegador.
3. Opcionalmente, instale-o como PWA pelo prompt de instalação do navegador para uso offline.

## Dados e privacidade

Todos os modelos são armazenados localmente no seu navegador via `localStorage`. Nada é transmitido a nenhum servidor, exceto o link do WhatsApp que você escolher abrir. Limpar os dados do navegador removerá seus modelos, então exporte um backup regularmente se depender deles.

## Licença

MIT — veja [LICENSE](LICENSE).
