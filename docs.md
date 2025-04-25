## Documentação da API Backend - Denkitsu

**BaseURL:** `https://denkitsu.up.railway.app`

Este documento descreve a arquitetura e os endpoints da API backend do projeto Denkitsu, seguindo o padrão MVC (Model-View-Controller) com o uso de middlewares.

## Arquitetura Geral

O backend é construído com Node.js e Express.js. A estrutura de pastas segue a organização padrão:

-   `src/app/controllers/`: Define as rotas e associa os endpoints às suas respectivas views (lógica de negócio), aplicando middlewares específicos quando necessário.
-   `src/app/middlewares/`: Contém funções intermediárias que executam tarefas antes ou depois das views (ex: autenticação, logging, validação, rate limiting).
-   `src/app/models/`: Define os schemas de dados usando Mongoose para interação com o MongoDB.
-   `src/app/views/`: Implementa a lógica de negócio para cada endpoint.
-   `src/utils/`: Contém utilitários diversos (serviços, ferramentas, etc.).
-   `src/app.js`: Ponto de entrada da aplicação, onde middlewares globais são aplicados e as rotas são carregadas.

## Middlewares Globais

Os seguintes middlewares são aplicados a **todas** as requisições na aplicação, configurados em <mcfile name="app.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app.js"></mcfile>:

1.  **`cors` (<mcfile name="cors.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\cors.js"></mcfile>)**: Habilita o Cross-Origin Resource Sharing, permitindo que o frontend (ou outras origens permitidas) acesse a API.
2.  **`express.json()`**: Faz o parse do corpo de requisições com `Content-Type: application/json`.
3.  **`express.urlencoded({ extended: true })`**: Faz o parse do corpo de requisições com `Content-Type: application/x-www-form-urlencoded`.
4.  **`request-ip.mw()`**: Extrai o endereço IP do cliente da requisição e o torna disponível em `req.clientIp`.
5.  **`globalLimiter` (<mcfile name="rateLimiter.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\rateLimiter.js"></mcfile>)**: Aplica um limite de taxa global para todas as requisições, prevenindo abuso.
6.  **`authLimiter` (<mcfile name="rateLimiter.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\rateLimiter.js"></mcfile>)**: Aplica um limite de taxa específico para rotas de autenticação (`/auth`), tornando ataques de força bruta mais difíceis.

## Módulos e Endpoints

A API é organizada em módulos, cada um gerenciado por um controlador específico em `src/app/controllers/`. O arquivo <mcfile name="index.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\controllers\index.js"></mcfile> carrega dinamicamente todos os controladores.

---

### Módulo: Autenticação (`/auth`)

*   **Controlador**: <mcfile name="auth.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\controllers\auth.js"></mcfile>
*   **Middleware Específico**: <mcfile name="log.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\log.js"></mcfile> (Aplicado a todas as rotas deste módulo).
*   **Views**: <mcfolder name="auth" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\auth"></mcfolder>

Este módulo lida com o registro, login, atualização de token e recuperação de senha dos usuários.

**Endpoints:**

1.  **`POST /auth/signup`**
    *   **View**: <mcfile name="signUp.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\auth\signUp.js"></mcfile>
    *   **Descrição**: Registra um novo usuário.
    *   **Corpo da Requisição (JSON)**:
        ```json
        {
          "name": "string (required)",
          "email": "string (required, valid email format)",
          "password": "string (required, min 8 characters)"
        }
        ```
    *   **Resposta (Sucesso - 201 Created)**:
        ```json
        {
          "message": "User created successfully"
        }
        ```
    *   **Respostas (Erro)**: 400 (Bad Request), 409 (Conflict - email já existe), 422 (Unprocessable Entity - dados inválidos), 500 (Internal Server Error).

