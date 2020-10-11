var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
/* GET users listing. */
router.get("/", function (req, res, next) {
    productHelpers.getAllProducts().then((products)=> {
        res.render("admin/view-products", { products, admin: true });
    })
});

router.get("/add-product", (req, res) => {
    res.render("admin/add-products", { admin: true });
});

router.post("/add-products", (req, res) => {
    productHelpers.addProduct(req.body, (id) => {
        let image = req.files.image;
        image.mv(
            "./public/images/product-images/" + id + ".jpg",
            (err) => {
                if (!err) {
                    res.redirect("/admin");
                } else {
                    console.log(err);
                }
            }
        );
    });
});

module.exports = router;
