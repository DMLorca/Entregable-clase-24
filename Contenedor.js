const Knex = require('knex').default;

class Contenedor{

    constructor(table, options){
        this.knex = Knex(options);
        this.table = table;
    }

    async save(obj){
        try {
        await this.knex(this.table).insert(obj);
        } catch (error) {
            console.log(`Problema en save(): ${error}`);
        }
    }

    async getById(numberId){
        try {
            const dataObjId = await this.knex(this.table).where({"id": numberId});
            if(dataObjId){
                return dataObjId;
            }else{
                return null;
            }
        } catch (error) {
            console.log(`Problema en getById(): ${error}`);      
        }
    }

    async getAll(){
        try {
            const dataObj = await this.knex.from(this.table).select("*");
            return dataObj;
        } catch (error) {
            console.log(`Problema en getAll(): ${error}`);          
        }
    }

    async deleteById(numberId){
        try {
            const result = await this.knex(this.table).where({'id': numberId}).del();

            if (result) {
                return 1;   //Se elimino correctamente
            }else{
                return null;
            }
        } catch (error) {
            console.log(`Problema en deleteById(): ${error}`);            
        }
    }

    async deleteAll(){
        try {
            const result = await this.knex(this.table).del();

            if (result) {
                return 1;   //Se elimino correctamente
            }else{
                return null;
            }
        } catch (error) {
            console.log(`Problema en deleteAll(): ${error}`);
        }
    }
}

module.exports.Contenedor = Contenedor;