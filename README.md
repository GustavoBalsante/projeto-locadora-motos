# Balsante Motos - Sistema de Locação de Alta Performance

Um sistema completo e unificado de gerenciamento e locação de motocicletas de alta performance. A aplicação simula o ecossistema de uma locadora premium, contando com um cockpit completo de telemetria para os clientes e um painel analítico para os administradores da frota.

---

##  Tecnologias Utilizadas

### Frontend
*   **React** (com TypeScript)
*   **Vite** (Build tool de alta performance)
*   **CSS In JS / Custom Animations** (Interface inspirada em cockpits de fibra de carbono com efeitos glitch e scanners laser)

### Backend
*   **Node.js** & **Express** (REST API robusta)
*   **MySQL** (Banco de dados relacional para persistência de dados)
*   **JWT (JSON Web Tokens)** (Autenticação e controle de sessão segura)
*   **Bcrypt** (Criptografia rígida de senhas)
*   **Multer** (Gerenciamento e upload de arquivos de imagem da frota)
*   **Dotenv** (Isolamento de variáveis de ambiente e segurança de credenciais)

---

##  Diferenciais Técnicos & Funcionalidades

*    **Segurança Avançada:** Senhas criptografadas com salt-hash e credenciais críticas do banco de dados 100% isoladas em variáveis de ambiente (`.env`).
*    **RBAC (Role-Based Access Control):** Rotas administrativas protegidas por middlewares. Apenas usuários com perfil `ADMIN` acessam o cockpit de métricas e o cadastro de novas máquinas.
*    **Dashboard em Tempo Real:** Módulo analítico que consolida o faturamento total da empresa, quantidade de contratos ativos e total de motos na frota.
*    **Trava Operacional por CPF:** O sistema valida algoritmicamente o CPF do condutor e impede que um mesmo CPF realize múltiplos aluguéis simultâneos.
*    **Simulador de Telemetria:** Efeito integrado no ecossistema que simula a oscilação orgânica de RPM do motor em marcha lenta direto no HUD principal.

---

##  Como Executar o Projeto Localmente

### Pré-requisitos
*   Node.js instalado
*   Instância do MySQL ativa

### 1. Clonar e Configurar o Repositório
```bash
git clone [https://github.com/GustavoBalsante/projeto-locadora-motos.git](https://github.com/GustavoBalsante/projeto-locadora-motos.git)
cd projeto-locadora-motos