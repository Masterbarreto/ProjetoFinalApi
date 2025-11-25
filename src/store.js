import { ObjectId } from 'mongodb';
import { getDb } from './db.js';

// In-memory fallback
const mem = {
  bebidas: [],
  marcas: [],
  nextId: 1,
};

const esp32Queue = [];
let esp32NextId = 1;

let useMongo = Boolean(process.env.MONGODB_URI);

async function ensureCollections() {
  if (!useMongo) return null;
  const db = await getDb();
  return {
    bebidas: db.collection('bebidas'),
    marcas: db.collection('marcas'),
  };
}

export async function createBebida(data) {
  if (useMongo) {
    const { bebidas, marcas } = await ensureCollections();
    // ensure marca exists
    if (data.brand) {
      await marcas.updateOne({ name: data.brand }, { $setOnInsert: { name: data.brand } }, { upsert: true });
    }
    const toInsert = { ...data, stock: typeof data.stock === 'number' ? data.stock : 0 };
    const result = await bebidas.insertOne(toInsert);
    const doc = await bebidas.findOne({ _id: result.insertedId });
    return { id: doc._id.toString(), ...doc };
  }

  const item = { id: String(mem.nextId++), ...data, stock: typeof data.stock === 'number' ? data.stock : 0 };
  mem.bebidas.push(item);
  if (data.brand && !mem.marcas.find(m => m.name === data.brand)) {
    mem.marcas.push({ id: String(mem.nextId++), name: data.brand });
  }
  return item;
}

export async function listBebidas() {
  if (useMongo) {
    const { bebidas } = await ensureCollections();
    const docs = await bebidas.find({}).toArray();
    return docs.map(d => ({ id: d._id.toString(), ...d }));
  }
  return mem.bebidas;
}

export async function getBebidaById(id) {
  if (useMongo) {
    const { bebidas } = await ensureCollections();
    try {
      const doc = await bebidas.findOne({ _id: new ObjectId(id) });
      if (!doc) return null;
      return { id: doc._id.toString(), ...doc };
    } catch (err) {
      return null;
    }
  }
  return mem.bebidas.find(b => b.id === String(id));
}

export async function listMarcas() {
  if (useMongo) {
    const { marcas } = await ensureCollections();
    const docs = await marcas.find({}).toArray();
    return docs.map(d => ({ id: d._id?.toString?.() || d.name, ...d }));
  }
  return mem.marcas;
}

export async function createMarca(name) {
  if (useMongo) {
    const { marcas } = await ensureCollections();
    const result = await marcas.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
    // return created/found doc
    const doc = await marcas.findOne({ name });
    return { id: doc._id?.toString?.() || name, ...doc };
  }
  const exists = mem.marcas.find(m => m.name === name);
  if (exists) return exists;
  const item = { id: String(mem.nextId++), name };
  mem.marcas.push(item);
  return item;
}

export async function deleteMarcaById(idOrName) {
  if (useMongo) {
    const { marcas } = await ensureCollections();
    // try by ObjectId first
    let query = null;
    try {
      query = { _id: new ObjectId(idOrName) };
    } catch (err) {
      query = { name: idOrName };
    }
    const result = await marcas.findOneAndDelete(query);
    if (!result) return null;
    return { id: result._id?.toString?.() || result.name, ...result };
  }
  const idx = mem.marcas.findIndex(m => m.id === String(idOrName) || m.name === idOrName);
  if (idx === -1) return null;
  const [removed] = mem.marcas.splice(idx, 1);
  return removed;
}

export async function increaseStock(id, amount = 1) {
  if (useMongo) {
    const { bebidas } = await ensureCollections();
    try {
      const result = await bebidas.findOneAndUpdate({ _id: new ObjectId(id) }, { $inc: { stock: Math.abs(Number(amount) || 1) } }, { returnDocument: 'after' });
      if (!result) return null;
      return { id: result._id.toString(), ...result };
    } catch (err) {
      return null;
    }
  }
  const b = mem.bebidas.find(b => b.id === String(id));
  if (!b) return null;
  b.stock = (Number(b.stock) || 0) + Math.abs(Number(amount) || 1);
  return b;
}

export async function decreaseStock(id, amount = 1) {
  if (useMongo) {
    const { bebidas } = await ensureCollections();
    try {
      const result = await bebidas.findOneAndUpdate({ _id: new ObjectId(id) }, { $inc: { stock: -Math.abs(Number(amount) || 1) } }, { returnDocument: 'after' });
      if (!result) return null;
      // ensure stock not negative
      if (result.stock < 0) {
        await bebidas.updateOne({ _id: result._id }, { $set: { stock: 0 } });
        result.stock = 0;
      }
      return { id: result._id.toString(), ...result };
    } catch (err) {
      return null;
    }
  }
  const b = mem.bebidas.find(b => b.id === String(id));
  if (!b) return null;
  b.stock = Math.max(0, (Number(b.stock) || 0) - Math.abs(Number(amount) || 1));
  return b;
}

export async function stockCount() {
  if (useMongo) {
    const { bebidas } = await ensureCollections();
    const agg = await bebidas.aggregate([{ $group: { _id: null, total: { $sum: { $ifNull: ['$stock', 0] } } } }]).toArray();
    return agg[0]?.total ?? 0;
  }
  return mem.bebidas.reduce((s, b) => s + (Number(b.stock) || 0), 0);
}

export async function stockCountByBrand(brand) {
  if (useMongo) {
    const { bebidas } = await ensureCollections();
    const agg = await bebidas.aggregate([
      { $match: { brand } },
      { $group: { _id: '$brand', total: { $sum: { $ifNull: ['$stock', 0] } } } }
    ]).toArray();
    return agg[0]?.total ?? 0;
  }
  return mem.bebidas.filter(b => b.brand === brand).reduce((s, b) => s + (Number(b.stock) || 0), 0);
}

export function pushEsp32Command(cmd) {
  // store commands with timestamp and internal id
  const entry = { id: String(esp32NextId++), ts: Date.now(), ...cmd };
  esp32Queue.push(entry);
  return entry;
}

export function popEsp32Command(options = {}) {
  // options: { mode: 'pop'|'peek', ttlSeconds: number }
  const mode = options.mode || 'pop';
  const ttl = Number(options.ttlSeconds) || 0;

  // remove expired entries if ttl provided
  if (ttl > 0) {
    const now = Date.now();
    for (let i = esp32Queue.length - 1; i >= 0; i--) {
      const item = esp32Queue[i];
      if (now - item.ts > ttl * 1000) {
        esp32Queue.splice(i, 1);
      }
    }
  }

  if (esp32Queue.length === 0) return null;

  if (mode === 'peek') {
    return esp32Queue[0];
  }

  // default pop: remove and return first
  return esp32Queue.shift() || null;
}

export default {
  createBebida,
  listBebidas,
  getBebidaById,
  listMarcas,
  createMarca,
  deleteMarcaById,
  increaseStock,
  decreaseStock,
  stockCount,
  stockCountByBrand,
  pushEsp32Command,
  popEsp32Command,
};
