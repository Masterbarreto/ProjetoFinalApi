import store from '../../store.js';

export const listMarcas = async (req, res) => {
  const list = await store.listMarcas();
  return res.json(list);
};

export const createMarca = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Nome da marca é obrigatório' });
  const created = await store.createMarca(name);
  return res.status(201).json(created);
};

export const deleteMarca = async (req, res) => {
  // Accept deletion by param id, or by query/body name for flexibility
  const { id } = req.params;
  const nameFromQuery = req.query && req.query.name;
  const nameFromBody = req.body && req.body.name;
  const target = id || nameFromQuery || nameFromBody;
  if (!target) return res.status(400).json({ message: 'Id ou nome da marca é necessário' });
  const deleted = await store.deleteMarcaById(target);
  if (!deleted) return res.status(404).json({ message: 'Marca não encontrada' });
  return res.json({ message: 'Marca removida', marca: deleted });
};

export const releaseByBrand = async (req, res) => {
  const { name } = req.params;
  store.pushEsp32Command({ type: 'release', payload: { brand: name } });
  return res.json({ message: `Release requested for brand ${name}` });
};
