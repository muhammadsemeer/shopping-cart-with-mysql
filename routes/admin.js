var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var fs = require("fs");
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
router.get("/", verifyAdmin, function (req, res, next) {
    productHelpers.getAllProducts().then((products) => {
        res.render("admin/view-products", { products, admin: req.session.user.admin });
    });
});

router.get("/add-product", verifyAdmin, (req, res) => {
    res.render("admin/add-products", { admin: true });
});

router.post("/add-products", verifyAdmin, (req, res) => {
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

router.get(
    "/delete-product/:id/:image1/:image2/:image3",
    verifyAdmin,
    (req, res) => {
        let prodId = req.params.id;
        let image1 = req.params.image1;
        let image2 = req.params.image2;
        let image3 = req.params.image3;
        productHelpers.deleteProduct(prodId).then((result) => {
            fs.unlink(
                "./public/images/product-images/" + image1 + prodId + ".jpg",
                (error) => {
                    if (error) throw error;
                }
            );
            fs.unlink(
                "./public/images/product-images/" + image2 + prodId + ".jpg",
                (error) => {
                    if (error) throw error;
                }
            );
            fs.unlink(
                "./public/images/product-images/" + image3 + prodId + ".jpg",
                (error) => {
                    if (error) throw error;
                }
            );
            res.redirect("/admin");
        });
    }
);
router.get(
    "/edit-product/:id",
    /* verifyAdmin,*/ async (req, res) => {
        let prodId = req.params.id;
        let product = await productHelpers.getproductDetails(prodId);
        res.render("admin/edit-product", { product, admin: req.session.user.admin });
    }
);
router.post("/edit-product/:id", verifyAdmin, (req, res) => {
    let id = req.params.id;
    productHelpers.updateProduct(req.body, id).then((response) => {
        res.redirect("/admin");
    });
});

router.get("/edit-images/:imageno/:prodID/:image", verifyAdmin, (req, res) => {
    res.render("admin/edit-image", { image: req.params, admin: req.session.user.admin });
});

router.post("/edit-images/:imageno/:prodID/:image", verifyAdmin, (req, res) => {
    let image = req.files.image;
    let id = req.params.prodID;
    let oldImage = req.params.image;
    if (image) {
        productHelpers.editProductImage(req.params, image).then((response) => {
            image.mv(
                "./public/images/product-images/" + image.name + id + ".jpg",
                (err) => {
                    if (err) {
                        console.log(err);
                    }
                    fs.unlink(
                        "./public/images/product-images/" +
                            oldImage +
                            id +
                            ".jpg",
                        (error) => {
                            if (error) throw error;
                        }
                    );
                }
            );
            res.redirect("/admin");
        });
    }
});
router.get("/allorders", verifyAdmin, (req, res) => {
    productHelpers.getAllOrders().then((response) => {
        res.render("admin/all-orders", { response, admin: req.session.user.admin });
    });
});
router.get("/allusers", verifyAdmin, async (req, res) => {
    let users = await productHelpers.getAllUsers();
    res.render("admin/all-users", { users, admin: req.session.user.admin });
});
router.get("/search", async (req, res) => {
    productHelpers.searchProduct(req.query).then((products) => {
        res.render("admin/view-products", {
            products,
            admin: req.session.user.admin,
            query: req.query.query,
        });
    });
});

module.exports = router;
