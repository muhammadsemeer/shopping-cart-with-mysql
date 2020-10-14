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
    console.log(image);
};

const addToCart = (prodId) => {
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
