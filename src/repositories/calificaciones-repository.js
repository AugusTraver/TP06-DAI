import pkg from 'pg'
import config from './../configs/db-config.js';      // Traigo la configuracion de la base de datos.
import LogHelper from './../helpers/log-helper.js'

const { Pool } = pkg;



export default class CalificacionesRepository {
    constructor() {
        // Se ejecuta siempre, (al instanciar la clase)
        console.log('Estoy en: CalificacionesRepository.constructor()');
        this.DBPool = null;
    }

    getDBPool = () => {
        if (this.DBPool == null) {
            this.DBPool = new Pool(config);
        }
        return this.DBPool;
    }

    getAllAsync = async () => {
        console.log(`CalificacionesRepository.getAllAsync()`);
        let returnArray = null;

        try {
            const sql = `
                SELECT c.id,
                       c.id_alumno,
                       a.nombre AS nombre_alumno,
                       a.apellido AS apellido_alumno,
                       c.id_materia,
                       m.nombre AS nombre_materia,
                       c.nota,
                       c.fecha
                FROM calificaciones c
                JOIN alumnos a ON a.id = c.id_alumno
                JOIN materias m ON m.id = c.id_materia
                ORDER BY c.id`;
            const resultPg = await this.getDBPool().query(sql);
            returnArray = resultPg.rows;
        } catch (error) {
            LogHelper.logError(error);
        }
        return returnArray;
    }
    getByIdAsync = async (id) => {
        console.log(`CalificacionesRepository.getByIdAsync(${id})`);
        let returnEntity = null;
        try {
            const sql = `
                SELECT c.id,
                       c.id_alumno,
                       a.nombre AS nombre_alumno,
                       a.apellido AS apellido_alumno,
                       c.id_materia,
                       m.nombre AS nombre_materia,
                       c.nota,
                       c.fecha
                FROM calificaciones c
                JOIN alumnos a ON a.id = c.id_alumno
                JOIN materias m ON m.id = c.id_materia
                WHERE c.id = $1`;
            const values = [id];
            const resultPg = await this.getDBPool().query(sql, values);
            if (resultPg.rows.length > 0) {
                returnEntity = resultPg.rows[0];
            }
        } catch (error) {
            LogHelper.logError(error);
        }
        return returnEntity;
    }
    createAsync = async (entity) => {
        console.log(`CalificacionesRepository.createAsync(${JSON.stringify(entity)})`);
        let newId = 0;

        try {
            const sql = ` INSERT INTO calificaciones (
                             id_alumno              , 
                             id_materia           , 
                             nota            , 
                             fecha 
                             
                         ) VALUES (
                             $1, 
                             $2, 
                             $3, 
                             $4
                         ) RETURNING id`;
            const values = [
                entity?.id_alumno ?? 0,
                entity?.id_materia ?? 0,
                entity?.nota ?? 0,
                entity?.fecha ?? new Date()
            ];
            const resultPg = await this.getDBPool().query(sql, values);
            newId = resultPg.rows[0].id;
        } catch (error) {
            LogHelper.logError(error);
        }
        return newId;
    }
    getByAlumnoAsync = async (idAlumno) => {
        console.log(`CalificacionesRepository.getByAlumnoAsync(${idAlumno})`);
        let returnArray = null;
        try {
            const sql = `
                SELECT c.id,
                       c.id_materia,
                       m.nombre AS nombre_materia,
                       c.nota,
                       c.fecha
                FROM calificaciones c
                JOIN materias m ON m.id = c.id_materia
                WHERE c.id_alumno = $1
                ORDER BY c.id`;
            const values = [idAlumno];
            const resultPg = await this.getDBPool().query(sql, values);
            returnArray = resultPg.rows;
        } catch (error) {
            LogHelper.logError(error);
        }
        return returnArray;
    }

    getByAlumnoAndMateriaAsync = async (idAlumno, idMateria) => {
        console.log(`CalificacionesRepository.getByAlumnoAndMateriaAsync(${idAlumno}, ${idMateria})`);
        let returnEntity = null;
        try {
            const sql = `SELECT * FROM calificaciones WHERE id_alumno = $1 AND id_materia = $2`;
            const values = [idAlumno, idMateria];
            const resultPg = await this.getDBPool().query(sql, values);
            if (resultPg.rows.length > 0) returnEntity = resultPg.rows[0];
        } catch (error) {
            LogHelper.logError(error);
        }
        return returnEntity;
    }
    updateAsync = async (entity) => {
        console.log(`CalificacionesRepository.updateAsync(${JSON.stringify(entity)})`);
        let rowsAffected = 0;
        let id = entity.id;

        try {
            const previousEntity = await this.getByIdAsync(id);
            if (previousEntity == null) return 0;
            const sql = `UPDATE calificaciones SET 
                                 nota = $2, 
                                 fecha = $3
                             WHERE id = $1`;

            const values = [
                id,
                entity?.nota ?? previousEntity?.nota,
                entity?.fecha ?? previousEntity?.fecha
            ];
            const resultPg = await this.getDBPool().query(sql, values);

            rowsAffected = resultPg.rowCount;
        } catch (error) {
            LogHelper.logError(error);
        }
        return rowsAffected;
    }
    deleteByIdAsync = async (id) => {
        console.log(`CalificacionesRepository.deleteByIdAsync(${id})`);
        let rowsAffected = 0;
        
        try {
            const sql = `DELETE from calificaciones WHERE id=$1`;
            const values = [id];
            const resultPg = await this.getDBPool().query(sql, values);
            rowsAffected = resultPg.rowCount;
        } catch (error) {
            LogHelper.logError(error);
        }
        return rowsAffected;
    }

}