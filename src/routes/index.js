import express from 'express';
import bebidasRoutes from './bebidas.js';
import marcasRoutes from './marcas.js';

const router = express.Router();

router.use('/bebidas', bebidasRoutes);
router.use('/marcas', marcasRoutes);

export default router;