# Portfólio — Next.js

Portfólio full stack de David Cruz, construído com Next.js App Router, TypeScript e Tailwind CSS.

## Desenvolvimento

1. Copie `.env.example` para `.env.local`.
2. Preencha as variáveis necessárias.
3. Instale e execute:

```bash
npm install
npm run dev
```

Sem `GITHUB_TOKEN`, o ambiente local consulta apenas repositórios públicos. Sem as chaves do Turnstile, a verificação é ignorada somente em desenvolvimento. O chat exige `GEMINI_API_KEY`.

## Variáveis

- `GITHUB_TOKEN`: token server-side para consultar projetos públicos e privados.
- `GITHUB_USERNAME`: usuário proprietário dos repositórios.
- `GEMINI_API_KEY`: chave server-side do assistente comercial.
- `TURNSTILE_SECRET_KEY`: segredo de validação do Cloudflare Turnstile.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: site key pública do widget.
- `NEXT_PUBLIC_SITE_URL`: URL canônica, como `https://seu-dominio.com`.

Cadastre as mesmas variáveis na Vercel antes do primeiro deploy. Nunca use o prefixo `NEXT_PUBLIC_` nos tokens privados.

## Qualidade

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Os testes unitários ficam em `tests/unit`. O build usa Webpack explicitamente porque o binding local do Turbopack apresentou incompatibilidade no Windows; a aplicação continua compatível com a Vercel.

## Regra da vitrine

A vitrine consulta repositórios do proprietário, remove nomes iniciados por `portfolio`, `davidhscruz`, `escala` ou `projetos` e publica somente projetos com tópicos preenchidos. Repositórios privados aprovados podem aparecer, mas token e URL privada nunca são enviados ao navegador.