2.  **`POST /auth/signin`**
    *   **View**: <mcfile name="signIn.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\auth\signIn.js"></mcfile>
    *   **Descrição**: Autentica um usuário existente e retorna tokens de acesso e atualização.
    *   **Corpo da Requisição (JSON)**:
        ```json
        {
          "email": "string (required, valid email format)",
          "password": "string (required, min 8 characters)"
        }
        ```
    *   **Resposta (Sucesso - 200 OK)**:
        ```json
        {
          "refreshToken": "string (JWT)",
          "token": "string (JWT)",
          "user": { ...objeto do usuário sem a senha... }
        }
        ```
    *   **Respostas (Erro)**: 401 (Unauthorized - credenciais inválidas), 404 (Not Found - usuário não encontrado), 422 (Unprocessable Entity - dados inválidos), 500 (Internal Server Error).

3.  **`POST /auth/refresh_token`**
    *   **View**: <mcfile name="refreshToken.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\auth\refreshToken.js"></mcfile>
    *   **Descrição**: Gera um novo token de acesso usando um refresh token válido.
    *   **Corpo da Requisição (JSON)**:
        ```json
        {
          "refreshToken": "string (required, JWT)"
        }
        ```
    *   **Resposta (Sucesso - 200 OK)**:
        ```json
        {
          "token": "string (JWT)"
        }
        ```
    *   **Respostas (Erro)**: 400 (Bad Request), 401 (Unauthorized - refresh token inválido/expirado), 500 (Internal Server Error).

4.  **`POST /auth/forgot_password`**
    *   **View**: <mcfile name="forgotPassword.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\auth\forgotPassword.js"></mcfile>
    *   **Descrição**: Inicia o processo de recuperação de senha. Gera um token de reset e (idealmente) o envia para o email do usuário (implementação do envio de email não detalhada aqui).
    *   **Corpo da Requisição (JSON)**:
        ```json
        {
          "email": "string (required, valid email format)"
        }
        ```
    *   **Resposta (Sucesso - 200 OK)**:
        ```json
        {
          "message": "Password reset token generated. Check your email."
        }
        ```
    *   **Respostas (Erro)**: 400 (Bad Request), 404 (Not Found - usuário não encontrado), 500 (Internal Server Error).

5.  **`POST /auth/reset_password`**
    *   **View**: <mcfile name="resetPassword.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\auth\resetPassword.js"></mcfile>
    *   **Descrição**: Define uma nova senha usando o token de reset.
    *   **Corpo da Requisição (JSON)**:
        ```json
        {
          "email": "string (required, valid email format)",
          "token": "string (required, reset token)",
          "password": "string (required, min 8 characters)"
        }
        ```
    *   **Resposta (Sucesso - 200 OK)**:
        ```json
        {
          "message": "Password reset successfully"
        }
        ```
    *   **Respostas (Erro)**: 400 (Bad Request - token inválido/expirado, email não corresponde), 404 (Not Found - usuário não encontrado), 422 (Unprocessable Entity - dados inválidos), 500 (Internal Server Error).

---

### Módulo: Conta do Usuário (`/account`)

*   **Controlador**: <mcfile name="account.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\controllers\account.js"></mcfile>
*   **Middlewares Específicos**:
    *   <mcfile name="auth.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\auth.js"></mcfile>: Garante que apenas usuários autenticados possam acessar estas rotas.
    *   <mcfile name="log.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\log.js"></mcfile>: Registra o acesso a estas rotas.
*   **Views**: <mcfolder name="account" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\account"></mcfolder>

Este módulo permite aos usuários gerenciar suas próprias informações de conta.

**Endpoints:**

1.  **`GET /account`**
    *   **View**: <mcfile name="getUser.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\account\getUser.js"></mcfile>
    *   **Descrição**: Obtém as informações do usuário autenticado (com base no token JWT).
    *   **Parâmetros da Rota**: Nenhum.
    *   **Resposta (Sucesso - 200 OK)**:
        ```json
        {
          "user": { ...objeto do usuário autenticado sem a senha... }
        }
        ```
    *   **Respostas (Erro)**: 401 (Unauthorized - token inválido/ausente), 404 (Not Found - usuário não encontrado), 500 (Internal Server Error).

