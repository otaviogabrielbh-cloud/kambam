import { ContentCard, TEAM_MEMBERS } from './types';

// Helper to get formatted date string relative to current date (or base Aug 2026)
export const getSampleCards = (): ContentCard[] => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = today.getDate();

  const makeDate = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dt = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dt}`;
  };

  return [
    {
      id: 'card-1',
      title: 'Guia Definitivo: Como Criar Agentes Autônomos com n8n e Gemini 2.5',
      format: 'YouTube longo',
      scheduledDate: makeDate(4), // +4 days
      assignee: TEAM_MEMBERS[0], // Otávio Gabriel
      priority: 'Alta',
      tags: ['IA', 'Automação', 'n8n', 'Gemini'],
      checklist: [
        { id: 'cl-1', text: 'Estruturar roteiro técnico e benchmark', completed: true },
        { id: 'cl-2', text: 'Gravar tela demonstrando nós do n8n', completed: true },
        { id: 'cl-3', text: 'Edição de áudio e cortes dinâmicos', completed: false },
        { id: 'cl-4', text: 'Criar Thumbnail com efeito neon', completed: false },
      ],
      notes: 'Focar na nova funcionalidade de chamada de ferramentas do Gemini e exportação do template do n8n na descrição para captura de leads.',
      stage: 'production',
      createdAt: makeDate(-5),
    },
    {
      id: 'card-2',
      title: '3 Prompts Secretos de Raciocínio Profundo que Ninguém te Conta',
      format: 'Carrossel',
      scheduledDate: makeDate(-2), // -2 days (Overdue!)
      assignee: TEAM_MEMBERS[1], // Beatriz Lima
      priority: 'Alta',
      tags: ['ChatGPT', 'Tutorial', 'Produtividade'],
      checklist: [
        { id: 'cl-5', text: 'Copywriting dos 8 slides', completed: true },
        { id: 'cl-6', text: 'Design dos cards no Figma', completed: true },
        { id: 'cl-7', text: 'Revisão ortográfica e CTA final', completed: false },
      ],
      notes: 'Atrasado na etapa de revisão. Ajustar o slide 4 para destacar a técnica Chain-of-Thought.',
      stage: 'review',
      createdAt: makeDate(-8),
    },
    {
      id: 'card-3',
      title: 'DeepSeek R1 vs Claude 3.7 Sonnet: Qual o Melhor para Código?',
      format: 'YouTube longo',
      scheduledDate: makeDate(7), // +7 days
      assignee: TEAM_MEMBERS[2], // Carlos Eduardo
      priority: 'Alta',
      tags: ['IA', 'Claude', 'DeepSeek', 'Tutorial'],
      checklist: [
        { id: 'cl-8', text: 'Definir 5 desafios práticos de código', completed: true },
        { id: 'cl-9', text: 'Rodar testes de latência e consumo de tokens', completed: false },
        { id: 'cl-10', text: 'Roteiro e gravação', completed: false },
      ],
      notes: 'Comparar geração de componentes React, testes unitários e refatoração de código legado.',
      stage: 'ideas',
      createdAt: makeDate(-2),
    },
    {
      id: 'card-4',
      title: 'Mini Tutorial: Automação de E-mails com IA sem Código',
      format: 'Shorts',
      scheduledDate: makeDate(1), // Tomorrow
      assignee: TEAM_MEMBERS[3], // Mariana Souza
      priority: 'Média',
      tags: ['Tutorial', 'Automação', 'Shorts'],
      checklist: [
        { id: 'cl-11', text: 'Gravar vídeo vertical (60s)', completed: true },
        { id: 'cl-12', text: 'Inserir legendas dinâmicas e sound effects', completed: true },
        { id: 'cl-13', text: 'Aprovação final do corte', completed: true },
      ],
      notes: 'Vídeo pronto! Aguardando apenas o horário nobre de postagem amanhã às 18h.',
      stage: 'review',
      createdAt: makeDate(-3),
    },
    {
      id: 'card-5',
      title: 'Edição Semanal #42: Os Maiores Lançamentos de IA da Semana',
      format: 'Newsletter',
      scheduledDate: makeDate(2), // +2 days
      assignee: TEAM_MEMBERS[0], // Otávio Gabriel
      priority: 'Alta',
      tags: ['Notícia', 'IA', 'Newsletter'],
      checklist: [
        { id: 'cl-14', text: 'Curadoria das 5 notícias principais', completed: true },
        { id: 'cl-15', text: 'Redação do resumo executivo', completed: false },
        { id: 'cl-16', text: 'Configurar links UTM e disparo no Beehiiv', completed: false },
      ],
      notes: 'Destaque para o anúncio dos novos modelos multimodais em tempo real.',
      stage: 'production',
      createdAt: makeDate(-4),
    },
    {
      id: 'card-6',
      title: 'Como Transformar Áudio do WhatsApp em Tarefa do Trello com IA',
      format: 'Reels',
      scheduledDate: makeDate(-4), // Finished in the past
      assignee: TEAM_MEMBERS[4], // Lucas Silva
      priority: 'Média',
      tags: ['Automação', 'Produtividade', 'Reels'],
      checklist: [
        { id: 'cl-17', text: 'Roteiro e gravação', completed: true },
        { id: 'cl-18', text: 'Edição com zoom e motion graphics', completed: true },
        { id: 'cl-19', text: 'Postado e engajando na comunidade', completed: true },
      ],
      notes: 'Excelente performance orgânica, mais de 45k visualizações nas primeiras 24 horas.',
      stage: 'done',
      createdAt: makeDate(-10),
    },
    {
      id: 'card-7',
      title: 'Top 5 Extensões de IA Essenciais para o Chrome em 2026',
      format: 'Carrossel',
      scheduledDate: makeDate(10), // +10 days
      assignee: TEAM_MEMBERS[1], // Beatriz Lima
      priority: 'Baixa',
      tags: ['Produtividade', 'Tutorial'],
      checklist: [
        { id: 'cl-20', text: 'Pesquisar ferramentas emergentes', completed: false },
        { id: 'cl-21', text: 'Capturar screenshots em alta resolução', completed: false },
      ],
      notes: 'Focar em extensões gratuitas ou freemium acessíveis para criadores de conteúdo.',
      stage: 'ideas',
      createdAt: makeDate(-1),
    },
    {
      id: 'card-8',
      title: 'Framework de Prompt Engineering para Criadores de Conteúdo',
      format: 'YouTube longo',
      scheduledDate: makeDate(-7), // Past completed
      assignee: TEAM_MEMBERS[2], // Carlos Eduardo
      priority: 'Alta',
      tags: ['Tutorial', 'ChatGPT', 'Produtividade'],
      checklist: [
        { id: 'cl-22', text: 'Roteiro validado', completed: true },
        { id: 'cl-23', text: 'Gravação em estúdio', completed: true },
        { id: 'cl-24', text: 'Publicado no canal Maestros da IA', completed: true },
      ],
      notes: 'Vídeo âncora do canal. Link adicionado na bio de todas as redes.',
      stage: 'done',
      createdAt: makeDate(-14),
    },
    {
      id: 'card-9',
      title: 'Como Criar Avatares Realistas com Midjourney v7',
      format: 'Shorts',
      scheduledDate: makeDate(3), // +3 days
      assignee: TEAM_MEMBERS[4], // Lucas Silva
      priority: 'Média',
      tags: ['Midjourney', 'Tutorial', 'Shorts'],
      checklist: [
        { id: 'cl-25', text: 'Gerar prompts de consistência facial', completed: true },
        { id: 'cl-26', text: 'Gravação da narração', completed: false },
        { id: 'cl-27', text: 'Renderização final', completed: false },
      ],
      notes: 'Mostrar a técnica de sref e cref no Midjourney para manter o mesmo personagem.',
      stage: 'production',
      createdAt: makeDate(-3),
    },
  ];
};
