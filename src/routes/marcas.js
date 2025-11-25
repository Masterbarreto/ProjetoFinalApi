import express from "express";
import {
	listMarcas,
	createMarca,
	deleteMarca,
	releaseByBrand,
} from "../controllers/marcas/MarcasController.js";

const router = express.Router();

router.get('/', listMarcas);
router.post('/', createMarca);
router.delete('/', deleteMarca);
router.delete('/:id', deleteMarca);

// When a brand is clicked the frontend can call this to request a release.
// The ESP32 will poll `/esp32/next` and receive this release command.
router.post('/:name/release', releaseByBrand);

export default router;