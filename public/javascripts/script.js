const viewImage = (event, image) => {
    if (image === "image1") {
        var prodimage = document.getElementById("prodimage1");
        prodimage.src = URL.createObjectURL(event.target.files[0]);
    } else if (image === "image2") {
        var prodimage = document.getElementById("prodimage2");
        prodimage.src = URL.createObjectURL(event.target.files[0]);
    } else {
        var prodimage = document.getElementById("prodimage3");
        prodimage.src = URL.createObjectURL(event.target.files[0]);
    }
};

const addToCart = (prodId, user) => {
    fetch("http://localhost:3001/add-to-cart/" + prodId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((response) => {
            if (response.status) {
                let count = document.getElementById("cartCount").innerHTML;
                count = parseInt(count) + 1;
                document.getElementById("cartCount").innerHTML = count;
            }
        });
};
const toggleMenu = () => {
    var menu = document.getElementById("menu");
    menu.classList.toggle("active");
};

const changeImage = (imageId, prodId) => {
    var image = document.getElementById(prodId);
    var imageURL = "/images/product-images/" + imageId + prodId + ".jpg";
    image.src = imageURL;
};

const quantity = (prodId, func) => {
    let quantity = document.getElementById(prodId).innerHTML;
    if (quantity == 1) {
        var co = confirm("Are You Want To Delete The Product ?");
        if (co) {
            fetch("http://localhost:3001/delete-cart-product/" + prodId, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((res) => res.json())
                .then((response) => {
                    if (response.status) {
                        id = "t" + prodId;
                        let item = document.getElementById(id);
                        item.style.display = "none";
                        let count = document.getElementById("cartCount")
                            .innerHTML;
                        count = parseInt(count) - 1;
                        document.getElementById("cartCount").innerHTML = count;
                    }
                });
        }
    } else {
        fetch("http://localhost:3001/change-quantity/" + prodId + "/" + func, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((response) => {
                if (response) {
                    let quantity = document.getElementById(prodId).innerHTML;
                    quantity = parseInt(quantity) + 1;
                    document.getElementById(prodId).innerHTML = quantity;
                    let count = document.getElementById("cartCount").innerHTML;
                    count = parseInt(count) + 1;
                    document.getElementById("cartCount").innerHTML = count;
                } else {
                    let quantity = document.getElementById(prodId).innerHTML;
                    quantity = parseInt(quantity) - 1;
                    document.getElementById(prodId).innerHTML = quantity;
                    let count = document.getElementById("cartCount").innerHTML;
                    count = parseInt(count) - 1;
                    document.getElementById("cartCount").innerHTML = count;
                }
            });
    }
};

const deleteCartItem = (prodId, name) => {
    var con = confirm("Do You Want" + name + "from Your Cart");
    if (con) {
        fetch("http://localhost:3001/delete-cart-product/" + prodId, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((response) => {
                if (response.status) {
                    id = "t" + prodId;
                    let item = document.getElementById(id);
                    item.style.display = "none";
                    let quantity = document.getElementById(prodId).innerHTML;
                    let count = document.getElementById("cartCount").innerHTML;
                    count = parseInt(count) - parseInt(quantity);
                    document.getElementById("cartCount").innerHTML = count;
                }
            });
    }
};
const next = (radid, divid) => {
    var r = [];
    var radio = document.getElementById(radid).checked;
    var div = document.getElementById(divid);
    r[0] = "r1" + divid;
    r[1] = "r2" + divid;
    r[2] = "r3" + divid;
    if (radio) {
        if (radid === r[0]) {
            div.style.marginLeft = "0";
        } else if (radid === r[1]) {
            div.style.marginLeft = "-100%";
        } else {
            div.style.marginLeft = "-200%";
        }
    }
};

const editImage = () => {
    var yes = document.getElementById("edit-yes");
    var no = document.getElementById("edit-no");
    if (yes.checked) {
        console.log("Ok");
    } else if (no.checked) {
        console.log("no");
    }
};