2.  **`GET /account/:userID`**
    *   **View**: <mcfile name="getUser.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\account\getUser.js"></mcfile>
    *   **Descrição**: Obtém as informações de um usuário específico pelo seu ID. Requer autenticação, mas permite buscar dados de *outro* usuário.
    *   **Parâmetros da Rota**:
        *   `userID` (string, required): O ID do usuário a ser buscado.
    *   **Resposta (Sucesso - 200 OK)**:
        ```json
        {
          "user": { ...objeto do usuário solicitado sem a senha... }
        }
        ```
    *   **Respostas (Erro)**: 401 (Unauthorized - token inválido/ausente), 404 (Not Found - usuário não encontrado), 500 (Internal Server Error).

3.  **`PUT /account`**
    *   **View**: <mcfile name="editAccount.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\account\editAccount.js"></mcfile>
    *   **Descrição**: Atualiza as informações (nome, URL do avatar) do usuário autenticado.
    *   **Corpo da Requisição (JSON)**:
        ```json
        {
          "name": "string (optional, max 16 characters)",
          "avatarUrl": "string (optional, valid image URL, max 255 characters)"
        }
        ```
    *   **Resposta (Sucesso - 200 OK)**:
        ```json
        {
          "user": { ...objeto do usuário atualizado sem a senha... }
        }
        ```
    *   **Respostas (Erro)**: 401 (Unauthorized - token inválido/ausente), 422 (Unprocessable Entity - dados inválidos), 500 (Internal Server Error).

4.  **`DELETE /account`**
    *   **View**: <mcfile name="deleteAccount.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\account\deleteAccount.js"></mcfile>
    *   **Descrição**: Exclui a conta do usuário autenticado e todos os dados associados (vídeos, comentários, linkers, logs).
    *   **Resposta (Sucesso - 204 No Content)**: Corpo vazio.
    *   **Respostas (Erro)**: 401 (Unauthorized - token inválido/ausente), 500 (Internal Server Error).

---

### Módulo: Chat Completions (`/chat/completions`)

*   **Controlador**: <mcfile name="message.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\controllers\message.js"></mcfile>
*   **Middleware Específico**: <mcfile name="log.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\log.js"></mcfile>: Registra o acesso a esta rota.
*   **View**: <mcfile name="sendMessage.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\message\sendMessage.js"></mcfile>

Este módulo atua como um proxy para um serviço de IA (presumivelmente OpenAI ou similar, via `utils/services/ai.js`), encaminhando prompts e retornando as conclusões do modelo.

**Endpoints:**

1.  **`POST /chat/completions`**
    *   **View**: <mcfile name="sendMessage.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\message\sendMessage.js"></mcfile>
    *   **Descrição**: Envia uma série de prompts para um modelo de IA especificado e retorna a resposta.
    *   **Corpo da Requisição (JSON)**:
        ```json
        {
          "model": "string (required, e.g., 'gpt-3.5-turbo')",
          "messages": [
            { "role": "system", "content": "string (optional)" },
            { "role": "user", "content": "string (required)" },
            { "role": "assistant", "content": "string (optional)" },
            ...
          ]
        }
        ```
    *   **Resposta (Sucesso - Varia, e.g., 200 OK)**: A resposta exata depende do serviço de IA subjacente, mas geralmente contém a mensagem gerada pelo assistente.
        ```json
        // Exemplo (estrutura pode variar)
        {
          "id": "chatcmpl-...",
          "object": "chat.completion",
          "created": 1677652288,
          "model": "gpt-3.5-turbo-0613",
          "choices": [{
            "index": 0,
            "message": {
              "role": "assistant",
              "content": "Olá! Como posso ajudar você hoje?"
            },
            "finish_reason": "stop"
          }],
          "usage": {
            "prompt_tokens": 9,
            "completion_tokens": 12,
            "total_tokens": 21
          }
        }
        ```
    *   **Respostas (Erro)**: 422 (Unprocessable Entity - `model` ou `messages` ausentes/inválidos), Erros do serviço de IA (e.g., 4xx, 5xx encaminhados), 500 (Internal Server Error).

