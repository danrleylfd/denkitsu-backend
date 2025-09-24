const AGENTS_DEFINITIONS = [
  { name: "Roteador", Icon: "Route", description: "Analisa a pergunta e seleciona automaticamente o melhor agente para a tarefa.", isCustom: false },
  { name: "Padrão", Icon: "Bot", description: "Assistente geral para uma ampla gama de tarefas e conversas.", isCustom: false },
  { name: "Analista", Icon: "BarChart2", description: "Focado em interpretar dados, encontrar padrões e gerar insights.", isCustom: false },
  { name: "Blogueiro", Icon: "Rss", description: "Ideal para criar textos longos, artigos e posts de blog com estilo.", isCustom: false },
  { name: "Desenvolvedor", Icon: "Code", description: "Especializado em gerar, explicar e depurar código em várias linguagens.", isCustom: false },
  { name: "Lousa", Icon: "Presentation", description: "Otimizado para criar visualizações interativas com código HTML.", isCustom: false },
  { name: "Prompter", Icon: "Sparkle", description: "Ajuda a refinar e melhorar as suas próprias perguntas para obter melhores respostas.", isCustom: false },
  { name: "Redator", Icon: "Newspaper", description: "Perfeito para escrever textos concisos, anúncios e notícias.", isCustom: false },
  { name: "Secretário", Icon: "ListTree", description: "Excelente para organizar informações, criar listas e formatar dados.", isCustom: false },
  { name: "Transcritor", Icon: "Speech", description: "Especialista em transcrever áudio para texto com alta precisão.", isCustom: false },
  { name: "Suporte", Icon: "HeartHandshake", description: "Agente especializado em ajudar com questões da conta, como assinaturas.", isCustom: false, disabled: false },
]

const INTERNAL_TOOLS_DEFINITIONS = [
  { name: "web", title: "Pesquisa Profunda", Icon: "Globe", description: "Realiza uma busca aprofundada na web para encontrar respostas detalhadas sobre qualquer assunto." },
  { name: "browser_search", title: "Pesquisar no Navegador", Icon: "MonitorPlay", description: "Permite que a IA navegue interativamente em sites para obter respostas detalhadas. (Apenas modelos gpt-oss)" },
  { name: "code_interpreter", title: "Interpretador de Código", Icon: "Terminal", description: "Permite que a IA execute código Python para realizar cálculos e resolver problemas computacionais." },
]

const TOOLS_DEFINITIONS = [
  { name: "browserTool", title: "Acessar Site Específico", Icon: "Link2", description: "Extrai e analisa o conteúdo de uma URL específica que você fornecer no prompt." },
  { name: "httpTool", title: "Requisição HTTP", Icon: "Server", description: "Faz uma requisição GET para uma URL, útil para acessar APIs ou dados brutos de uma página." },
  { name: "duckduckgoTool", title: "Pesquisar no DuckDuckGo", Icon: "Search", description: "Executa uma pesquisa rápida e direta no DuckDuckGo para obter resultados imediatos." },
  // { name: "bibleTool", title: "Pesquisar na Bíblia", Icon: "BookOpenText", description: "Busca por versículos, passagens ou termos específicos diretamente no texto bíblico." },
  // { name: "wikiTool", title: "Pesquisar na Wikipédia", Icon: "BookOpen", description: "Consulta a Wikipédia para obter resumos e informações enciclopédicas sobre um tópico." },
  { name: "newsTool", title: "Buscar Notícias", Icon: "Newspaper", description: "Pesquisa as notícias mais recentes de fontes globais sobre um determinado assunto." },
  { name: "cinemaTool", title: "Pesquisa Cinematográfica", Icon: "Clapperboard", description: "Busca informações sobre filmes e séries, incluindo sinopses, elenco e avaliações." },
  { name: "gamesTool", title: "Pesquisar Jogos", Icon: "Gamepad", description: "Encontra detalhes sobre videojogos, como data de lançamento, plataformas e gênero." },
  { name: "pokedexTool", title: "Pesquisar na Pokédex", Icon: "Smartphone", description: "Obtém informações detalhadas sobre qualquer Pokémon, como tipos, habilidades e status." },
  { name: "hoyoCodesTool", title: "Códigos Hoyoverse", Icon: "Gift", description: "Busca códigos de resgate para jogos da Hoyoverse (Genshin Impact, Zenless Zone Zero, etc)." },
  { name: "genshinCharAnalysisTool", title: "Genshin | Análise de Personagem", Icon: "FlagTriangleLeft", description: "Análise de builds de personagens de Genshin Impact a partir de um UID." },
  { name: "genshinCharDetailsTool", title: "Genshin | Detalhes de Personagem", Icon: "FlagTriangleRight", description: "Detalhes de personagens de Genshin Impact a partir de um UID." },
  { name: "criptoTool", title: "Cotação: Cripto (Beta)", Icon: "Bitcoin", description: "Verifica a cotação atual de diversas criptomoedas em tempo real." },
  { name: "albionTool", title: "Cotação: Albion Online Ouro (Beta)", Icon: "Coins", description: "Consulta o preço atual do ouro no jogo Albion Online." },
  { name: "weatherTool", title: "Clima na Terra", Icon: "Cloud", description: "Fornece a previsão do tempo para qualquer cidade do mundo." },
  { name: "spaceWeatherTool", title: "NASA: Clima Espacial", Icon: "SunMoon", description: "Busca relatórios da NASA sobre as condições climáticas no espaço." },
  { name: "marsWeatherTool", title: "NASA: Clima em Marte", Icon: "Thermometer", description: "Obtém os últimos dados meteorológicos diretamente dos rovers da NASA em Marte." },
  { name: "asteroidsTool", title: "NASA: Rastrear Asteroides", Icon: "Satellite", description: "Verifica asteroides próximos à Terra usando dados da NASA." },
  { name: "nasaTool", title: "NASA: Imagem do dia", Icon: "Telescope", description: "Busca e exibe a 'Imagem Astronômica do Dia' da NASA." },
  { name: "earthTool", title: "NASA: Imagens da Terra", Icon: "Earth", description: "Recupera imagens da Terra a partir de uma localização e data específicas, via satélites da NASA." },
  { name: "marsRoverTool", title: "NASA: Imagens de Marte", Icon: "Orbit", description: "Busca fotos tiradas pelos rovers da NASA em Marte." },
  { name: "nasaLibraryTool", title: "NASA: Biblioteca de Mídia", Icon: "SquareLibrary", description: "Pesquisa na vasta biblioteca de imagens e vídeos da NASA." },
  { name: "ttsTool", title: "Texto para Áudio (Inglês / Árabe)", Icon: "Speech", description: "Converte texto para áudio."},
]

module.exports = { AGENTS_DEFINITIONS, INTERNAL_TOOLS_DEFINITIONS, TOOLS_DEFINITIONS }
