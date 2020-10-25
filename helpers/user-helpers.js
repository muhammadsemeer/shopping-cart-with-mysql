var db = require("../config/connection");
var tables = require("../config/tables");
var bcrypt = require("bcrypt");
var Razorpay = require("razorpay");
const { reject, resolve } = require("promise");
require("dotenv").config();
var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
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
            console.log(process.env.DB);
            var sql = `select * from t${userIdstring}`;
            await db.query(sql, (error, result) => {
                if (error) {
                    if (
                        error.sqlMessage ===
                        `Table '${process.env.DB}.t${userIdstring}' doesn't exist`
                    ) {
                        sql = `create table t${userIdstring} (prodID bigint,quantity int)`;
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
                        `Table '${process.env.DB}.t${userIdstring}' doesn't exist`
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
                        `Table '${process.env.DB}.t${userIdstring}' doesn't exist`
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
    getTotalAmountCart: (userId) => {
        let userIdstring = userId.toString();
        return new Promise(async (resolve, reject) => {
            var sql = `select ${tables.PRODCUT_TABLE}.price*t${userIdstring}.quantity as total from ${tables.PRODCUT_TABLE} inner join t${userIdstring} on ${tables.PRODCUT_TABLE}.productid = t${userIdstring}.prodID`;
            db.query(sql, (error, result) => {
                if (error) throw error;
                if (result.length > 0) {
                    resolve(result[0].total);
                } else {
                    resolve();
                }
            });
        });
    },
    placeOrder: (orderDetails, userID) => {
        var { address, mobileno, pincode, paymentmethod } = orderDetails;
        var status = paymentmethod === "COD" ? "Order Placed" : "Pending";
        var userIdstring = userID.toString();
        var orderdate = new Date();
        var deliverydate = new Date();
        deliverydate.setDate(deliverydate.getDate() + 7);
        return new Promise(async (resolve, reject) => {
            var sql = `select * from t${userIdstring}`;
            await db.query(sql, (error, result) => {
                if (error) throw error;
                result.forEach((data) => {
                    sql = `insert into ${
                        tables.ORDER_TABLE
                    } (userID, prodID, quantity, orderdate,deliveryaddress, deliverymobileno, deliverydate, payment, pincode, status) values (${userIdstring},${
                        data.prodID
                    },${
                        data.quantity
                    },'${orderdate.toDateString()}','${address}',${mobileno},'${deliverydate.toDateString()}','${paymentmethod}',${pincode}, '${status}')`;
                    db.query(sql, (error, result) => {
                        if (error) throw error;
                        sql = `delete from t${userIdstring}`;
                        db.query(sql, (error, result1) => {
                            resolve(result.insertId);
                        });
                    });
                });
            });
        });
    },
    getMyOrders: (userID) => {
        let response = {};
        return new Promise(async (resolve, reject) => {
            var sql = `select *, ${tables.ORDER_TABLE}.quantity*${tables.PRODCUT_TABLE}.price as total from ${tables.ORDER_TABLE} inner join ${tables.PRODCUT_TABLE} on ${tables.PRODCUT_TABLE}.productid = ${tables.ORDER_TABLE}.prodID and ${tables.ORDER_TABLE}.userID = ${userID}`;
            await db.query(sql, (error, result) => {
                if (error) throw error;
                if (result.length > 0) {
                    response.status = true;
                    response.result = result;
                    resolve(response);
                } else {
                    response.status = false;
                    resolve(response);
                }
            });
        });
    },
    getTotalAmountOrder: (userId) => {
        return new Promise(async (resolve, reject) => {
            var sql = `select sum(${tables.PRODCUT_TABLE}.price*${tables.ORDER_TABLE}.quantity) as total from ${tables.PRODCUT_TABLE} inner join ${tables.ORDER_TABLE} on ${tables.ORDER_TABLE}.userID = ${userId} and ${tables.PRODCUT_TABLE}.productid = ${tables.ORDER_TABLE}.prodID`;
            db.query(sql, (error, result) => {
                if (error) throw error;
                resolve(result[0].total);
            });
        });
    },
    getProfile: (userId) => {
        return new Promise(async (resolve, reject) => {
            var sql = `select userid, name, email from ${tables.USER_TABLE} where userid = ${userId}`;
            await db.query(sql, (error, result) => {
                if (error) throw error;
                resolve(result[0]);
            });
        });
    },
    updateProfile: (userDetials, userId) => {
        const { name, email } = userDetials;
        return new Promise((resolve, reject) => {
            var sql = `update ${tables.USER_TABLE} set name = '${name}', email = '${email}' where userid = ${userId}`;
            db.query(sql, (error, result) => {
                if (error) {
                    if (error.errno === 1062) {
                        reject({
                            message:
                                "This Mail id is already registered by another user",
                        });
                    } else {
                        reject({
                            message: "Something Went Wrong Try Again Later!!!!",
                        });
                    }
                } else {
                    resolve();
                }
            });
        });
    },
    changePassword: (newpass, userId) => {
        var { expassword, newpassword, conpassword } = newpass;
        return new Promise((resolve, reject) => {
            var sql = `select password from ${tables.USER_TABLE} where userid = ${userId}`;
            db.query(sql, (error, result) => {
                if (error) throw error;
                if (result.length > 0) {
                    bcrypt
                        .compare(expassword, result[0].password)
                        .then(async (status) => {
                            if (status) {
                                newpassword = await bcrypt.hash(
                                    newpassword,
                                    10
                                );
                                sql = `update ${tables.USER_TABLE} set password = '${newpassword}' where userId = ${userId}`;
                                db.query(sql, (error, result) => {
                                    if (error) throw error;
                                    resolve({ status: true });
                                });
                            } else {
                                reject({
                                    status: false,
                                    message: "Check Your Current Password",
                                });
                            }
                        });
                } else {
                    reject({
                        status: false,
                        message: "Something Went Wrong!!!!!!",
                    });
                }
            });
        });
    },
    generateRazorpay: (orderId) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: 50000, // amount in the smallest currency unit
                currency: "INR",
                receipt: "order_rcptid_11",
            };
            instance.orders.create(options, (err, order) =>{
                console.log(order);
            });
        });
    },
};
