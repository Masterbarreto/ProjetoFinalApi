# 🥤 Vending Machine API

REST API para gerenciamento de máquina de venda de bebidas com integração para ESP32 e frontend web.

## 📋 Sobre o Projeto

API completa para controle de máquina de vendas automática de bebidas, incluindo:

* **Gerenciamento de Estoque**: controle de bebidas, marcas e quantidades
* **Integração ESP32**: fila de comandos para interação com hardware
* **Persistência MongoDB**: armazenamento robusto com fallback para memória
* **Validação**: schemas Yup garantindo integridade
* **Testes Automatizados**: suite completa para validar todo o fluxo

## ⚡ Quick Start

```powershell
# 1. Clone o repositório
git clone <repo-url>
cd ApiProjetoFinal

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env

# 4. Popule o banco com dados iniciais (opcional)
npm run seed

# 5. Inicie o servidor
npm start
```

Servidor disponível em `http://localhost:3000`.

## 🔧 Pré-requisitos

* **Node.js** 18+
* **npm** 8+
* **MongoDB** 5.0+ (Atlas ou local) — *opcional; sem Mongo roda em memória*

## 📦 Instalação

### 1. Clone o Projeto

```powershell
git clone <repo-url>
cd ApiProjetoFinal
```

### 2. Instale Dependências

```powershell
npm install
```

### 3. Configure o `.env`

Crie e edite:

```powershell
cp .env.example .env
```

```env
# MongoDB (opcional — vazio = modo memória)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/
DB_NAME=apiprojetofinal

# Servidor
PORT=3000
```

### 4. Popule o Banco (Opcional)

```powershell
npm run seed
```

Gera:

* 3 bebidas
* 3 marcas

### 5. Inicie o Servidor

```powershell
npm start
```

---

## 📚 Documentação da API

### **Bebidas**

#### `GET /bebidas`

Lista todas as bebidas.

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

Cria nova bebida.

```json
{
  "name": "Coca-Cola 350ml",
  "type": "Refrigerante",
  "price": 5.5,
  "brand": "Coca-Cola"
}
```

#### `GET /bebidas/:id`

Busca bebida por ID.

#### `POST /bebidas/:id/increase?amount=N`

Aumenta o estoque.
`amount` opcional (padrão = 1).

```json
{
  "message": "Estoque aumentado",
  "beverage": { ... }
}
```

#### `POST /bebidas/:id/decrease?amount=N`

Reduz estoque.

#### `GET /bebidas/stock`

Retorna estoque total.

```json
{
  "total": 29
}
```

#### `GET /bebidas/stock/brand/:brand`

Estoque total por marca.

```json
{
  "brand": "Fanta",
  "total": 5
}
```

#### `POST /bebidas/:id/select`

Cria comando para o ESP32.

```json
{
  "message": "Bebida selecionada",
  "beverage": { ... }
}
```

---

### **Marcas**

#### `GET /marcas`

Lista todas.

#### `POST /marcas`

Cria marca.

```json
{
  "name": "Coca-Cola"
}
```

#### `DELETE /marcas/:id`

Remove marca.

#### `POST /marcas/:name/release`

Cria comando de liberação por marca.

```json
{
  "message": "Release requested for brand Fanta"
}
```

---

### **ESP32**

#### `GET /esp32/next`

Polling de comandos.

Parâmetros opcionais:

* `mode=pop|peek` (padrão = pop)
* `ttl=segundos`

Exemplo com comando:

```json
{
  "id": "1",
  "ts": 1764031171275,
  "type": "select",
  "payload": { ... }
}
```

Sem comando → `204 No Content`.

---

## 🗄️ Configuração do MongoDB

### **Atlas (produção)**

Passos:

1. Criar cluster
2. Liberar IP
3. Criar usuário
4. Copiar connection string
5. Ajustar `.env`

### **MongoDB local**

```powershell
mongod
```

`.env`:

```env
MONGODB_URI=mongodb://localhost:27017
DB_NAME=apiprojetofinal
```

### **Sem MongoDB**

Deixe `MONGODB_URI` vazio → modo memória.

---

## 🧪 Testes

### Automatizados

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\test-api.ps1
```

Cobre:

* CRUD bebidas
* increase/decrease
* total/por marca
* select ESP32
* fila ESP32
* CRUD marcas
* release por marca

### Manuais

```powershell
Invoke-RestMethod http://localhost:3000/bebidas
```

Criação:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/bebidas `
  -ContentType "application/json" `
  -Body '{"name":"Sprite 350ml","type":"Refrigerante","price":4.5,"brand":"Sprite"}'
```

---

## 🤖 Integração ESP32

Loop:

```cpp
while(true) {
  HTTPClient http;
  http.begin("http://api-url:3000/esp32/next");
  int code = http.GET();

  if(code == 200) {
    // Executa ação
  }

  delay(500);
}
```

Extras:

```
GET /esp32/next?mode=peek
GET /esp32/next?mode=pop&ttl=30
```

---

## 📁 Estrutura do Projeto

```
ApiProjetoFinal/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── server/
│   ├── db.js
│   └── store.js
├── scripts/
│   └── test-api.ps1
├── .env.example
├── package.json
└── README.md
```

---

## 🔒 Segurança

* Use `.env`
* Restrinja CORS
* JWT / API Key
* HTTPS
* Rate limiting
* Sanitização de entrada

```js
app.use(cors({
  origin: ['https://seu-frontend.com']
}));
```

---

## 🐛 Troubleshooting

### MongoDB não conecta

Verifique `MONGODB_URI` e permissões Atlas.

### Porta ocupada

```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Rotas 404

Servidor offline ou URL incorreta.

---

## 📝 Scripts

```powershell
npm start
npm run seed
```

---

## 🤝 Contribuição

Fluxo padrão GitHub.

---

## 📄 Licença

ISC.

---

**Desenvolvido com ❤️ para o projeto de máquina de venda automática.**
