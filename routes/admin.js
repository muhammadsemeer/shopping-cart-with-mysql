const { response } = require("express");
var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
/* GET users listing. */
router.get("/", function (req, res, next) {
    productHelpers.getAllProducts().then((products) => {
        res.render("admin/view-products", { products, admin: true });
    });
});

router.get("/add-product", (req, res) => {
    res.render("admin/add-products", { admin: true });
});

router.post("/add-products", (req, res) => {
    productHelpers.addProduct(req.body, (id) => {
        let image = req.files.image;
        image.mv("./public/images/product-images/" + id + ".jpg", (err) => {
            if (!err) {
                res.redirect("/admin");
            } else {
                console.log(err);
            }
        });
    });
});

router.get("/delete-product/:id", (req, res) => {
    let prodId = req.params.id;
    productHelpers.deleteProduct(prodId).then((result) => {
        res.redirect("/admin");
    });
});
router.get("/edit-product/:id", async (req, res) => {
    let prodId = req.params.id;
    let product = await productHelpers.getproductDetails(prodId);
    res.render("admin/edit-product", { product, admin: true });
});
router.post("/edit-product/:id", (req, res) => {
    let id = req.params.id;
    productHelpers.updateProduct(req.body, id).then((response) => {
        if (req.files) {
            let image = req.files.image;
            image.mv("./public/images/product-images/" + id + ".jpg", (err) => {
                if (!err) {
                    res.redirect("/admin");
                } else {
                    console.log(err);
                }
            });
        } else {
            res.redirect("/admin");
        }
    });
});

module.exports = router;
