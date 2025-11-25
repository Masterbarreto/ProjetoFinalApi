import "dotenv/config";
import { getDb } from '../db.js';

async function run() {
  if (!process.env.MONGODB_URI) {
    console.log('MONGODB_URI is not set. Seed requires a MongoDB connection.');
    process.exit(1);
  }

  const db = await getDb();
  const bebidas = db.collection('bebidas');
  const marcas = db.collection('marcas');

  await marcas.deleteMany({});
  await bebidas.deleteMany({});

  const marcasData = [
    { name: 'Coca-Cola' },
    { name: 'Pepsi' },
    { name: 'Fanta' },
  ];

  await marcas.insertMany(marcasData);

  const bebidasData = [
    { name: 'Coca-Cola 350ml', type: 'Refrigerante', price: 5.5, brand: 'Coca-Cola', stock: 10 },
    { name: 'Pepsi 350ml', type: 'Refrigerante', price: 5.0, brand: 'Pepsi', stock: 8 },
    { name: 'Fanta Laranja 350ml', type: 'Refrigerante', price: 4.5, brand: 'Fanta', stock: 5 },
  ];

  const result = await bebidas.insertMany(bebidasData);
  console.log('Seed completed. Inserted', result.insertedCount, 'bebidas.');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
