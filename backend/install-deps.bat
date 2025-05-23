@echo off

echo Instalando dependências necessárias...
npm install bcryptjs sqlite3 jsonwebtoken

echo Gerando arquivo .env...
node createEnv.js

echo Instalação e configuração concluídas!
pause 