---

### Módulo: Linker (`/linkers`)

*   **Controlador**: <mcfile name="linker.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\controllers\linker.js"></mcfile>
*   **Middlewares**: `authMiddleware`, `logMiddleware` (Aplicados a todas as rotas neste controlador)
*   **Views**: <mcfolder name="linker" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\linker"></mcfolder>
*   **Descrição**: Gerencia links curtos/personalizados associados aos usuários autenticados.

*   **`POST /linkers`**
    *   **View**: <mcsymbol name="createOne" filename="createOne.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\linker\createOne.js" startline="4" type="function"></mcsymbol>
    *   **Descrição**: Cria um novo link encurtado.
    *   **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
    *   **Body**:
        ```json
        {
          "label": "meu-link-unico",
          "link": "https://destino.com/url_longa"
        }
        ```
    *   **Resposta (Sucesso - 201)**: `{ "label": "meu-link-unico", "link": "...", "owner": "...", "_id": "...", ... }`
    *   **Resposta (Erro)**: 401, 409 (Label já existe), 422 (Dados inválidos/faltando), 500.

*   **`GET /linkers`** ou **`GET /linkers/by-user`**
    *   **View**: <mcsymbol name="readMany" filename="readMany.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\linker\readMany.js" startline="4" type="function"></mcsymbol>
    *   **Descrição**: Lista os links criados pelo usuário autenticado.
    *   **Headers**: `Authorization: Bearer <token>`
    *   **Resposta (Sucesso - 200)**: `[ { "label": "...", "link": "...", ... }, ... ]`
    *   **Resposta (Erro)**: 401, 404 (Nenhum link encontrado), 500.

*   **`PUT /linkers/:oldLabel`**
    *   **View**: <mcsymbol name="updateOne" filename="updateOne.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\linker\updateOne.js" startline="4" type="function"></mcsymbol>
    *   **Descrição**: Atualiza um link existente.
    *   **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
    *   **Params**: `oldLabel` (O label atual do link a ser modificado)
    *   **Body**:
        ```json
        {
          "label": "novo-label", // Opcional
          "link": "https://novo-destino.com" // Opcional
        }
        ```
    *   **Resposta (Sucesso - 200)**: `{ "label": "novo-label", "link": "...", ... }`
    *   **Resposta (Erro)**: 401, 403 (Não autorizado), 404 (Link não encontrado), 409 (Novo label já existe), 422, 500.

*   **`DELETE /linkers/:label`**
    *   **View**: <mcsymbol name="deleteOne" filename="deleteOne.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\linker\deleteOne.js" startline="4" type="function"></mcsymbol>
    *   **Descrição**: Deleta um link existente.
    *   **Headers**: `Authorization: Bearer <token>`
    *   **Params**: `label` (O label do link a ser deletado)
    *   **Resposta (Sucesso - 204)**: No Content.
    *   **Resposta (Erro)**: 401, 403 (Não autorizado), 404 (Link não encontrado), 500.

---

### Módulo: Acesso via Rótulo (`/access`)

*   **Controlador**: <mcfile name="access.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\controllers\access.js"></mcfile>
*   **Middleware Específico**: <mcfile name="log.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\log.js"></mcfile>: Registra o acesso a esta rota.
*   **View**: <mcfile name="readOne.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\linker\readOne.js"></mcfile> (Reutilizada do módulo Linker)

Este módulo parece fornecer um ponto de acesso simplificado para buscar um link pelo seu rótulo (label), redirecionando para a lógica do módulo Linker.

**Endpoints:**

1.  **`GET /access/:label`**
    *   **View**: <mcfile name="readOne.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\linker\readOne.js"></mcfile>
    *   **Descrição**: Busca um link pelo seu `label` e retorna suas informações. A lógica exata de busca está na view `linker/readOne.js`.
    *   **Parâmetros da Rota**:
        *   `label` (string, required): O rótulo do link a ser buscado.
    *   **Resposta (Sucesso - 200 OK)**:
        ```json
        { ...objeto do link encontrado... }
        ```
    *   **Respostas (Erro)**: 404 (Not Found - link não encontrado), 500 (Internal Server Error). (Nota: A view `linker/readOne.js` pode ter códigos de erro adicionais).

