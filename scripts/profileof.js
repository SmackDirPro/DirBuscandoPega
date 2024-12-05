document.addEventListener('DOMContentLoaded', async () => {
    let jobData = JSON.parse(localStorage.getItem('selectedJob'));

    if (!jobData) {
        console.log('No job data in localStorage. Fetching dynamically...');
        const urlParams = new URLSearchParams(window.location.search);
        const jobId = urlParams.get('id');

        if (!jobId) {
            alert('No job ID found in the URL.');
            window.location.href = '/'; // Redirect to homepage
            return;
        }

        try {
            const apiUrl = `https://ofertasp4488.directoriospro.workers.dev/?id=${jobId}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            jobData = await response.json();

            if (jobData.error) {
                alert('Job not found. Redirecting to the homepage.');
                window.location.href = '/'; // Redirect if job not found
                return;
            }
        } catch (error) {
            console.error('Error fetching job data:', error);
            alert('Failed to load job details. Please try again later.');
            return;
        }
    }

    // Add the mapping layer here
    if (!jobData.recruiterName && jobData['Nombre Reclutadora (1)']) {
        jobData.recruiterName = jobData['Nombre Reclutadora (1)'];
        jobData.employerName = jobData['Nombre Contratadora (1)'];
        jobData.city = jobData['Ciudad Cargo (2)'];
        jobData.region = jobData['Region Cargo (3)'];
        jobData.jobLink = jobData['Link a trabajo Web (4)'];
        jobData.position = jobData['Cargo (5)'];
        jobData.description = jobData['Descripción (6)'];
        jobData.objectives = jobData['Objetivos (7)'];
        jobData.functions = jobData['Funciones (7)'];
        jobData.requirements = jobData['Requisitos (8)'];
        jobData.verified = jobData['Verificado (Y/N) (9)'] === 'TRUE';
        jobData.sponsored = jobData['Sponsored (Y/N) (10)'] === 'TRUE';
        jobData.image = jobData['Image name (11)'] || 'default.jpg'; // Add fallback
        jobData.fechapub = jobData['Fecha Publicacion (12)'];
    }

    // Populate the profile page with job data
    populateJobDetails(jobData);
});


function populateJobDetails(jobData) {
    document.getElementById('job-recruiter').textContent = jobData.recruiterName || 'Reclutadora no disponible';
    document.getElementById('job-employer').textContent = jobData.employerName || 'Contratadora no disponible';
    document.getElementById('job-city').textContent = jobData.city || 'Ciudad no disponible';
    document.getElementById('job-region').textContent = jobData.region || 'Región no disponible';
    document.getElementById('job-position').textContent = jobData.position || 'Cargo no disponible';
    document.getElementById('job-position-heading').textContent = jobData.position || 'Cargo no disponible';
    document.getElementById('job-position-description').textContent = jobData.position || 'Cargo no disponible';
    document.getElementById('job-description').textContent = jobData.description || 'Descripción no disponible';
    document.getElementById('job-objectives').textContent = jobData.objectives || 'Objetivos no disponibles';
    document.getElementById('job-functions').textContent = jobData.functions || 'Funciones no disponibles';
    document.getElementById('job-requirements').textContent = jobData.requirements || 'Requisitos no disponibles';
    document.getElementById('fecha-public').textContent = formatFecha(jobData.fechapub) || 'Fecha no disponible';

    // Badges
    document.getElementById('verified-badge').style.display = jobData.verified ? 'inline-block' : 'none';
    document.getElementById('sponsored-badge').style.display = jobData.sponsored ? 'inline-block' : 'none';

    // Set up "Visitar Sitio Web" button to redirect to the job application page
    const websiteButtonHero = document.getElementById('website-button-hero');
    if (jobData.jobLink) {
        websiteButtonHero.href = jobData.jobLink;
    } else {
        websiteButtonHero.style.display = 'none';
    }

    const websiteButtonDescription = document.getElementById('website-button-description');
    if (jobData.jobLink) {
        websiteButtonDescription.href = jobData.jobLink;
    } else {
        websiteButtonDescription.style.display = 'none';
    }

    const imageContainer = document.querySelector('.broker-image-container');

    // Fallback to dynamically fetch the image from the worker if not available in jobData
    const imageUrl = jobData.image 
        ? `/assets/images/empresas/${jobData.image}` 
        : `/assets/images/empresas/default.jpg`;
    
    console.log('Image URL:', imageUrl); // Debugging log
    
    // Add onerror to load the default image if the original one fails
    imageContainer.innerHTML = `<img src="${imageUrl}" alt="${jobData.recruiterName || 'Sin Imagen'}" 
        onerror="this.src='/assets/images/empresas/default.jpg';">`;
    
}

function formatFecha(fecha) {
    if (!fecha) return 'Fecha no disponible'; // Handle empty or null dates

    try {
        // Check if `fecha` is a standard date string (e.g., "2024-11-27")
        if (isNaN(fecha)) {
            const date = new Date(fecha); // Parse the date string
            if (isNaN(date.getTime())) throw new Error('Invalid date format');
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return date.toLocaleDateString('en-GB', options).replace(',', '').replace(/\s/g, '-');
        }

        // Handle Excel serialized date format
        const excelEpoch = new Date(1899, 11, 30); // Excel epoch starts from December 30, 1899
        const date = new Date(excelEpoch.getTime() + (fecha * 24 * 60 * 60 * 1000));
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(',', '').replace(/\s/g, '-');
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Fecha no disponible';
    }
}




document.addEventListener('DOMContentLoaded', () => {
    const shareButton = document.getElementById('share-button');
    const jobData = JSON.parse(localStorage.getItem('selectedJob')) || {}; // Use empty object if localStorage is missing

    shareButton.addEventListener('click', () => {
        const shareUrl = `${window.location.origin}/profileof.html?id=${jobData.id}`;
        const shareTitle = jobData.position || 'Oferta Laboral';
        const shareText = `Consulta esta oferta laboral para el cargo de ${jobData.position || 'cargo no especificado'} en ${jobData.city || 'ciudad no especificada'}.`;

        if (navigator.share) {
            // Web Share API for mobile and modern browsers
            navigator.share({
                title: shareTitle,
                text: shareText,
                url: shareUrl,
            }).then(() => {
                console.log('Compartido exitosamente');
            }).catch((error) => {
                console.error('Error al compartir:', error);
            });
        } else {
            // Fallback for unsupported devices: Copy link to clipboard
            const tempInput = document.createElement('input');
            document.body.appendChild(tempInput);
            tempInput.value = shareUrl;
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            alert('Enlace copiado al portapapeles.');
        }
    });
});
