var db = require("../config/connection");
var tables = require("../config/tables");
module.exports = {
    addProduct: (product, callback) => {
        var { name, category, description, price } = product;
        price = parseFloat(price);
        var sql = `insert into ${tables.PRODCUT_TABLE} (name,category,description,price) values("${name}","${category}", "${description}", ${price})`;
        db.query(sql, (error, result) => {
            if (error) throw error;
            callback(result.insertId);
        });
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            var sql = `select * from ${tables.PRODCUT_TABLE}`;
            await db.query(sql, (error, result) => {
                resolve(result);
            });
        });
    },
};
