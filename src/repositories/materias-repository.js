import pkg from 'pg'
import config from './../configs/db-config.js';      // Traigo la configuracion de la base de datos.
import LogHelper from './../helpers/log-helper.js'

const { Pool } = pkg;

export default class MateriasRepository {
    constructor() {
        // Se ejecuta siempre, (al instanciar la clase)
        console.log('Estoy en: MateriasRepository.constructor()');
        this.DBPool = null;
    }

    getDBPool = () => {
        if (this.DBPool == null) {
            this.DBPool = new Pool(config);
        }
        return this.DBPool;
    }

    getAllAsync = async () => {
        console.log(`MateriasRepository.getAllAsync()`);
        let returnArray = null;

        try {
            const sql = `SELECT * FROM materias`;
            const resultPg = await this.getDBPool().query(sql);
            returnArray = resultPg.rows;
        } catch (error) {
            LogHelper.logError(error);
        }
        return returnArray;
    }
    getAllAsyncById = async (id) => {
        console.log(`MateriasRepository.getAllAsyncById(${id})`);
        let returnEntity = null;
        try {
            const sql = `SELECT * FROM materias WHERE id=$1`;
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

    // Backwards-compatible alias expected by other modules
    getByIdAsync = async (id) => {
        return await this.getAllAsyncById(id);
    }

    createAsync = async (entity) => {
        console.log(`MateriasRepository.createAsync(${JSON.stringify(entity)})`);
        let newId = 0;

        try {
            const sql = ` INSERT INTO materias (
                            nombre              
                        ) VALUES (
                            $1
                        ) RETURNING id`;
            const values = [entity?.nombre ?? ''

            ];
            const resultPg = await this.getDBPool().query(sql, values);
            newId = resultPg.rows[0].id;
        } catch (error) {
            LogHelper.logError(error);
        }
        return newId;
    }
    updateAsync = async (entity) => {
        console.log(`MateriasRepository.updateAsync(${JSON.stringify(entity)})`);
        let rowsAffected = 0;
        let id = entity.id;

        try {
            const previousEntity = await this.getByIdAsync(id);
            if (previousEntity == null) return 0;
            const sql = `UPDATE materias SET 
                            nombre              = $2
                        WHERE id = $1`;

            const values = [id,     // $1
                entity?.nombre ?? previousEntity?.nombre
            ];
            const resultPg = await this.getDBPool().query(sql, values);

            rowsAffected = resultPg.rowCount;
        } catch (error) {
            LogHelper.logError(error);
        }
        return rowsAffected;
    }

    deleteByIdAsync = async (id) => {
        console.log(`MateriasRepository.deleteByIdAsync(${id})`);
        let rowsAffected = 0;

        try {
            const sql = `DELETE from materias WHERE id=$1`;
            const values = [id];
            const resultPg = await this.getDBPool().query(sql, values);
            rowsAffected = resultPg.rowCount;
        } catch (error) {
            LogHelper.logError(error);
        }
        return rowsAffected;
    }
}
