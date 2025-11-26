//href and navbar promotions handling -------------------:
const navLinks = document.querySelectorAll('.nav-bar a');
const currentUrl = new URL(window.location.href);

// Remove all existing active classes
navLinks.forEach(link => link.classList.remove('active'));

navLinks.forEach(link => {
    const linkUrl = new URL(link.href, window.location.origin);

    // Compare pathname first
    if (linkUrl.pathname === currentUrl.pathname) {
        // Compare query parameters exactly
        const linkParams = [...linkUrl.searchParams.entries()];
        const currentParams = [...currentUrl.searchParams.entries()];

        // Function to check if both sets of params match exactly
        const paramsMatch = (a, b) => {
            if (a.length !== b.length) return false;
            return a.every(([key, val]) => b.some(([k, v]) => k === key && v === val));
        };

        if (paramsMatch(linkParams, currentParams)) {
            link.classList.add('active');
        }
    }
});

//--------------------------------------------------------;;;;;


//navbar dropdown menu ------------------------------:
const btn = document.getElementById("moreBtn");
const menu = document.getElementById("dropdownmenu");

btn.addEventListener("click", (event) => {
  event.stopPropagation(); // Prevent closing immediately
  menu.style.display = menu.style.display === "block" ? "none" : "block";
});

// Close dropdown when clicking outside
document.addEventListener("click", () => {
  menu.style.display = "none";
});
//----------------------------------------------------;;;;;

// Search bar functionality -------------------------:

const searchIcon = document.getElementById("searchIcon");
const searchInput = document.getElementById("navSearchInput");

// Function that handles the actual search
function handleSearch() {
    const query = searchInput.value.trim();
    if (query !== "") {
        console.log("Searching for:", query);
        // Example: redirect to search results page
        window.location.href = `produits.html?search=${encodeURIComponent(query)}`;
    } else {
        // If input is empty, toggle expansion
        searchInput.classList.toggle("active");
        if (searchInput.classList.contains("active")) {
            searchInput.focus();
        }
    }
}

// Search icon click
searchIcon.addEventListener("click", handleSearch);

// Enter key press in input
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handleSearch();
    }
});

// Optional: collapse input when clicking outside
document.addEventListener("click", (e) => {
    if (!searchIcon.contains(e.target) && !searchInput.contains(e.target)) {
        searchInput.classList.remove("active");
    }
});
//----------------------------------------------------


//dynamic minmized navbar on scroll -----------------:
const nav = document.querySelector('.nav-bar');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY && currentScrollY > nav.offsetHeight) {
    // scrolling down — hide navbar
    nav.classList.add('nav-up');
  } else {
    // scrolling up — show navbar
    nav.classList.remove('nav-up');
  }

  lastScrollY = currentScrollY;
});
