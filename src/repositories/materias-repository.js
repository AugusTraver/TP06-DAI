import pkg from 'pg'
import config from './../configs/db-config.js';      // Traigo la configuracion de la base de datos.
import LogHelper from './../helpers/log-helper.js'

const { Pool } = pkg;

export default class MateriasRepository {
    constructor() {
        // Se ejecuta siempre, (al instanciar la clase)
        console.log('Estoy en: MateriasRepository.constructor()');
        this.DBPool     = null;
    }

    getDBPool = () => {
        if (this.DBPool == null){
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
}
