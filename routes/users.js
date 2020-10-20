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
    let total = await userHelpers.getTotalAmountCart(req.session.user.userid);
    res.render("user/cart", { product, user, count, total });
});

router.get("/add-to-cart/:id", (req, res) => {
    if (req.session.user) {
        userHelpers
            .addToCart(req.params.id, req.session.user.userid)
            .then((response) => {
                res.json({ status: true });
            });
    } else {
        res.json({ status: false });
    }
});
router.get("/change-quantity/:id/:func", (req, res) => {
    userHelpers
        .changeQuantity(req.params.id, req.params.func, req.session.user.userid)
        .then((response) => {
            res.json(response);
        });
});

router.get("/delete-cart-product/:id", (req, res) => {
    userHelpers
        .deleteCartProduct(req.params.id, req.session.user.userid)
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

router.post("/place-order", verfiylogin, async (req, res) => {
    let total = await userHelpers.getTotalAmountCart(req.session.user.userid);
    userHelpers
        .placeOrder(req.body, req.session.user.userid, total)
        .then(() => {
            res.redirect("/myorders");
        });
});

router.get("/myorders", verfiylogin, (req, res) => {
    let arr = {};
    userHelpers.getMyOrders(req.session.user.userid).then(async (response) => {
        var product = response.result;
        let total = await userHelpers.getTotalAmountOrder(
            req.session.user.userid
        );
        let user = req.session.user;
        let count;
        if (user) {
            count = await userHelpers.getCartCount(req.session.user.userid);
        }
        res.render("user/my-orders", {
            product,
            arr,
            total,
            user,
            count,
        });
    });
});

module.exports = router;
