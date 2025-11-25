import express from "express";
import {
	creatBebidas,
	listBebidas,
	getBebida,
	selectBebida,
	increaseStock,
	decreaseStock,
	stockCount,
	stockCountByBrand,
} from "../controllers/bebidas/CreatBebidas.js";

const router = express.Router();

// List and create (root routes)
router.get("/", listBebidas);
router.post("/", creatBebidas);

// Stock totals (specific paths before /:id)
router.get('/stock', stockCount);
router.get('/stock/brand/:brand', stockCountByBrand);

// Specific actions on bebidas (before generic /:id)
router.post('/:id/increase', increaseStock);
router.post('/:id/decrease', decreaseStock);
router.post("/:id/select", selectBebida);

// Generic get by id (must be last)
router.get("/:id", getBebida);

export default router;