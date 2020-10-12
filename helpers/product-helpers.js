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
    deleteProduct: (prodId) => {
        return new Promise(async (resolve, reject) => {
            var sql = `delete from ${tables.PRODCUT_TABLE} where productid = ${prodId}`;
            await db.query(sql, (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    },
    getproductDetails: (prodId) => {
        return new Promise(async (resolve, reject) => {
            var prodIdint = parseInt(prodId);
            var sql = `select * from ${tables.PRODCUT_TABLE} where productid = ${prodIdint}`;
            await db.query(sql, (error, result) => {
                if (error) throw error;
                resolve(result[0]);
            });
        });
    },
    updateProduct: (product, prodId) => {
        var { name, category, description, price } = product;
        price = parseFloat(price);
        var prodIdint = parseInt(prodId);
        return new Promise(async (resolve, reject) => {
            var sql = `update ${tables.PRODCUT_TABLE} set name = '${name}', category= '${category}', description = '${description}', price = ${price} where productid ='${prodIdint}'`;
            await db.query(sql, (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    },
};
