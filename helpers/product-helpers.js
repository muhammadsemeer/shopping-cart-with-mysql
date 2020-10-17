const { resolve } = require("promise");
var db = require("../config/connection");
var tables = require("../config/tables");
module.exports = {
    addProduct: (product, images, callback) => {
        console.log(images[0].name);
        console.log(images[1].name);
        console.log(images[2].name);
        var { name, brand, category, description, price } = product;
        price = parseFloat(price);
        var sql = `insert into ${tables.PRODCUT_TABLE} (name,brand,category,description,price,image1,image2,image3) values("${name}","${brand}","${category}", "${description}", ${price} ,"${images[0].name}" ,"${images[1].name}" ,"${images[2].name}")`;
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
        var { name, brand, category, description, price } = product;
        price = parseFloat(price);
        var prodIdint = parseInt(prodId);
        return new Promise(async (resolve, reject) => {
            var sql = `update ${tables.PRODCUT_TABLE} set name = '${name}', brand = '${brand}' ,category= '${category}', description = '${description}', price = ${price} where productid ='${prodIdint}'`;
            await db.query(sql, (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    },
    editProductImage: (details, file) => {
        var { imageno, prodID } = details;
        var prodIDint = parseInt(prodID);
        return new Promise(async (resolve, reject) => {
            var sql = `update ${tables.PRODCUT_TABLE} set ${imageno} = '${file.name}' where productid = ${prodIDint}`;
            await db.query(sql, (error, result) => {
                if (error) throw error;
                resolve();
            });
        });
    },
};