---

### Módulo: Vídeos (`/videos`)

*   **Controlador**: <mcfile name="video.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\controllers\video.js"></mcfile>
*   **Middlewares Específicos**:
    *   <mcfile name="auth.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\auth.js"></mcfile>: Garante que apenas usuários autenticados possam acessar estas rotas.
    *   <mcfile name="log.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\log.js"></mcfile>: Registra o acesso a estas rotas.
    *   <mcfile name="video.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\video.js"></mcfile>: Valida a existência do vídeo em rotas que recebem `:video` como parâmetro (aplicado individualmente em algumas rotas dentro dos submódulos, não globalmente no controlador principal `/videos`).
*   **Views**: <mcfolder name="video" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video"></mcfolder>

Este módulo gerencia o CRUD (Create, Read, Update, Delete) de vídeos, além de listar vídeos populares e recentes.

**Endpoints:**

1.  **`POST /videos`**
    *   **View**: <mcfile name="createOne.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\createOne.js"></mcfile>
    *   **Descrição**: Cria um novo vídeo associado ao usuário autenticado.
    *   **Corpo da Requisição (JSON)**:
        ```json
        {
          "content": "string (required)",
          "coverUrl": "string (required, valid URL)",
          "fileUrl": "string (required, valid URL)"
        }
        ```
    *   **Resposta (Sucesso - 201 Created)**:
        ```json
        { ...objeto do vídeo criado, populado com dados do usuário... }
        ```
    *   **Respostas (Erro)**: 401 (Unauthorized), 422 (Unprocessable Entity - dados inválidos), 500 (Internal Server Error).

2.  **`GET /videos/one/:video`**
    *   **View**: <mcfile name="readOne.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\readOne.js"></mcfile>
    *   **Descrição**: Obtém os detalhes de um vídeo específico pelo seu ID.
    *   **Parâmetros da Rota**:
        *   `video` (string, required, 24 char ObjectId): O ID do vídeo.
    *   **Resposta (Sucesso - 200 OK)**:
        ```json
        { ...objeto do vídeo, populado com dados do usuário... }
        ```
    *   **Respostas (Erro)**: 401 (Unauthorized), 404 (Not Found - vídeo não encontrado), 422 (Unprocessable Entity - ID inválido), 500 (Internal Server Error).

3.  **`GET /videos/popular`**
    *   **View**: <mcfile name="readPopular.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\readPopular.js"></mcfile>
    *   **Descrição**: Lista os vídeos mais populares com base em um cálculo envolvendo likes, comentários e compartilhamentos recentes (últimos 10000 dias, conforme código atual). Retorna até 16 vídeos.
    *   **Resposta (Sucesso - 200 OK)**:
        ```json
        [ { ...objeto do vídeo, populado com dados do usuário... }, ... ]
        ```
    *   **Respostas (Erro)**: 401 (Unauthorized), 404 (Not Found - nenhum vídeo encontrado), 500 (Internal Server Error).

4.  **`GET /videos/recents`**
    *   **View**: <mcfile name="readRecents.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\readRecents.js"></mcfile>
    *   **Descrição**: Lista os vídeos mais recentes, ordenados por data de criação.
    *   **Resposta (Sucesso - 200 OK)**:
        ```json
        [ { ...objeto do vídeo, populado com dados do usuário... }, ... ]
        ```
    *   **Respostas (Erro)**: 401 (Unauthorized), 404 (Not Found - nenhum vídeo encontrado), 500 (Internal Server Error).

