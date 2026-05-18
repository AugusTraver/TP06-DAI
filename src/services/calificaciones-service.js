    import CalificacionesRepository from '../repositories/calificaciones-repository.js';
    export default class CalificacionesService {
        constructor() {
            console.log('Estoy en: CalificacionesService.constructor()');
            this.CalificacionesRepository = new CalificacionesRepository();
        }
    
        getAllAsync = async () => {
            console.log(`CalificacionesService.getAllAsync()`);
            const returnArray = await this.CalificacionesRepository.getAllAsync();
            if (returnArray == null) return null;
            return returnArray;
        }
    
        getByIdAsync = async (id) => {
            console.log(`CalificacionesService.getByIdAsync(${id})`);
            const returnEntity = await this.CalificacionesRepository.getByIdAsync(id);
            return returnEntity;
        }
    
        createAsync = async (entity) => {
            console.log(`CalificacionesService.createAsync(${JSON.stringify(entity)})`);
            const rowsAffected = await this.CalificacionesRepository.createAsync(entity);
            return rowsAffected;
        }
    
        updateAsync = async (entity) => {
            console.log(`CalificacionesService.updateAsync(${JSON.stringify(entity)})`);
            if (entity.id_curso) {
                await this.validarCursoExiste(entity.id_curso);
            }
            
            const rowsAffected = await this.CalificacionesRepository.updateAsync(entity);
            return rowsAffected;
        }
    
        deleteByIdAsync = async (id) => {
            console.log(`CalificacionesService.deleteByIdAsync(${id})`);
            const rowsAffected = await this.CalificacionesRepository.deleteByIdAsync(id);
            return rowsAffected;
        }
    
        validarCalificacionExiste = async (idCal) => {
            if (!idCal) return; // Early return
            const cal = await this.getByIdAsync(idCal);
            if (cal == null) {
                throw new Error(`La calificación con id ${idCal} no existe.`);
            }
        }
    }
