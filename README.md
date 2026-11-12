# LanceRadar

Dashboard demonstrativo para acompanhar leilões da Receita Federal. O LanceRadar organiza editais e lotes, permite configurar critérios de monitoramento, salvar favoritos, consultar alertas e estimar custos e retorno de oportunidades.

> **Importante:** esta versão é um protótipo com dados demonstrativos. O conteúdo em `src/data/mockData.ts` não é uma coleta oficial atualizada. A ação de sincronização apenas simula uma espera e registra um log local; não consulta o portal da Receita Federal. Não use os valores e descrições da demonstração como informação oficial para tomar decisões de compra.

## Stack

- **TypeScript** e **React 19**
- **Vite 8** para desenvolvimento e build
- **Tailwind CSS 4** para estilos
- **Recharts** para gráficos
- **Lucide React** para ícones
- **Motion** para animações
- **Google GenAI** está listado como dependência; a interface demonstrativa atual não depende de chamadas Gemini para suas funções principais.

## Organização

```text
src/
  components/
    alerts/       Alertas
    auctions/     Editais
    common/       Componentes compartilhados
    dashboard/    Indicadores e gráficos
    favorites/    Lotes favoritos
    financial/    Simulações financeiras
    history/      Histórico e rastreabilidade
    layout/       Navegação e estrutura da aplicação
    lots/         Consulta de lotes
    monitoring/   Regras e correspondências
    settings/     Preferências
  context/        Estado global, ações e persistência local
  data/           Dados demonstrativos em mockData.ts
  types/          Tipos das entidades do domínio
  utils/          Funções auxiliares de formatação
```

A entrada da aplicação é `src/main.tsx`. `src/App.tsx` envolve o layout com `AppProvider`, e `src/components/layout/AppLayout.tsx` seleciona a tela a partir do estado de navegação. `src/context/AppContext.tsx` mantém dados e ações da interface e persiste editais, lotes, regras, favoritos, alertas, simulações e preferências no `localStorage` do navegador.

## Requisitos

- Node.js compatível com a versão de Vite instalada e npm; ou Bun.
- Não há banco de dados ou serviço externo necessário para executar o protótipo.

## Instalação e execução

Com npm:

```bash
npm install
npm run dev
```

Com Bun:

```bash
bun install
bun run dev
```

O Vite inicia na porta `3000` e escuta em `0.0.0.0`. Abra `http://localhost:3000` no navegador.

## Validações disponíveis

O repositório não define um script de testes automatizados. Os comandos disponíveis para verificação são:

```bash
npm run lint   # verifica tipos TypeScript com tsc --noEmit
npm run build  # gera o build de produção em dist/
```

Também podem ser executados com Bun (`bun run lint` e `bun run build`).

### Roteiro manual de ponta a ponta

1. Inicie o servidor local e abra `http://localhost:3000`.
2. No **Dashboard**, confira os indicadores, gráficos, alertas de encerramento e oportunidades monitoradas.
3. Navegue para **Editais** e **Todos os Lotes**; abra um item e confira seus detalhes.
4. Marque/desmarque um lote como favorito e atualize a página para confirmar que a preferência persiste no mesmo navegador.
5. Em **Monitoramento**, crie ou altere uma regra e confira as correspondências apresentadas no Dashboard.
6. Em **Alertas**, marque um alerta como lido e verifique a atualização do contador.
7. Abra a análise financeira a partir de um lote, salve uma simulação e confira-a na tela financeira.
8. Em **Configurações**, altere uma preferência, atualize a página e confira a persistência.
9. Use a sincronização manual e confirme que aparece um novo registro no histórico de coleta. Isso valida apenas o fluxo simulado da interface, não uma conexão real com o SLE.
10. Execute `npm run lint` e `npm run build`; ambos devem terminar sem erros.

## Variáveis de ambiente

`.env.example` documenta `GEMINI_API_KEY` e `APP_URL` para o ambiente de AI Studio. O fluxo demonstrativo descrito acima não exige essas variáveis. A presença dessas configurações ou da dependência `@google/genai` não significa que exista integração operacional com a Receita Federal.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento Vite na porta 3000 |
| `npm run build` | Build de produção |
| `npm run preview` | Servidor local para visualizar o build |
| `npm run lint` | Verificação de tipos TypeScript |
| `npm run clean` | Remove `dist` e `server.js` |
