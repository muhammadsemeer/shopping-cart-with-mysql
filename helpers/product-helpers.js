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
                if (error) throw error;
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
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            var sql = `select ${tables.ORDER_TABLE}.orderID, ${tables.ORDER_TABLE}.quantity, ${tables.ORDER_TABLE}.variant ,${tables.ORDER_TABLE}.orderdate, 
            ${tables.ORDER_TABLE}.deliveryaddress, ${tables.ORDER_TABLE}.deliverymobileno, ${tables.ORDER_TABLE}.deliverydate, 
            ${tables.ORDER_TABLE}.payment, ${tables.ORDER_TABLE}.paid,${tables.ORDER_TABLE}.razorpaypaymentid, ${tables.ORDER_TABLE}.razorpayorderid,${tables.ORDER_TABLE}.pincode, ${tables.PRODCUT_TABLE}.productid, ${tables.PRODCUT_TABLE}.name as productname, 
            ${tables.PRODCUT_TABLE}.brand, ${tables.PRODCUT_TABLE}.category, ${tables.PRODCUT_TABLE}.price, ${tables.PRODCUT_TABLE}.image1, 
            ${tables.USER_TABLE}.userid, ${tables.USER_TABLE}.name as username, ${tables.USER_TABLE}.email, 
            ${tables.ORDER_TABLE}.quantity*${tables.PRODCUT_TABLE}.price as total from 
            ((${tables.ORDER_TABLE} inner join ${tables.PRODCUT_TABLE} 
            on 
            ${tables.PRODCUT_TABLE}.productid = ${tables.ORDER_TABLE}.prodID) 
            inner join ${tables.USER_TABLE} on ${tables.USER_TABLE}.userid = ${tables.ORDER_TABLE}.userID)`;
            await db.query(sql, (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            var sql = `select userid, name, email from ${tables.USER_TABLE} where not admin = 1`;
            db.query(sql, (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    },
    searchProduct: (serach) => {
        return new Promise((resolve, reject) => {
            const { query } = serach;
            var sql = `select * from ${tables.PRODCUT_TABLE} where MATCH(name,brand,category) AGAINST ('${query}')`;
            db.query(sql, (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    },
};