5.  **`PUT /videos/:video`**
    *   **View**: <mcfile name="updateOne.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\updateOne.js"></mcfile>
    *   **Descrição**: Atualiza as informações de um vídeo existente. O usuário autenticado deve ser o proprietário do vídeo.
    *   **Parâmetros da Rota**:
        *   `video` (string, required, 24 char ObjectId): O ID do vídeo.
    *   **Corpo da Requisição (JSON)**:
        ```json
        {
          "content": "string (required)",
          "coverUrl": "string (required, valid URL)",
          "fileUrl": "string (required, valid URL)"
        }
        ```
    *   **Resposta (Sucesso - 200 OK)**:
        ```json
        { ...objeto do vídeo atualizado... }
        ```
    *   **Respostas (Erro)**: 401 (Unauthorized), 404 (Not Found - vídeo não encontrado ou usuário não é proprietário), 422 (Unprocessable Entity - dados inválidos), 500 (Internal Server Error).

6.  **`DELETE /videos/:video`**
    *   **View**: <mcfile name="deleteOne.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\deleteOne.js"></mcfile>
    *   **Descrição**: Exclui um vídeo e seus comentários associados. O usuário autenticado deve ser o proprietário do vídeo.
    *   **Parâmetros da Rota**:
        *   `video` (string, required, 24 char ObjectId): O ID do vídeo.
    *   **Resposta (Sucesso - 204 No Content)**: Corpo vazio.
    *   **Respostas (Erro)**: 401 (Unauthorized), 404 (Not Found - vídeo não encontrado ou usuário não é proprietário), 422 (Unprocessable Entity - ID inválido), 500 (Internal Server Error).

---

### Módulo: Likes (`/likes`)

*   **Controlador**: <mcfile name="like.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\controllers\like.js"></mcfile>
*   **Middlewares Específicos**:
    *   <mcfile name="auth.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\auth.js"></mcfile>: Autenticação obrigatória.
    *   <mcfile name="log.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\log.js"></mcfile>: Registro de acesso.
    *   <mcfile name="video.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\video.js"></mcfile>: Valida a existência do vídeo (`:video`) em todas as rotas.
*   **Views**: <mcfolder name="likes" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\likes"></mcfolder>

Gerencia likes em vídeos.

**Endpoints:**

1.  **`POST /likes/:video`**
    *   **View**: <mcfile name="addLike.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\likes\addLike.js"></mcfile>
    *   **Descrição**: Adiciona um like a um vídeo. Impede likes duplicados pelo mesmo usuário.
    *   **Parâmetros da Rota**: `video` (ID do vídeo).
    *   **Resposta (Sucesso - 201 Created)**: Corpo vazio.
    *   **Respostas (Erro)**: 401, 404 (vídeo), 409 (Conflict - já deu like), 422, 500.

2.  **`GET /likes/:video`**
    *   **View**: <mcfile name="countLikes.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\likes\countLikes.js"></mcfile>
    *   **Descrição**: Retorna a contagem de likes de um vídeo.
    *   **Parâmetros da Rota**: `video` (ID do vídeo).
    *   **Resposta (Sucesso - 200 OK)**: `{"likes": number}`
    *   **Respostas (Erro)**: 401, 404 (vídeo), 422, 500.

3.  **`DELETE /likes/:video`**
    *   **View**: <mcfile name="delLike.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\likes\delLike.js"></mcfile>
    *   **Descrição**: Remove o like de um usuário de um vídeo.
    *   **Parâmetros da Rota**: `video` (ID do vídeo).
    *   **Resposta (Sucesso - 204 No Content)**: Corpo vazio.
    *   **Respostas (Erro)**: 401, 404 (vídeo não encontrado ou usuário não deu like), 422, 500.

---


### Módulo: Comentários (`/comments`)

*   **Controlador**: <mcfile name="comment.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\controllers\comment.js"></mcfile>
*   **Middlewares Específicos**:
    *   <mcfile name="auth.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\auth.js"></mcfile>: Autenticação obrigatória.
    *   <mcfile name="log.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\log.js"></mcfile>: Registro de acesso.
    *   <mcfile name="video.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\video.js"></mcfile>: Valida a existência do vídeo (`:video`) em todas as rotas deste módulo.
