# Password Generator Backend

A simple backend API for the Password Generator mobile app that handles user authentication and password item management.

## Features

- User authentication (signup, signin) with JWT
- Password item management (create, list, delete)
- SQLite database storage
- UUID generation for IDs
- Password encryption

## Setup

1. Instale as dependências e gere o arquivo `.env` automaticamente executando o script abaixo no Windows (dentro da pasta backend):

```
install-deps.bat
```

Esse script irá:
- Instalar as dependências principais (`bcryptjs`, `sqlite3`, `jsonwebtoken`)
- Gerar automaticamente o arquivo `.env` com as configurações necessárias

2. Inicie o servidor:

```
npm start
```

Ou, para desenvolvimento com auto-reload:

```
npm run dev
```

## Password Encryption

As of the latest update, all passwords stored in the database are now encrypted using AES-256-CBC encryption. This ensures that passwords are securely stored and cannot be read directly from the database.

### Encryption Key

A chave de criptografia é gerada automaticamente no arquivo `.env` pelo script `createEnv.js` ao rodar o `install-deps.bat`.

### Recriando o .env

Se precisar recriar o `.env`, basta rodar:

```
node createEnv.js
```

**Importante:** Se você recriar o `.env`, uma nova chave de criptografia será gerada e você não conseguirá mais descriptografar senhas salvas anteriormente. Faça backup do `.env` se precisar manter os dados.

## API Endpoints

### Authentication

- `POST /api/signup` - Register a new user
  - Payload: `{ email, name, password }`
  - Response: `{ token }`

- `POST /api/signin` - Login existing user
  - Payload: `{ email, password }`
  - Response: `{ token }`

### Password Items

- `POST /api/item` - Create a new password item
  - Headers: `Authorization: Bearer <token>`
  - Payload: `{ name, password }`
  - Response: `{ id, name, message }`

- `GET /api/items` - Get all password items for the logged-in user
  - Headers: `Authorization: Bearer <token>`
  - Response: Array of items

- `DELETE /api/item/:id` - Delete a password item by ID
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ message }` 