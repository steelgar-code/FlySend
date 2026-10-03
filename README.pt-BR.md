# FlySend

[English](README.md) · [Українська](README.uk.md) · Português (BR)

Crie modelos de mensagens para o WhatsApp, reutilize-os e preencha os dados necessários em poucos cliques. O FlySend abrirá uma conversa com o texto já pronto — basta revisar a mensagem e enviá-la.

## Funcionalidades

- **Modelos reutilizáveis** — salve mensagens com variáveis, como `{{name}}`, e reutilize-as novamente sem copiar o texto manualmente.
- **Preenchimento automático de data e hora** — use as variáveis `{{date}}` e `{{time}}` para preencher a data ou a hora atual com um toque.
- **Categorias** — agrupe modelos por finalidade, recolha os grupos e encontre rapidamente as mensagens que precisa.
- **Lembretes de envio** — defina um horário para os modelos e veja lembretes das próximas 24 horas. O horário de envio que se aproxima é destacado por cor.
- **Busca** — encontre modelos por título, texto da mensagem, informação adicional, horário ou categoria.
- **Ordem personalizada dos modelos** — arraste os modelos ou reordene-os com os botões.
- **Preparação da mensagem no WhatsApp** — abra o WhatsApp no navegador ou no aplicativo com o texto já preenchido.
- **Backup** — exporte os modelos para um arquivo e restaure-os por importação sem sobrescrever os dados existentes.
- **Acesso offline** — instale o FlySend como PWA e use-o sem conexão à internet depois de configurado.
- **Três idiomas de interface** — inglês, ucraniano e português (Brasil).

## Como usar

1. Abra o FlySend no navegador.
2. Crie um modelo de mensagem e adicione as variáveis necessárias.
3. Se quiser, defina uma categoria e um horário de lembrete.
4. Abra o modelo, preencha os campos necessários e prepare a mensagem.
5. Vá para o WhatsApp e revise o texto antes de enviar.

## Como funcionam as variáveis nos modelos

As variáveis permitem reutilizar um mesmo modelo para mensagens diferentes, sem editar todo o texto manualmente. Ao preparar a mensagem, você preenche os valores necessários, e o FlySend os insere nos lugares certos do texto.

### Variáveis personalizadas

Adicione variáveis ao texto do modelo no formato `{{nome}}`. Você escolhe o nome da variável — por exemplo, `{{name}}`, `{{company}}` ou `{{meeting_place}}`.

Exemplo de modelo:

```text
Olá, {{name}}!

Lembrando que nossa reunião será em {{meeting_date}}.
Local da reunião: {{meeting_place}}.
```

Ao preparar a mensagem, preencha os valores das variáveis para obter o texto final. Por exemplo:

```text
Olá, Helena!

Lembrando que nossa reunião será em 15 de outubro.
Local da reunião: escritório na Khreshchatyk.
```

### Preenchimento rápido de data e hora

Para preencher rapidamente a data e a hora, use no modelo as variáveis especiais `{{date}}` e `{{time}}`, e os botões correspondentes aparecerão na tela de envio. Um toque preenche a data ou a hora atual sem digitação manual.

Isso é útil para mensagens com lembretes, confirmações de reunião e outras situações em que você precisa adicionar rapidamente a data ou hora atual.

### Dicas de uso

- **Escolha nomes claros** — por exemplo, `{{client_name}}` ou `{{meeting_place}}`.
- **Reutilize um mesmo modelo** — altere apenas os valores que variam em cada mensagem.
- **Use o preenchimento rápido de data e hora** — isso evita a digitação manual quando você precisa dos valores atuais.

## Como funcionam os lembretes

1. Abra o modelo e informe um horário no campo "Horário" no formato 24h `HH:MM`, por exemplo `09:30` ou `17:45`.
2. Ative os lembretes pelo ícone do sino. A alternância é instantânea — não é preciso abrir ou salvar o modelo para isso.
3. Na tela inicial, expanda o painel de lembretes para ver o horário de envio de todos os modelos com lembretes ativados nas próximas 24 horas.
4. Observe as marcações de cor:
   - **Vermelho** — falta menos de uma hora para o horário de envio.
   - **Amarelo** — faltam entre 1 e 3 horas para o horário de envio.
   - **Sem destaque de cor** — faltam mais de 3 horas para o horário de envio.
5. Toque no lembrete desejado para ir direto à tela de envio do modelo correspondente.

As marcações de cor ajudam a avaliar quão próximo está o horário de envio. Os lembretes aparecem na interface do FlySend e não significam que a mensagem será enviada automaticamente. Para enviá-la, vá ao WhatsApp e confirme o envio você mesmo.

## Execução

O FlySend é um arquivo HTML estático, então executá-lo não exige etapa de build nem instalação de dependências.

### Opção 1: abrir o arquivo

Abra o `index.html` no navegador para uso básico.

### Opção 2: executar um servidor web local

Se você tiver o Node.js instalado, execute na pasta do projeto:

```bash
npx serve .
```

Abra o endereço exibido pelo comando no navegador.

Para instalar como PWA e testar o modo offline, use um contexto de navegador compatível — HTTPS ou localhost.

## Dados e privacidade

Os modelos são armazenados localmente no navegador usando `localStorage`. O FlySend não os envia a nenhum servidor próprio.

Ao abrir o WhatsApp com uma mensagem preparada, o tratamento posterior dos dados depende do WhatsApp.

**Importante:** limpar os dados do navegador pode excluir os modelos salvos. Exporte um backup regularmente para não perder seus dados.

## Licença

O FlySend é distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
