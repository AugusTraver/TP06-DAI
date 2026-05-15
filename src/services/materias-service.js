    import MateriasRepository from '../repositories/materias-repository.js';

export default class MateriasService {    
   constructor() {
        console.log('Estoy en: MateriasService.constructor()');
        this.MateriasRepository = new MateriasRepository();
    }

    getAllAsync = async () => {
        console.log(`MateriasService.getAllAsync()`);
        const returnArray = await this.MateriasRepository.getAllAsync();
        return returnArray;
    }
    getAllAsyncById = async (id) => {
        console.log(`MateriasService.getAllAsyncById()`);
        const returnArray = await this.MateriasRepository.getAllAsyncById(id);
        return returnArray;
    }
    updateAsync = async (entity) => {
        console.log(`MateriasService.updateAsync()`);
        const returnArray = await this.MateriasRepository.updateAsync(entity);
        return returnArray;
    }
    deleteByIdAsync = async (id) => {
        console.log(`MateriasService.deleteByIdAsync()`);
        const returnArray = await this.MateriasRepository.deleteByIdAsync(id);
        return returnArray;
    }
    
}
