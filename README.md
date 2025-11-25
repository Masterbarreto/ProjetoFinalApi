# 🥤 Vending Machine API

REST API para gerenciamento de máquina de venda de bebidas com integração para ESP32 e frontend web.

## 📋 Sobre o Projeto

API completa para controle de máquina de vendas automática de bebidas, incluindo:

- **Gerenciamento de Estoque**: Controle de bebidas, marcas e quantidades
- **Integração ESP32**: Sistema de fila de comandos para controle do hardware
- **Persistência MongoDB**: Armazenamento robusto com fallback em memória
- **Validação**: Schemas Yup para garantir integridade dos dados
- **Scripts de Teste**: Suite completa de testes automatizados

## ⚡ Quick Start

```powershell
# 1. Clone o repositório
git clone <repo-url>
cd ApiProjetoFinal

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# 4. Popule o banco de dados com dados de exemplo
npm run seed

# 5. Inicie o servidor
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 🔧 Pré-requisitos

- **Node.js** 18.x ou superior
- **npm** 8.x ou superior
- **MongoDB** 5.0+ (Atlas ou local) - *Opcional, funciona em memória sem MongoDB*

## 📦 Instalação

### 1. Clone o Projeto

```powershell
git clone <repo-url>
cd ApiProjetoFinal
```

### 2. Instale as Dependências

```powershell
npm install
```

### 3. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```powershell
cp .env.example .env
```

**Edite o arquivo `.env` com suas configurações:**

```env
# MongoDB (Opcional - deixe vazio para usar modo em memória)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/
DB_NAME=apiprojetofinal

# Servidor
PORT=3000
```

### 4. Popule o Banco de Dados (Opcional)

Se estiver usando MongoDB, execute o script de seed para criar dados de exemplo:

```powershell
npm run seed
```

Isso criará:
- 3 bebidas (Coca-Cola, Pepsi, Fanta) com estoque inicial
- 3 marcas correspondentes

### 5. Inicie o Servidor

```powershell
npm start
```

O servidor iniciará em `http://localhost:3000` (ou na porta configurada no `.env`).

## 📚 Documentação da API

### Bebidas

#### `GET /bebidas`
Lista todas as bebidas cadastradas.

**Resposta:**
```json
[
  {
    "id": "6924f5033c8d743e9a03454e",
    "name": "Coca-Cola 350ml",
    "type": "Refrigerante",
    "price": 5.5,
    "brand": "Coca-Cola",
    "stock": 10
  }
]
```

#### `POST /bebidas`
Cria uma nova bebida.

**Body:**
```json
{
  "name": "Coca-Cola 350ml",
  "type": "Refrigerante",
  "price": 5.5,
  "brand": "Coca-Cola"
}
```

#### `GET /bebidas/:id`
Busca uma bebida específica por ID.

#### `POST /bebidas/:id/increase?amount=N`
Aumenta o estoque de uma bebida.

**Query Params:**
- `amount` (opcional): Quantidade a aumentar (padrão: 1)

**Resposta:**
```json
{
  "message": "Estoque aumentado",
  "beverage": { /* dados da bebida */ }
}
```

#### `POST /bebidas/:id/decrease?amount=N`
Diminui o estoque de uma bebida.

**Query Params:**
- `amount` (opcional): Quantidade a diminuir (padrão: 1)

#### `GET /bebidas/stock`
Retorna o estoque total de todas as bebidas.

**Resposta:**
```json
{
  "total": 29
}
```

#### `GET /bebidas/stock/brand/:brand`
Retorna o estoque total de uma marca específica.

**Resposta:**
```json
{
  "brand": "Fanta",
  "total": 5
}
```

#### `POST /bebidas/:id/select`
Seleciona uma bebida (cria comando para ESP32).

**Resposta:**
```json
{
  "message": "Bebida selecionada",
  "beverage": { /* dados da bebida */ }
}
```

---

### Marcas

#### `GET /marcas`
Lista todas as marcas cadastradas.

