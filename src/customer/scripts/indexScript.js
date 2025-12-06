const images = [
    "../../assets/rotating-img1.jpeg",
    "../../assets/rotating-img2.jpg",
    "../../assets/rotating-img3.jpg"
];

let index = 0;
const rotator = document.getElementById("background-rotator");

function changeBackground() {
    rotator.style.opacity = 0;

    setTimeout(() => {
        rotator.style.backgroundImage = `url('${images[index]}')`;
        rotator.style.opacity = 1;
        index = (index + 1) % images.length;
    }, 50);
}
changeBackground();
setInterval(changeBackground, 5000);
