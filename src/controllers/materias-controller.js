import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import MateriasService from './../services/materias-service.js'
import materias from './../entities/materia.js'
const router = Router();
const currentService = new MateriasService();
router.get('', async (req, res) => {
    try {
        console.log(`MateriasController.get`);
        const returnArray = await currentService.getAllAsync();
        if (returnArray != null) {
            res.status(StatusCodes.OK).json(returnArray);
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error interno.`);
        }
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
    }
});


export default router;
