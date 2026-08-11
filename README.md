# Confeita

Confeita é uma plataforma de confeitaria com foco em receitas, descoberta de conteúdos, comunidade e experiência visual acolhedora. O projeto foi pensado para parecer um produto real, com navegação simples, cards apetitosos e um sistema de apoio contextual para ajudar na cozinha sem roubar o protagonismo da experiência principal.

## Visão Geral

- Home com receitas em destaque, busca e filtros por categoria
- Área para aproveitar ingredientes que já existem em casa
- Confeitarias próximas com cards e informações úteis
- Comunidade com níveis, publicações e progressão
- Login para liberar comentários nas receitas
- Assistência contextual para dúvidas de preparo e substituições

## Stack

- HTML
- CSS
- JavaScript
- Node.js com `server.js`

## Estrutura Principal

- `confeita-identidade.html` - homepage principal
- `receita.html` - página de receita com comentários e autenticação
- `comunidade.html` - feed da comunidade e evolução por níveis
- `chat.html` - área de ajuda contextual
- `login.html` - acesso à conta
- `perfil.html` - perfil do usuário
- `cozinhar.html` - modo cozinhar
- `app.js` - interações do front-end
- `theme.css` - identidade visual e layout
- `server.js` - servidor local e API
- `assets/` - imagens, logos e ícones

## Como Rodar Localmente

1. Abra uma terminal na pasta do projeto.
2. Inicie o servidor:

```bash
npm run dev
```

3. Acesse no navegador:

```text
http://localhost:3000/confeita-identidade.html
```

## Rotas Úteis

- `/confeita-identidade.html` - home
- `/receita.html` - receita
- `/comunidade.html` - comunidade
- `/chat.html` - ajuda contextual
- `/login.html` - login
- `/perfil.html` - perfil
- `/cozinhar.html` - modo cozinhar

## Funcionalidades

### Home

- Hero com foco em receitas e descoberta
- Busca por receitas e ingredientes
- Filtros por categoria
- Bloco de aproveitamento de ingredientes
- Confeitarias próximas
- Comunidade e desafios

### Receita

- Hero da receita com imagem de destaque
- Temporizador de preparo
- Tabs para ingredientes, modo de preparo e comentários
- Login obrigatório para comentar

### Comunidade

- Publicações por nível
- Filtro por dificuldade
- Sistema de progressão e XP

### Ajuda Contextual

- Conversa assistida para dúvidas rápidas
- Suporte para técnicas, substituições e ajuste de receitas

## Banco e API

O projeto inclui um servidor local em Node.js para:

- autenticação de usuários
- sessão via token
- comentários nas receitas

Os dados locais ficam em `data/`.

## Observações

- O projeto foi desenhado para priorizar confeitaria, receitas e comunidade.
- A ajuda contextual existe como recurso complementar.
- A interface foi ajustada para funcionar bem em notebook e desktop, sem perder a responsividade.

## Licença

Projeto pessoal de demonstração.
