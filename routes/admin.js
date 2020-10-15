var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
/* GET users listing. */
const verifyAdmin = (req, res, next) => {
    if (req.session.user) {
        if (req.session.user.admin) {
            next();
        } else {
            res.redirect("/");
        }
    } else {
        res.redirect("/login");
    }
};
router.get("/", /* verifyAdmin ,*/ function (req, res, next) {
    productHelpers.getAllProducts().then((products) => {
        res.render("admin/view-products", { products, admin: true });
    });
});

router.get("/add-product",/* verifyAdmin ,*/ (req, res) => {
    res.render("admin/add-products", { admin: true });
});

router.post("/add-products",/* verifyAdmin ,*/ (req, res) => {
    productHelpers.addProduct(req.body, req.files.image, (id) => {
        let image = req.files.image;
        for (let i = 0; i < image.length; i++) {
            image[i].mv(
                "./public/images/product-images/" + image[i].name + id + ".jpg",
                (err) => {
                    if (err) {
                        console.log(err);
                    }
                }
            );
        }
        res.redirect("/admin");
    });
});

router.get("/delete-product/:id",/* verifyAdmin, */ (req, res) => {
    let prodId = req.params.id;
    productHelpers.deleteProduct(prodId).then((result) => {
        res.redirect("/admin");
    });
});
router.get("/edit-product/:id",/* verifyAdmin,*/ async (req, res) => {
    let prodId = req.params.id;
    let product = await productHelpers.getproductDetails(prodId);
    res.render("admin/edit-product", { product, admin: true });
});
router.post("/edit-product/:id",/* verifyAdmin, */ (req, res) => {
    let id = req.params.id;
    productHelpers.updateProduct(req.body, id).then((response) => {
        // console.log(response);
        if (req.files) {
        //     let image = req.files.image;
        //     for (let i = 0; i < image.length; i++) {
        //         image[i].mv(
        //             "./public/images/product-images/" +
        //                 image[i].name +
        //                 id +
        //                 ".jpg",
        //             (err) => {
        //                 if (err) {
        //                     console.log(err);
        //                 }
        //             }
        //         );
        //     }
        //     res.redirect("/admin");
        console.log("files");
        } else {
        //     res.redirect("/admin");
        console.log("no files");
     }
    });
});

module.exports = router;
