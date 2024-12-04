
document.addEventListener('DOMContentLoaded', function () {
        // Reference to the search input field
        const searchInput = document.getElementById('job-search');

        searchInput.addEventListener('input', function () {
            const query = searchInput.value.trim();
            filterListings(query);
        });

        // Store fetched listings globally for filtering
        let allListings = [];
    
        // Google Sheets API settings
    
       const dataContainer = document.getElementById('data-container');
       const sheetName = dataContainer.getAttribute('data-sheet-name') || 'DefaultSheetName';
   
       const workerUrl = `https://ofertasp088.directoriospro.workers.dev/?sheetName=${sheetName}`;
   
       let currentPage = 1;
       const resultsPerPage = 10;
       let totalPages = 1;
     
       
    console.log("DOMContentLoaded triggered");

    const listingsContainer = document.querySelector('.listings-container');
    const paginationContainer = document.querySelector('.pagination');

    console.log("listingsContainer:", listingsContainer);
    console.log("paginationContainer:", paginationContainer);
    
    if (!listingsContainer) {
        console.error("Error: listingsContainer element not found.");
        return;
    }

    // Function to handle navigation to job profile page
    function viewJobProfile(job) {
        const jobData = {
            id: job.id,
            recruiterName: job.recruiterName, // "Nombre Reclutadora (1)"
            employerName: job.employerName,  // "Nombre Contratadora (1)"
            city: job.city,                  // "Ciudad Cargo (2)"
            region: job.region,              // "Region Cargo (3)"
            jobLink: job.jobLink,            // "Link a trabajo Web (4)"
            position: job.position,          // "Cargo (5)"
            description: job.description,    // "Descripción (6)"
            objectives: job.objectives,      // "Objetivos "
            functions: job.functions,        // "Funciones"
            requirements: job.requirements,  // "Requisitos"
            verified: job.verified,          // "Verificado (Y/N) "
            sponsored: job.sponsored,        // "Sponsored (Y/N) "
            image: job.image,                // "Image name (11)"
            fechapub: job.fechapub           // "Fecha de Publicacion"
        };
        localStorage.setItem('selectedJob', JSON.stringify(jobData));
        window.location.href = `/profileof.html?id=${jobData.id}`;
    }

    // Attach to window for direct HTML access
    window.viewJobProfile = viewJobProfile;

    // Create each job listing card
    function createListingCard(listing) {
        const card = document.createElement('div');
        card.className = 'listing-card';

        if (listing.sponsored) {
            const sponsoredLabel = document.createElement('div');
            sponsoredLabel.className = 'listing-sponsored';
            sponsoredLabel.textContent = 'DESTACADO';
            card.appendChild(sponsoredLabel);
        }

        card.innerHTML += `
            <div class="listing-content">
                <div class="listing-image">
                    <img src="${listing.image}" alt="${listing.position}">
                </div>
                <div class="listing-details">
                    <h3 class="listing-title">${listing.position}</h3>
                    ${listing.verified ? '<span class="listing-verified">Verificado</span>' : ''}
                    <div class="listing-info">
                        <p><strong>Reclutadora:</strong> ${listing.recruiterName}</p>
                        <p><strong>Contratadora:</strong> ${listing.employerName}</p>
                        <p><strong>Ciudad:</strong> ${listing.city}</p>
                        <p><strong>Región:</strong> ${listing.region}</p>
                        <button class="more-info-button" onclick='viewJobProfile(${JSON.stringify(listing)})'>Más Info</button>
                    </div>
                </div>
            </div>
        `;
        return card;
    }

    
    // Render listings with pagination
    function renderListings(listings, page) {
        listingsContainer.innerHTML = '';
        const start = (page - 1) * resultsPerPage;
        const end = start + resultsPerPage;
        const paginatedListings = listings.slice(start, end);

        paginatedListings.forEach(listing => {
            listingsContainer.appendChild(createListingCard(listing));
        });

        updatePaginationControls();
    }

    // Pagination controls
    function updatePaginationControls() {
        paginationContainer.innerHTML = `
            <button ${currentPage === 1 ? 'disabled' : ''} onclick="prevPage()">Prev.</button>
            <span>Página ${currentPage} de ${totalPages}</span>
            <button ${currentPage === totalPages ? 'disabled' : ''} onclick="nextPage()">Sig.</button>
        `;
    }

    // Next and previous page functions
    window.nextPage = function () {
        if (currentPage < totalPages) {
            currentPage++;
            fetchListings().then(listings => {
                renderListings(listings, currentPage);
                window.scrollTo(0, 0); // Scroll to top after rendering
            });
        }
    };

    window.prevPage = function () {
        if (currentPage > 1) {
            currentPage--;
            fetchListings().then(listings => {
                renderListings(listings, currentPage);
                window.scrollTo(0, 0); // Scroll to top after rendering
            });
        }
    };
    
    // Fetch data from Google Sheets
    async function fetchListings() {
        try {
            const response = await fetch(workerUrl);
            const data = await response.json();
            console.log('Raw data from Google Sheets:', data);
    
            if (data.error) {
                console.error('Google Sheets API Error:', data.error.message);
                return [];
            }
    
            const rows = data.values;
            const headers = rows[2]; // Assuming headers are in the third row
            const verifiedIndex = headers.findIndex(header => header.includes("Verificado"));
            const sponsoredIndex = headers.findIndex(header => header.includes("Sponsored"));
    
            const listings = rows.slice(3).map(row => {
                const verified = String(row[verifiedIndex]).toLowerCase() === 'true';
                const sponsored = String(row[sponsoredIndex]).toLowerCase() === 'true';
    
                return {
                    id: row[0],                            // "#Id"
                    recruiterName: row[1],                 // "Nombre Reclutadora (1)"
                    employerName: row[2],                  // "Nombre Contratadora (1)"
                    city: row[3],                          // "Ciudad Cargo (2)"
                    region: row[4],                        // "Region Cargo (3)"
                    jobLink: row[5],                       // "Link a trabajo Web (4)"
                    position: row[6],                      // "Cargo (5)"
                    description: row[7],                   // "Descripción (6)"
                    objectives: row[8],                    // "Objetivos (7)"
                    functions: row[9],                     // "Funciones (7)"
                    requirements: row[10],                 // "Requisitos (8)"
                    verified: verified,                    
                    sponsored: sponsored,     
                    image: row[13] ? `/assets/images/empresas/${row[13]}` : '/assets/images/empresas/default.jpg', // "Image name (11)"
                    fechapub: row[14],                     // "Fecha Publicacion
                };
            });
    
            // Store all listings globally for filtering
            allListings = listings;
    
            if (allListings.length === 0) {
                // Render no-results message when no listings are found
                handleInitialNoResults();
                return;
            }

            // Sort listings: Sponsored > Verified
            listings.sort((a, b) => {
                if (a.sponsored !== b.sponsored) return b.sponsored - a.sponsored; // Sponsored first
                return b.verified - a.verified; // Then verified
            });
    
            // Update the number of jobs in the Hero section
            const count = listings.length;
            const heroText = document.querySelector('.dirherocont h3');
            if (heroText) {
                heroText.textContent = `Hay ${count} ofertas de trabajo en esta región.`;
            }
    
            // Calculate total pages and render the first page
            totalPages = Math.ceil(listings.length / resultsPerPage);
            renderListings(listings, currentPage);
    
            return listings;
        } catch (error) {
            console.error('Error fetching data from Google Sheets:', error);
            return [];
        }
    }

    function renderNoResultsMessage(message) {
        const noResultsMessage = document.getElementById('no-results-message');
        noResultsMessage.style.display = 'block';
        noResultsMessage.innerHTML = `
            <h3>Lo lamentamos</h3>
            <p>${message}</p>
        `;
        listingsContainer.innerHTML = ''; // Clear listings container
        paginationContainer.innerHTML = ''; // Clear pagination
    }
    
    // Function to handle the initial render on page load
    function handleInitialNoResults() {
        if (allListings.length === 0) {
            renderNoResultsMessage(
                'No existen ofertas en esta región por el momento. Pero vuelve pronto, porque estamos verificando ofertas y actualizando nuestra base de datos todos los días. Síguenos en nuestras redes sociales para estar informado de todos nuestros cambios.'
            );
        }
    }

    // Filter listings based on search input
    function filterListings(query) {
        const filteredListings = allListings.filter(listing => {
            const searchText = query.toLowerCase();
            return (
                listing.position.toLowerCase().includes(searchText) ||
                listing.city.toLowerCase().includes(searchText) ||
                listing.recruiterName.toLowerCase().includes(searchText) ||
                listing.employerName.toLowerCase().includes(searchText)
            );
        });

        const noResultsMessage = document.getElementById('no-results-message');
    
        if (filteredListings.length === 0) {
        renderNoResultsMessage('No se encontraron resultados con los criterios ingresados.');
        } else {
            // Hide the no-results message and display results
            const noResultsMessage = document.getElementById('no-results-message');
            noResultsMessage.style.display = 'none';
            currentPage = 1;
            totalPages = Math.ceil(filteredListings.length / resultsPerPage);
            renderListings(filteredListings, currentPage);
        }
        console.log(document.getElementById('no-results-message'));
    }

    // Attach search event listener
    searchInput.addEventListener('input', function () {
        const query = searchInput.value.trim();
        filterListings(query);
    });


    
    // Initial fetch and render
    fetchListings();
});

// document.getElementById('buscar-comuna-btn').addEventListener('click', function() {
 //    document.getElementById('buscar-por-comuna').scrollIntoView({ behavior: 'smooth' });
//});

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.querySelector('.nav-toggle');
    const navList = document.querySelector('nav ul.nav-list');

    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            navList.classList.toggle('active');
        });
    }
});

// Enhanced Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
