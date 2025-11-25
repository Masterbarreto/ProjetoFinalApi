import * as yup from "yup";
import store from "../../store.js";

export const creatBebidas = async (req, res) => {
    const schema = yup.object().shape({
        name: yup.string().required(),
        type: yup.string().required(),
        price: yup.number().required().positive(),
        brand: yup.string().required(),
    });

    try {
        await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
        return res.status(400).json({
            message: "Erro de validação",
            errors: err.errors,
        });
    }

    const created = await store.createBebida(req.body);
    return res.status(201).json(created);
};

export const listBebidas = async (req, res) => {
    const list = await store.listBebidas();
    return res.json(list);
};

export const getBebida = async (req, res) => {
    const { id } = req.params;
    const b = await store.getBebidaById(id);
    if (!b) return res.status(404).json({ message: "Bebida não encontrada" });
    return res.json(b);
};

export const selectBebida = async (req, res) => {
    const { id } = req.params;
    const b = await store.getBebidaById(id);
    if (!b) return res.status(404).json({ message: "Bebida não encontrada" });

    // push a command for the ESP32 to pick up
    store.pushEsp32Command({ type: 'select', payload: b });
    return res.json({ message: 'Bebida selecionada', beverage: b });
};

export const increaseStock = async (req, res) => {
    const { id } = req.params;
    // Accept amount from body or query to make clients simpler
    const amountFromBody = req.body && (req.body.amount ?? req.body.Amount);
    const amountFromQuery = req.query && (req.query.amount ?? req.query.Amount);
    const amt = Number(amountFromBody ?? amountFromQuery) || 1;
    const updated = await store.increaseStock(id, amt);
    if (!updated) return res.status(404).json({ message: 'Bebida não encontrada' });
    return res.json({ message: 'Estoque aumentado', beverage: updated });
};

export const decreaseStock = async (req, res) => {
    const { id } = req.params;
    // Accept amount from body or query to make clients simpler
    const amountFromBody = req.body && (req.body.amount ?? req.body.Amount);
    const amountFromQuery = req.query && (req.query.amount ?? req.query.Amount);
    const amt = Number(amountFromBody ?? amountFromQuery) || 1;
    const updated = await store.decreaseStock(id, amt);
    if (!updated) return res.status(404).json({ message: 'Bebida não encontrada' });
    return res.json({ message: 'Estoque reduzido', beverage: updated });
};

export const stockCount = async (req, res) => {
    const total = await store.stockCount();
    return res.json({ total });
};

export const stockCountByBrand = async (req, res) => {
    const { brand } = req.params;
    const total = await store.stockCountByBrand(brand);
    return res.json({ brand, total });
};