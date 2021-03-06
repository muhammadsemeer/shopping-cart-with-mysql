const { response } = require("express");
var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var userHelpers = require("../helpers/user-helpers");
const verfiylogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect("/login");
    }
};
/* GET home page. */
router.get("/", async (req, res) => {
    let user = req.session.user;
    let count = 0;
    if (user) {
        count = await userHelpers.getCartCount(req.session.user.userid);
    }
    productHelpers.getAllProducts().then((products) => {
        res.render("user/view-products", { products, user, count });
    });
});
router.get("/login", (req, res) => {
    if (req.session.loggedIn) {
        res.redirect("/");
    } else {
        res.render("user/login", { error: req.session.loginErr });
        req.session.loginErr = null;
    }
});
router.get("/signup", (req, res) => {
    res.render("user/signup", { error: req.session.loginErr });
    req.session.loginErr = null;
});
router.post("/signup", (req, res) => {
    userHelpers.doSignup(req.body).then((response) => {
        if (response.status) {
            req.session.loggedIn = true;
            req.session.user = response.user;
            res.redirect("/");
        } else {
            req.session.loginErr = response.message;
            res.redirect("/signup");
        }
    });
});
router.post("/login", (req, res) => {
    userHelpers.doLogin(req.body).then((response) => {
        if (response.status) {
            req.session.loggedIn = true;
            req.session.user = response.user;
            res.redirect("/");
        } else {
            req.session.loginErr = response.message;
            res.redirect("/login");
        }
    });
});
router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});
router.get("/cart", verfiylogin, async (req, res) => {
    let user = req.session.user;
    let arr = [];
    let product = {};
    if (user) {
        count = await userHelpers.getCartCount(req.session.user.userid);
    }
    await userHelpers
        .getCartProducts(req.session.user.userid)
        .then(async (response) => {
            if (response) {
                product = response.result;
            }
        });
    let total;
    if (product) {
        total = await userHelpers.getTotalAmountCart(req.session.user.userid);
    }
    res.render("user/cart", { product, user, count, total });
});

router.get("/add-to-cart/:id/:variant", (req, res) => {
    if (req.session.user) {
        userHelpers
            .addToCart(req.params, req.session.user.userid)
            .then((response) => {
                res.json({ status: true });
            });
    } else {
        res.json({ status: false });
    }
});
router.get("/change-quantity/:id/:func/:variant", (req, res) => {
    userHelpers
        .changeQuantity(
            req.params.id,
            req.params.func,
            req.params.variant,
            req.session.user.userid
        )
        .then((response) => {
            res.json(response);
        });
});

router.get("/delete-cart-product/:id/:variant", (req, res) => {
    userHelpers
        .deleteCartProduct(
            req.params.id,
            req.params.variant,
            req.session.user.userid
        )
        .then((response) => {
            res.json({ status: true });
        });
});

router.get("/place-order", verfiylogin, async (req, res) => {
    let user = req.session.user;
    let count;
    if (user) {
        count = await userHelpers.getCartCount(req.session.user.userid);
    }
    let total = await userHelpers.getTotalAmountCart(req.session.user.userid);
    res.render("user/place-order", { total, user, count });
});

router.post("/place-order", async (req, res) => {
    if (req.session.user) {
        userHelpers
            .placeOrder(req.body, req.session.user.userid)
            .then((orderId) => {
                if (req.body.paymentmethod === "COD") {
                    res.json({ status: "Placed" });
                } else {
                    res.json({ status: "Pending" });
                }
            });
    } else {
        res.json({ status: false });
    }
});

router.get("/myorders", verfiylogin, (req, res) => {
    let arr = {};
    userHelpers.getMyOrders(req.session.user.userid).then(async (response) => {
        var product = response.result;
        let user = req.session.user;
        let count;
        if (user) {
            count = await userHelpers.getCartCount(req.session.user.userid);
        }
        res.render("user/my-orders", {
            product,
            arr,
            user,
            count,
        });
    });
});

router.get("/profile", verfiylogin, (req, res) => {
    userHelpers.getProfile(req.session.user.userid).then((response) => {
        res.render("user/profile", {
            userDetails: response,
            user: req.session.user,
        });
    });
});
router.get("/profile/edit/", verfiylogin, async (req, res) => {
    let userDetails = await userHelpers.getProfile(req.session.user.userid);
    console.log(userDetails);
    res.render("user/edit-profile", {
        userDetails,
        error: req.session.updateErr,
        user: req.session.user,
    });
    req.session.updateErr = null;
});
router.post("/profile/edit", verfiylogin, (req, res) => {
    userHelpers
        .updateProfile(req.body, req.session.user.userid)
        .then((response) => {
            res.redirect("/profile");
        })
        .catch((error) => {
            req.session.updateErr = error.message;
            res.redirect("/profile/edit/" + req.session.user.userid);
        });
});
router.get("/change-password/", verfiylogin, (req, res) => {
    res.render("user/change-password", { user: req.session.user });
});
router.post("/change-password", verfiylogin, (req, res) => {
    userHelpers
        .changePassword(req.body, req.session.user.userid)
        .then((response) => {
            res.redirect("/login");
        })
        .catch((error) => {
            req.session.updateErr = error.message;
            res.render("user/change-password", {
                user: req.session.user,
                error: req.session.updateErr,
            });
            req.session.updateErr = null;
        });
});

router.post("/payment", (req, res) => {
    if (req.session.user) {
        userHelpers
            .generateRazorpay(req.query.orderId, req.query.amount)
            .then((response) => {
                require("dotenv").config();
                res.json({ response, key: process.env.RAZORPAY_KEY_ID });
            });
    }
});

router.post("/verifyPayment", (req, res) => {
    console.log(req.body);
    userHelpers
        .verifyPayment(req.body.payment)
        .then((response) => {
            userHelpers
                .changePaymentStatus(
                    req.body.order.receipt,
                    req.body.payment,
                    req.body.method
                )
                .then((response) => {
                    res.json({ status: true });
                });
        })
        .catch((err) => {
            res.json({ status: false });
        });
});

router.get("/search", async (req, res) => {
    let user = req.session.user;
    let count = 0;
    if (user) {
        count = await userHelpers.getCartCount(req.session.user.userid);
    }
    userHelpers.searchProduct(req.query).then((products) => {
        res.render("user/view-products", {
            products,
            user,
            count,
            query: req.query.query,
        });
    });
});

router.post("/cancelorder/:id", verfiylogin, (req, res) => {
    userHelpers
        .cancelOrder(req.params.id)
        .then((response) => {
            res.json({ status: true });
        })
        .catch((err) => {
            res.json({ status: false });
        });
});

module.exports = router;