#### `POST /marcas`
Cria uma nova marca.

**Body:**
```json
{
  "name": "Coca-Cola"
}
```

#### `DELETE /marcas/:id`
Remove uma marca por ID.

#### `POST /marcas/:name/release`
Solicita liberação de todas as bebidas de uma marca (cria comando para ESP32).

**Resposta:**
```json
{
  "message": "Release requested for brand Fanta"
}
```

---

### ESP32 Polling

#### `GET /esp32/next`
Endpoint para o ESP32 consultar comandos pendentes.

**Query Params (opcionais):**
- `mode`: `pop` (padrão, consome o comando) ou `peek` (apenas visualiza)
- `ttl`: Tempo em segundos para considerar comando expirado (padrão: sem expiração)

**Resposta com comando:**
```json
{
  "id": "1",
  "ts": 1764031171275,
  "type": "select",
  "payload": {
    "id": "6924f5033c8d743e9a03454e",
    "name": "Coca-Cola 350ml",
    "brand": "Coca-Cola",
    "stock": 16
  }
}
```

**Resposta sem comando:**
- Status: `204 No Content`

**Tipos de comando:**
- `select`: Liberar uma bebida específica (payload contém dados completos da bebida)
- `release`: Liberar qualquer bebida de uma marca (payload contém apenas `brand`)

## 🗄️ Configuração do MongoDB

### MongoDB Atlas (Recomendado para Produção)

