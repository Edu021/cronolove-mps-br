
# CronoLove

**CronoLove** é uma plataforma para celebrar o amor, permitindo que casais criem páginas personalizadas com fotos, nome, data de início do relacionamento e até uma música especial. Cada página conta com um contador de "quanto tempo estamos juntos" e gera um QR Code exclusivo para fácil compartilhamento.

---

## 🎯 Objetivo

O objetivo do CronoLove é oferecer uma experiência única e emocional para casais, criando uma forma especial de guardar e compartilhar memórias do relacionamento.

---

## 🚀 Como Rodar o Projeto Localmente

Siga os passos abaixo para rodar o projeto localmente em sua máquina:

1. **Clone o repositório**  
   ```bash
   git clone https://github.com/edu021/cronolove-mps-br.git
   ou
   git clone git@github.com:Edu021/cronolove-mps-br.git
   cd cronolove-mps-br
   ```

2. **Instale as dependências**  
   Certifique-se de que o Node.js 20 está instalado.  
   ```bash
   npm install
   ```


3. **Importe o banco de dados**  
   Importe o banco usando o schema `cronolove.sql` na raiz do projeto:
   ```
   mysql -u root
   CREATE DATABASE cronolove;
   EXIT;
   mysql -u root cronolove < cronolove.sql
   ```

4. **Configure as variáveis de ambiente**  
   Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis:  
   ```
   STRIPE_PUBLIC_KEY=
   STRIPE_SECRET_KEY=
   BASE_URL=http://localhost:3000
   EMAIL_USER=conta para envio de emails
   EMAIL_PASS=conta para envio de emails
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=
   DB_NAME=cronolove
   ```

5. **Inicie o servidor**  
   ```bash
   npm start
   ```
   O servidor estará disponível em `http://localhost:3000`.

---

## 🗂 Estrutura de Branches

O projeto utiliza a seguinte estrutura de branches no Git:

- **`main`**  
  Contém a versão estável e pronta para produção.

- **`develop`**  
  Branch principal de desenvolvimento. Todas as novas funcionalidades são integradas aqui antes de serem mescladas na `main`.

- **`feature/<nome-da-feature>`**  
  Branch para desenvolvimento de novas funcionalidades. Sempre derive do `develop`.  
  Exemplo: `feature/adicionar-musica`

- **`hotfix/<nome-do-hotfix>`**  
  Branch para correções críticas diretamente na `main`.  
  Exemplo: `hotfix/ajuste-producao`

---

## 🛠 Tecnologias Utilizadas

- **Node.js**: Backend do site
- **HTML e CSS**: Frontend do site
- **Express.js**: Framework para construção de APIs
- **MySQL**: Banco de dados
- **Stripe**: Integraçao de pagamentos
- **QRCode Library**: Geração de QR Codes
- **Multer**: Controle de imagens no local

---

## 🖼 Demonstração

Você pode conferir o projeto em produção no endereço: [https://cronolove.com.br](https://cronolove.com.br)

---

## 📜 Licença

Este projeto é licenciado sob a [MIT License](LICENSE)