*   **Views**: <mcfolder name="comments" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\comments"></mcfolder>

Gerencia comentários em vídeos.

**Endpoints:**

1.  **`POST /comments/:video`**
    *   **View**: <mcfile name="addComment.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\comments\addComment.js"></mcfile>
    *   **Descrição**: Adiciona um novo comentário a um vídeo.
    *   **Parâmetros da Rota**: `video` (ID do vídeo).
    *   **Corpo da Requisição (JSON)**: `{"content": "string (required)"}`
    *   **Resposta (Sucesso - 201 Created)**: `{ ...objeto do comentário criado... }`
    *   **Respostas (Erro)**: 401, 404 (vídeo), 422, 500.

2.  **`GET /comments/:video`**
    *   **View**: <mcfile name="countComments.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\comments\countComments.js"></mcfile>
    *   **Descrição**: Retorna a contagem de comentários de um vídeo.
    *   **Parâmetros da Rota**: `video` (ID do vídeo).
    *   **Resposta (Sucesso - 200 OK)**: `{"comments": number}`
    *   **Respostas (Erro)**: 401, 404 (vídeo), 422, 500.

3.  **`DELETE /comments/:video/:comment`**
    *   **View**: <mcfile name="delComment.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\comments\delComment.js"></mcfile>
    *   **Descrição**: Exclui um comentário e suas respostas. O usuário deve ser o autor do comentário.
    *   **Parâmetros da Rota**: `video` (ID do vídeo), `comment` (ID do comentário).
    *   **Resposta (Sucesso - 204 No Content)**: Corpo vazio.
    *   **Respostas (Erro)**: 401, 404 (vídeo ou comentário, ou não autorizado), 422, 500.

---

### Módulo: Respostas a Comentários (`/replys`)

*   **Controlador**: <mcfile name="reply.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\controllers\reply.js"></mcfile>
*   **Middlewares Específicos**:
    *   <mcfile name="auth.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\auth.js"></mcfile>: Autenticação obrigatória.
    *   <mcfile name="log.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\log.js"></mcfile>: Registro de acesso.
    *   <mcfile name="reply.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\reply.js"></mcfile>: Valida IDs em rotas com `:comment` e `:reply` (atualmente comentado no controlador).
*   **Views**: <mcfile name="replyComment.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\comments\replyComment.js"></mcfile>, <mcfile name="delReply.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\comments\delReply.js"></mcfile>

Gerencia respostas a comentários (não a vídeos diretamente).

**Endpoints:**

1.  **`POST /replys/:comment`**
    *   **View**: <mcfile name="replyComment.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\comments\replyComment.js"></mcfile>
    *   **Descrição**: Adiciona uma resposta a um comentário existente. Não é possível responder a uma resposta.
    *   **Parâmetros da Rota**: `comment` (ID do comentário pai).
    *   **Corpo da Requisição (JSON)**: `{"content": "string (required)"}`
    *   **Resposta (Sucesso - 201 Created)**: `{ ...objeto do comentário pai atualizado com a nova resposta... }`
    *   **Respostas (Erro)**: 400 (tentativa de responder a uma resposta), 401, 404 (comentário pai), 422, 500.

2.  **`DELETE /replys/:reply`**
    *   **View**: <mcfile name="delReply.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\comments\delReply.js"></mcfile>
    *   **Descrição**: Exclui uma resposta específica. O usuário deve ser o autor da resposta.
    *   **Parâmetros da Rota**: `reply` (ID da resposta a ser excluída).
    *   **Resposta (Sucesso - 204 No Content)**: Corpo vazio.
    *   **Respostas (Erro)**: 401 (não autorizado), 404 (resposta ou comentário pai não encontrado), 422, 500.

---


### Módulo: Compartilhamentos (`/shares`)

