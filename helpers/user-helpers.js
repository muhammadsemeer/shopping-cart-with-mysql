var db = require("../config/connection");
var tables = require("../config/tables");
var bcrypt = require("bcrypt");
const e = require("express");
var cartproID = [];
module.exports = {
    doSignup: (userData) => {
        var { name, email, password } = userData;
        let response = {};
        return new Promise(async (resolve, reject) => {
            password = await bcrypt.hash(password, 10);
            var sql = `select * from ${tables.USER_TABLE} where email = "${email}"`;
            db.query(sql, (error, result) => {
                if (error) throw error;
                if (result.length > 0) {
                    resolve({
                        message:
                            "Already have an account corresponding to this email id",
                    });
                } else {
                    sql = `insert into ${tables.USER_TABLE} (name, email, password) values('${name}','${email}','${password}')`;
                    db.query(sql, (error, result) => {
                        if (error) throw error;
                        if (result) {
                            sql = `select userid, name, email from ${tables.USER_TABLE} where userid = "${result.insertId}"`;
                            db.query(sql, (error, result) => {
                                if (error) throw error;
                                response.user = result[0];
                                response.status = true;
                                resolve(response);
                            });
                        }
                    });
                }
            });
        });
    },
    doLogin: (userData) => {
        let response = {};
        var { email, password } = userData;
        return new Promise(async (resolve, reject) => {
            var sql = `select userid, email, password from ${tables.USER_TABLE} where email = "${email}" `;
            await db.query(sql, (error, result) => {
                if (error) throw error;
                if (result.length > 0) {
                    bcrypt
                        .compare(password, result[0].password)
                        .then((status) => {
                            if (status) {
                                sql = `select userid, name, email, admin from ${tables.USER_TABLE} where email = "${email}"`;
                                db.query(sql, (error, result) => {
                                    if (error) throw error;
                                    response.user = result[0];
                                    response.status = true;
                                    resolve(response);
                                });
                            } else {
                                resolve({
                                    status: false,
                                    message: "Password you entered is wrong",
                                });
                            }
                        });
                } else {
                    resolve({ status: false, message: "User doesn't exit" });
                }
            });
        });
    },
    addToCart: (prodId, userId) => {
        let userIdstring = userId.toString();
        let prodIdint = parseInt(prodId);
        return new Promise(async (resolve, reject) => {
            var sql = `select * from t${userIdstring}`;
            await db.query(sql, (error, result) => {
                if (error) {
                    if (
                        error.sqlMessage ===
                        `Table 'shopping.t${userIdstring}' doesn't exist`
                    ) {
                        sql = `create table t${userIdstring} (prodID int)`;
                        db.query(sql, (error, result) => {
                            if (error) throw error;
                            sql = `insert into t${userIdstring} values(${prodIdint})`;
                            db.query(sql, (error, result) => {
                                if (error) throw error;
                                resolve();
                            });
                        });
                    }
                } else {
                    sql = `insert into t${userIdstring} values(${prodIdint})`;
                    db.query(sql, (error, result) => {
                        if (error) throw error;
                        resolve();
                    });
                }
            });
        });
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            var response = {};
            var sql = `select * from t${userId}`;
            var userIdstring = userId.toString();
            await db.query(sql, async (error, result) => {
                if (error) {
                    if (
                        error.sqlMessage ===
                        `Table 'shopping.t${userIdstring}' doesn't exist`
                    ) {
                        response.status = false;
                        resolve(response);
                    } else {
                        throw error;
                    }
                } else {
                    var sql = `select distinct * from ${tables.PRODCUT_TABLE} inner join t${userId} on ${tables.PRODCUT_TABLE}.productid = t${userId}.prodID`;
                    await db.query(sql, (error, result) => {
                        if (error) throw error;
                        response.status = true;
                        response.result = result;
                        resolve(response);
                        for (let i = 0; i < result.length; i++) {
                            cartproID.push(result[i].prodID);
                        }
                    });
                }
            });
        });
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            var sql = `select * from t${userId}`;
            var userIdstring = userId.toString();
            await db.query(sql, async (error, result) => {
                if (error) {
                    if (
                        error.sqlMessage ===
                        `Table 'shopping.t${userIdstring}' doesn't exist`
                    ) {
                        resolve(0);
                    } else {
                        throw error;
                    }
                } else {
                    sql = `select count(*) as count from t${userId}`;
                    await db.query(sql, (error, result) => {
                        if (error) throw error;
                        resolve(result[0].count);
                    });
                }
            });
        });
    },
    getCartItems: (userId) => {
        return new Promise((resolve, reject) => {
            var itemCount = [];
            for (let i = 0; i < cartproID.length; i++) {
                var sql = `select count(*) as count from t${userId} where prodID = ${cartproID[i]}`;
                query(sql);
            }
            async function query(sql) {
                await db.query(sql, (error, result) => {
                    if (error) throw error;
                    return itemCount.push(result[0].count);
                });
            }
            console.log(itemCount, "inner query");
            resolve(itemCount);
        });
    },
};
