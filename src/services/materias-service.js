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
}