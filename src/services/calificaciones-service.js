    import CalificacionesRepository from '../repositories/calificaciones-repository.js';
    import AlumnosService from './alumnos-service.js';
    import MateriasService from './materias-service.js';
    import { StatusCodes } from 'http-status-codes';

    export default class CalificacionesService {
        constructor() {
            console.log('Estoy en: CalificacionesService.constructor()');
            this.CalificacionesRepository = new CalificacionesRepository();
            this.AlumnosService = new AlumnosService();
            this.MateriasService = new MateriasService();
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
            // 1 - validar nota
            const nota = entity?.nota;
            if (nota === undefined || nota === null || !Number.isInteger(nota) || nota < 0 || nota > 10) {
                const err = new Error('La nota debe ser un número entero entre 0 y 10.');
                err.status = StatusCodes.BAD_REQUEST;
                throw err;
            }

            // 2 - validar alumno existe
            const idAlumno = entity?.id_alumno;
            if (!idAlumno) {
                const err = new Error(`El alumno con id ${idAlumno} no existe.`);
                err.status = StatusCodes.BAD_REQUEST;
                throw err;
            }
            const alumno = await this.AlumnosService.getByIdAsync(idAlumno);
            if (alumno == null) {
                const err = new Error(`El alumno con id ${idAlumno} no existe.`);
                err.status = StatusCodes.BAD_REQUEST;
                throw err;
            }

            // 3 - validar materia existe
            const idMateria = entity?.id_materia;
            if (!idMateria) {
                const err = new Error(`La materia con id ${idMateria} no existe.`);
                err.status = StatusCodes.BAD_REQUEST;
                throw err;
            }
            const materia = await this.MateriasService.getByIdAsync(idMateria);
            if (materia == null) {
                const err = new Error(`La materia con id ${idMateria} no existe.`);
                err.status = StatusCodes.BAD_REQUEST;
                throw err;
            }

            // 4 - validar duplicado
            const existing = await this.CalificacionesRepository.getByAlumnoAndMateriaAsync(idAlumno, idMateria);
            if (existing != null) {
                const err = new Error(`Ya existe una calificación para el alumno ${idAlumno} en la materia ${idMateria}.`);
                err.status = StatusCodes.CONFLICT;
                throw err;
            }

            const newId = await this.CalificacionesRepository.createAsync(entity);
            return newId;
        }
    
        updateAsync = async (entity) => {
            console.log(`CalificacionesService.updateAsync(${JSON.stringify(entity)})`);
            const id = entity?.id;
            const previous = await this.getByIdAsync(id);
            if (previous == null) {
                const err = new Error(`No se encontró la calificación (id: ${id}).`);
                err.status = StatusCodes.NOT_FOUND;
                throw err;
            }

            if (entity.nota !== undefined) {
                const nota = entity.nota;
                if (!Number.isInteger(nota) || nota < 0 || nota > 10) {
                    const err = new Error('La nota debe ser un número entero entre 0 y 10.');
                    err.status = StatusCodes.BAD_REQUEST;
                    throw err;
                }
            }

            // only nota and fecha are allowed; repository will enforce
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
        getByAlumnoAsync = async (idAlumno) => {
            if (!idAlumno) return null;
            // validar alumno existe
            const alumno = await this.AlumnosService.getByIdAsync(idAlumno);
            if (alumno == null) {
                const err = new Error(`El alumno con id ${idAlumno} no existe.`);
                err.status = StatusCodes.NOT_FOUND;
                throw err;
            }
            const lista = await this.CalificacionesRepository.getByAlumnoAsync(idAlumno);
            return lista;
        }
    }
