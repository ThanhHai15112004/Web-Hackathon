let index = 0;
const slides = document.querySelectorAll('.banner_slide img');
const totalSlides = slides.length;

function nextSlide() {
    index = (index + 1) % totalSlides;
    document.querySelector('.banner_slide').style.transform = `translateX(-${index * 100}%)`;
}

setInterval(nextSlide, 4000);