*   **Controlador**: <mcfile name="share.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\controllers\share.js"></mcfile>
*   **Middlewares Específicos**:
    *   <mcfile name="auth.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\auth.js"></mcfile>: Autenticação obrigatória.
    *   <mcfile name="log.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\log.js"></mcfile>: Registro de acesso.
    *   <mcfile name="video.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\video.js"></mcfile>: Valida a existência do vídeo (`:video`) em todas as rotas.
*   **Views**: <mcfolder name="shares" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\shares"></mcfolder>

Gerencia o registro e contagem de compartilhamentos de vídeos.

**Endpoints:**

1.  **`POST /shares/:video`**
    *   **View**: <mcfile name="share.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\shares\share.js"></mcfile>
    *   **Descrição**: Registra um compartilhamento de vídeo. Se o usuário já compartilhou, incrementa um contador extra (`sharesExtras`).
    *   **Parâmetros da Rota**: `video` (ID do vídeo).
    *   **Resposta (Sucesso - 201 Created)**: Corpo vazio.
    *   **Respostas (Erro)**: 401, 404 (vídeo), 422, 500.

2.  **`GET /shares/:video`**
    *   **View**: <mcfile name="countShares.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\video\shares\countShares.js"></mcfile>
    *   **Descrição**: Retorna a contagem de compartilhamentos únicos (`shares`) e compartilhamentos repetidos (`sharesExtras`).
    *   **Parâmetros da Rota**: `video` (ID do vídeo).
    *   **Resposta (Sucesso - 200 OK)**: `{"shares": number, "sharesExtras": number}`
    *   **Respostas (Erro)**: 401, 404 (vídeo), 422, 500.

---

### Módulo: Dashboard (`/dashboard`) - Acesso Restrito

*   **Controlador**: <mcfile name="dashboard.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\controllers\dashboard.js"></mcfile>
*   **Middleware Específico**: <mcfile name="owner.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\owner.js"></mcfile>: Garante que apenas o proprietário (definido pela variável de ambiente `OWNER`) possa acessar estas rotas.
*   **Views**: <mcfolder name="dashboard" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\dashboard"></mcfolder>

Este módulo fornece acesso a funcionalidades administrativas, como visualização de logs.

**Endpoints:**

1.  **`GET /dashboard/logs`**
    *   **View**: <mcfile name="readLogs.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\dashboard\readLogs.js"></mcfile>
    *   **Descrição**: Obtém todos os logs de acesso registrados, ordenados por data de criação (mais recentes primeiro), populando informações do usuário associado.
    *   **Resposta (Sucesso - 200 OK)**:
        ```json
        [ { ...objeto de log, populado com dados do usuário ('_id', 'name', 'email')... }, ... ]
        ```
    *   **Respostas (Erro)**: 401 (Unauthorized - token de proprietário inválido/ausente), 404 (Not Found - nenhum log encontrado), 500 (Internal Server Error).

---


### Módulo: Externo (`/external`)

*   **Controlador**: <mcfile name="external.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\controllers\external.js"></mcfile>
*   **Middleware Específico**: <mcfile name="log.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\middlewares\log.js"></mcfile>: Registra o acesso a esta rota.
*   **View**: <mcfile name="index.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\external\index.js"></mcfile>

Este módulo parece fornecer informações estáticas relacionadas a um serviço externo (vidburner.com).

**Endpoints:**

1.  **`GET /external`**
    *   **View**: <mcfile name="index.js" path="d:\Laptop\Docs\Projetos\Denkitsu\Backend\src\app\views\external\index.js"></mcfile>
    *   **Descrição**: Retorna dados fixos (baseURL, ContentType, Token) relacionados à API do vidburner.com.
    *   **Resposta (Sucesso - 200 OK)**:
        ```json
        {
          "data": {
            "baseURL": "https://vidburner.com/wp-json/aio-dl/video-data",
            "ContentType": "application/x-www-form-urlencoded",
            "Token": "1967fc1a7f7fef915141c3b469d5f7f5df629e8b23aee8ca7c5afb2ae63aa04a"
          }
        }
        ```
    *   **Respostas (Erro)**: 500 (Internal Server Error).

---


