const viewImage = (event) => {
    var prodimage = document.getElementById("prodimage");
    prodimage.src = URL.createObjectURL(event.target.files[0]);
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