1. Crie uma conta gratuita em [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um novo cluster (tier gratuito disponível)
3. Configure acesso à rede:
   - Vá em **Network Access** → **Add IP Address**
   - Para desenvolvimento: adicione `0.0.0.0/0` (qualquer IP)
   - Para produção: adicione apenas IPs específicos
4. Crie um usuário de banco de dados:
   - Vá em **Database Access** → **Add New Database User**
   - Escolha autenticação por senha
   - Salve o usuário e senha
5. Obtenha a string de conexão:
   - Clique em **Connect** no seu cluster
   - Escolha **Connect your application**
   - Copie a string (formato: `mongodb+srv://<username>:<password>@cluster.mongodb.net/`)
6. Atualize o `.env`:
   ```env
   MONGODB_URI=mongodb+srv://seu-usuario:sua-senha@cluster0.xxxxx.mongodb.net/
   DB_NAME=apiprojetofinal
   ```

### MongoDB Local

Se preferir rodar localmente:

```powershell
# Instale o MongoDB Community Server
# Windows: https://www.mongodb.com/try/download/community

# Inicie o serviço
mongod

# Configure o .env
MONGODB_URI=mongodb://localhost:27017
DB_NAME=apiprojetofinal
```

### Modo Sem MongoDB

A API funciona perfeitamente sem MongoDB usando armazenamento em memória:

- Deixe `MONGODB_URI` vazio no `.env`
- Os dados serão perdidos ao reiniciar o servidor
- Ideal para testes e desenvolvimento rápido

## 🧪 Testes

### Script de Testes Automatizado

O projeto inclui um script PowerShell que testa todas as rotas automaticamente:

```powershell
# Com o servidor rodando, execute em outro terminal:
powershell -ExecutionPolicy Bypass -File .\scripts\test-api.ps1
```

O script testa:
- ✅ CRUD de bebidas
- ✅ Gerenciamento de estoque (increase/decrease)
- ✅ Consulta de estoque total e por marca
- ✅ Seleção de bebidas
- ✅ Sistema de fila ESP32
- ✅ CRUD de marcas
- ✅ Comando de release por marca

### Testes Manuais com PowerShell

```powershell
# Listar bebidas
Invoke-RestMethod http://localhost:3000/bebidas

# Criar nova bebida
Invoke-RestMethod -Method Post -Uri http://localhost:3000/bebidas `
  -ContentType "application/json" `
  -Body '{"name":"Sprite 350ml","type":"Refrigerante","price":4.5,"brand":"Sprite"}'

# Aumentar estoque
$id = (Invoke-RestMethod http://localhost:3000/bebidas)[0].id
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/bebidas/$id/increase?amount=5"

# Selecionar bebida (ESP32)
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/bebidas/$id/select"

# ESP32 consultar comando
Invoke-RestMethod http://localhost:3000/esp32/next
```

## 🤖 Integração ESP32

### Comportamento Esperado

O ESP32 deve implementar um loop de polling:

```cpp
// Pseudocódigo
while(true) {
  HTTPClient http;
  http.begin("http://api-url:3000/esp32/next");
  int httpCode = http.GET();
  
  if(httpCode == 200) {
    String payload = http.getString();
    // Parse JSON e execute ação
    if(type == "select") {
      // Liberar bebida específica na posição X
      liberarBebida(payload.id);
    } else if(type == "release") {
      // Liberar primeira bebida da marca
      liberarPorMarca(payload.brand);
    }
  } else if(httpCode == 204) {
    // Nenhum comando pendente
  }
  
  delay(500); // Aguardar 500ms antes da próxima consulta
}
```

### Parâmetros Avançados

```cpp
// Modo peek (não consome o comando)
GET /esp32/next?mode=peek

// Com TTL de 30 segundos (ignora comandos mais antigos)
GET /esp32/next?mode=pop&ttl=30
```

## 📁 Estrutura do Projeto

```
ApiProjetoFinal/
├── src/
│   ├── controllers/
│   │   ├── bebidas/
│   │   │   └── CreatBebidas.js    # Controllers de bebidas
│   │   └── marcas/
│   │       └── MarcasController.js # Controllers de marcas
│   ├── routes/
│   │   ├── index.js                # Agregador de rotas
│   │   ├── bebidas.js              # Rotas de bebidas
│   │   └── marcas.js               # Rotas de marcas
│   ├── server/
│   │   ├── server.js               # Servidor Express
│   │   └── seed.js                 # Script de população do banco
│   ├── db.js                       # Conexão MongoDB
│   └── store.js                    # Camada de dados (MongoDB/Memória)
├── scripts/
│   └── test-api.ps1                # Script de testes automatizado
├── .env.example                    # Exemplo de variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

## 🔒 Segurança

### Recomendações para Produção

- ✅ Use variáveis de ambiente para credenciais
- ✅ Configure CORS adequadamente (lista branca de origens)
- ✅ Implemente rate limiting
- ✅ Adicione autenticação (JWT, API Keys)
- ✅ Use HTTPS em produção
- ✅ Valide e sanitize todas as entradas
- ✅ Configure MongoDB com usuário de acesso restrito

### CORS

O CORS está habilitado para todas as origens em desenvolvimento. Para produção, edite `src/server/server.js`:

```javascript
app.use(cors({
  origin: ['https://seu-frontend.com', 'https://outro-dominio.com']
}));
```

## 🐛 Troubleshooting

### Erro de Conexão MongoDB

```
Error: connect ECONNREFUSED
```

**Solução:**
- Verifique se `MONGODB_URI` está correto no `.env`
- Certifique-se de que o IP está liberado no MongoDB Atlas
- Teste a conexão: `mongosh "sua-connection-string"`

### Porta 3000 em Uso

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solução:**
```powershell
# Windows: Encerre processo na porta 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Ou altere a porta no .env
PORT=3001
```

### Rotas Retornando 404

**Solução:**
- Verifique se o servidor está rodando
- Confirme a URL base: `http://localhost:3000`
- Execute `npm run seed` para popular dados de exemplo

## 📝 Scripts Disponíveis

```powershell
# Iniciar servidor
npm start

# Popular banco de dados
npm run seed
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.

## 💡 Suporte

Para dúvidas e suporte:
- Abra uma [issue](link-para-issues) no GitHub
- Consulte a documentação do [MongoDB](https://docs.mongodb.com/)
- Consulte a documentação do [Express](https://expressjs.com/)

---

**Desenvolvido com ❤️ para o projeto de máquina de venda automática**
#   P r o j e t o F i n a l A p i  
 