var db = require("../config/connection");
var tables = require("../config/tables");
var bcrypt = require("bcrypt");
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
                        sql = `create table t${userIdstring} (prodID int,quantity int)`;
                        db.query(sql, (error, result) => {
                            if (error) throw error;
                            sql = `insert into t${userIdstring} values(${prodIdint} , 1)`;
                            db.query(sql, (error, result) => {
                                if (error) throw error;
                                resolve();
                            });
                        });
                    }
                } else if (result.length > 0) {
                    sql = `update t${userIdstring} set quantity = quantity + 1 where prodID = ${prodId}`;
                    db.query(sql, (error, result) => {
                        if (error) throw error;
                        if (
                            result.message ===
                            "(Rows matched: 0  Changed: 0  Warnings: 0"
                        ) {
                            // console.log("1");
                            sql = `insert into t${userIdstring} values(${prodIdint} , 1)`;
                            db.query(sql, (error, result) => {
                                if (error) throw error;
                                resolve();
                            });
                        } else {
                            resolve();
                        }
                    });
                } else {
                    sql = `insert into t${userIdstring} values(${prodIdint} , 1)`;
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
                    var sql = `select * from ${tables.PRODCUT_TABLE} inner join t${userId} on ${tables.PRODCUT_TABLE}.productid = t${userId}.prodID`;
                    await db.query(sql, (error, result) => {
                        if (error) throw error;
                        response.status = true;
                        response.result = result;
                        resolve(response);
                        // console.log(result);
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
                    sql = `select  sum(quantity) as sum from t${userId}`;
                    await db.query(sql, (error, result) => {
                        if (error) throw error;
                        resolve(result[0].sum);
                    });
                }
            });
        });
    },
    changeQuantity: (prodId, func, userId) => {
        return new Promise(async (resolve, reject) => {
            let userIdstring = userId.toString();
            let prodIdint = parseInt(prodId);
            if (func === "inc") {
                var sql = `update t${userIdstring} set quantity = quantity + 1 where prodID = ${prodIdint}`;
                db.query(sql, (error, result) => {
                    if (error) throw error;
                    resolve(true);
                });
            } else {
                var sql = `update t${userIdstring} set quantity = quantity - 1 where prodID = ${prodIdint}`;
                db.query(sql, (error, result) => {
                    if (error) throw error;
                    resolve(false);
                });
            }
        });
    },
    deleteCartProduct: (prodId, userId) => {
        return new Promise(async (resolve, reject) => {
            let userIdstring = userId.toString();
            let prodIdint = parseInt(prodId);
            var sql = `delete from t${userIdstring} where prodID = ${prodIdint}`;
            db.query(sql, (error, result) => {
                if (error) throw error;
                resolve();
            });
        });
    },
    buyOneItem: (userId, prodId, query) => {
        var quantity = parseInt(query.quantity);
        var userIdInt = parseInt(userId);
        var prodIdInt = parseInt(prodId);
        return new Promise(async (resolve, reject) => {
            var sql = `insert into ${tables.ORDER_TABLE} (userID,prodID,quantity) values(${userIdInt},${prodIdInt},${quantity})`;
            await db.query(sql, async (error, result) => {
                if (error) throw error;
                sql = `delete from t${userId} where prodID = ${prodIdInt}`;
                await db.query(sql, (error, result) => {
                    if (error) throw error;
                    resolve();
                    console.log(result);
                });
            });
        });
    },
};
