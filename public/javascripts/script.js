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

const addToCart = (prodId, name) => {
    fetch("/add-to-cart/" + prodId, {
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
                alert(name + " added to cart");
            } else {
                alert("Please Login to complete the action");
                window.location = "/login";
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

const quantity = (prodId, func, price) => {
    let quantity = document.getElementById(prodId).innerHTML;
    if (quantity == 1 && func === "dnc") {
        var co = confirm("Do You Want To Delete The Product ?");
        if (co) {
            fetch("/delete-cart-product/" + prodId, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((res) => res.json())
                .then((response) => {
                    if (response.status) {
                        var id = "t" + prodId;
                        let item = document.getElementById(id);
                        item.style.display = "none";
                        let count = document.getElementById("cartCount")
                            .innerHTML;
                        count = parseInt(count) - 1;
                        document.getElementById("cartCount").innerHTML = count;
                        let total = document.getElementById("total").innerHTML;
                        total =
                            parseFloat(total) -
                            parseInt(quantity) * parseFloat(price);
                        document.getElementById("total").innerHTML = total;
                    }
                });
        }
    } else {
        fetch("/change-quantity/" + prodId + "/" + func, {
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
                    let total = document.getElementById("total").innerHTML;
                    total = parseFloat(total) + parseFloat(price);
                    document.getElementById("total").innerHTML = total;
                } else {
                    let quantity = document.getElementById(prodId).innerHTML;
                    quantity = parseInt(quantity) - 1;
                    document.getElementById(prodId).innerHTML = quantity;
                    let count = document.getElementById("cartCount").innerHTML;
                    count = parseInt(count) - 1;
                    document.getElementById("cartCount").innerHTML = count;
                    let total = document.getElementById("total").innerHTML;
                    total = parseFloat(total) - parseFloat(price);
                    document.getElementById("total").innerHTML = total;
                }
            });
    }
};

const deleteCartItem = (prodId, name, price) => {
    var con = confirm("Do You Want to delete " + name + " from Your Cart");
    if (con) {
        fetch("/delete-cart-product/" + prodId, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((response) => {
                if (response.status) {
                    var id = "t" + prodId;
                    let item = document.getElementById(id);
                    item.style.display = "none";
                    let quantity = document.getElementById(prodId).innerHTML;
                    let count = document.getElementById("cartCount").innerHTML;
                    count = parseInt(count) - parseInt(quantity);
                    document.getElementById("cartCount").innerHTML = count;
                    let total = document.getElementById("total").innerHTML;
                    total =
                        parseFloat(total) -
                        parseInt(quantity) * parseFloat(price);
                    document.getElementById("total").innerHTML = total;
                }
            });
    }
};

const total = (id, quantity, price) => {
    var total = parseInt(quantity) * parseInt(price);
    document.getElementById(id).innerHTML = total;
};

const validation = (event) => {
    if (event.target[1].value !== event.target[2].value) {
        event.preventDefault();
        event.target[2].style.borderColor = "red";
        document.getElementById("error").innerHTML = "Password Doesnot Match";
        return false;
    } else {
        return true;
    }
};
