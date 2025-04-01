# Gerador de Senhas Mobile

Um aplicativo mobile simples para gerar senhas seguras, desenvolvido com React Native e Expo.

![Tela do aplicativo](https://github.com/eqMoura01/gerador-de-senha-mobile/blob/main/assets/screenshot.png)

## Funcionalidades

- Geração de senhas aleatórias e seguras
- Interface limpa e minimalista
- Cópia de senha com um toque
- Histórico das últimas senhas geradas
- Funcionalidade para limpar a senha atual e o histórico

## Pré-requisitos

Para executar este projeto, você precisará ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (versão 14.0 ou superior)
- [npm](https://www.npmjs.com/) (normalmente vem com o Node.js)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Um dispositivo físico com [Expo Go](https://expo.dev/client) instalado ou um emulador Android/iOS

## Instalação

Siga estas etapas para configurar o ambiente de desenvolvimento:

1. Clone o repositório:
```bash
git clone https://github.com/eqMoura01/gerador-de-senha-mobile.git
cd gerador-de-senha-mobile
```

2. Instale as dependências:
```bash
npm install
```

## Executando o aplicativo

Para iniciar o aplicativo em modo de desenvolvimento:

```bash
npx expo start
```

Após executar o comando acima:

- Para dispositivos físicos: Escaneie o QR code com o app Expo Go (Android) ou câmera (iOS)
- Para emulador Android: Pressione `a` no terminal onde o Expo está rodando
- Para emulador iOS: Pressione `i` no terminal onde o Expo está rodando

## Dependências principais

- React Native: ^0.76.8
- Expo: ~52.0.42
- React Navigation: ^6.1.9
- @expo/vector-icons: ^14.0.2
- expo-clipboard: ~7.0.1

## Estrutura do projeto

```
gerador-de-senhas/
├── assets/                  # Imagens e recursos estáticos
├── src/                     # Código fonte
│   ├── components/          # Componentes reutilizáveis
│   │   ├── PasswordGenerator.js
│   │   └── PasswordHistory.js
│   ├── services/            # Serviços e lógica de negócios
│   │   └── passwordGenerator.js
│   └── views/               # Telas do aplicativo
│       └── HomeScreen.js
├── App.js                   # Ponto de entrada do aplicativo
├── app.json                 # Configuração do Expo
└── package.json             # Dependências e scripts
```

## Ambiente de desenvolvimento

Este projeto foi desenvolvido com as seguintes ferramentas:

- Cursor IDE
- Expo SDK 52
- React Native 0.76.8
- Node.js 18.x

## Autor

[Victor Mora](https://github.com/eqMoura01)

---

**Nota**: Este aplicativo é apenas para fins educacionais e não armazena ou transmite senhas para servidores externos. 