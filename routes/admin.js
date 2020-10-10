var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
    let products = [
        {
            name: "Samsung Galaxy A7 (2018)",
            category: "Smart Phone",
            description:
                "Samsung Galaxy A7 (2018) · Display 6.00-inch (1080x2220) · Processor 2.2GHz octa-core · Front Camera 24MP · Rear Camera 24MP + 8MP + 5MP · RAM 4GB.",
            price: 28999,
            image: "/images/samsung-galaxy-a7-sm-a750f.jpg",
        },
        {
            name: "Samsung Galaxy Note 20",
            category: "Smart Phone",
            description: "Something .................",
            price: 158999,
            image: "/images/samsung-galaxy-note20ultra.jpg",
        },
        {
            name: "Boat Headphone",
            category: "Mobile Accessories",
            description: "Something.............",
            price: 1599,
            image: "/images/boat.jpg",
        },
        {
            name: "Apple I Phone 11 Max Pro",
            category: "Smart Phone",
            description: "Something.....",
            price: 148999,
            image: "/images/iphone11promax.jpg",
        },
    ];
    res.render("admin/view-products", { products, admin: true });
});

router.get("/add-product", (req, res) => {
    res.render("admin/add-products" ,{admin:true});
});

router.post("/add-products", (req, res) => {
    console.log(req.body);
    console.log(req.files.image);
});

module.exports = router;
