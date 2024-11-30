# Itens de Configuração do Projeto

Este documento descreve todos os itens e configurações que são parte do controle de versão e estrutura do projeto.

## 1. Código Fonte
- O código-fonte do projeto está dividido em formato MVC.
- A pastas do código fonte são: `/controllers`, `/models`, `/views`, `/middleware` e `main.js`.
- A estrutura do código segue as boas práticas do Node.js e JavaScript, como a organização em módulos e uso de promises/async-await.

## 2. Dependências
- As dependências do projeto estão no arquivo `package.json`.
- As dependências principais incluem:
  - `express`: framework para criar a API.
  - `multer`: middleware para imagens.
  - `mysql2`: conector com o banco. 
  - `dotenv`: para configurar variáveis de ambiente.
  - `stripe`: para receber pagamentos.

## 3. Scripts
- **Scripts de desenvolvimento**:
  - `npm start`: Inicia o servidor Node.js.
  - `npm run dev`: Executa nodemon em modo desenvolvimento.

## 4. Arquivos de Configuração
- **.gitignore**: Define os arquivos e diretórios que não devem ser rastreados pelo Git, como `node_modules/`, arquivos de log, etc.
- **.env**: Contém variáveis de ambiente para configuração do servidor, como banco de dados e chaves secretas.

## 5. Documentação
- **README.md**: Documentação básica do projeto, incluindo como rodar e contribuir.
