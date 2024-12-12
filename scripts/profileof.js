document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('id');

    if (!jobId) {
        alert('No job ID found in the URL.');
        window.location.href = '/'; // Redirect to homepage
        return;
    }

    // Check localStorage cache
    const cachedData = JSON.parse(localStorage.getItem(`job_${jobId}`));
    const cacheTimestamp = localStorage.getItem(`job_${jobId}_timestamp`);
    const cacheDuration = 10 * 60 * 1000; // Cache duration: 10 minutes in milliseconds

    if (cachedData && cacheTimestamp && Date.now() - cacheTimestamp < cacheDuration) {
        console.log('Using cached data');
        populateJobDetails(cachedData);
        return;
    }

    try {
        const apiUrl = `https://ofertasp4488.directoriospro.workers.dev/?id=${jobId}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jobData = await response.json();

        if (jobData.error) {
            alert('Job not found. Redirecting to the homepage.');
            window.location.href = '/'; // Redirect if job not found
            return;
        }

        // Map and transform the job data
        const mappedJobData = mapJobData(jobData);

        // Save to localStorage for caching
        localStorage.setItem(`job_${jobId}`, JSON.stringify(mappedJobData));
        localStorage.setItem(`job_${jobId}_timestamp`, Date.now());

        // Populate the profile page with job data
        populateJobDetails(mappedJobData);
    } catch (error) {
        console.error('Error fetching job data:', error);
        alert('Failed to load job details. Please try again later.');
    }
});


function mapJobData(jobData) {
    return {
        recruiterName: jobData['Nombre Reclutadora (1)'],
        employerName: jobData['Nombre Contratadora (2)'],
        city: jobData['Ciudad Cargo (3)'],
        region: jobData['Region Cargo (4)'],
        jobLink: jobData['Link a trabajo Web (5)'],
        position: jobData['Cargo (6)'],
        description: jobData['Descripción (7)'],
        objectives: jobData['Objetivos (8)'],
        functions: jobData['Funciones (9)'],
        requirements: jobData['Requisitos (10)'],
        verified: jobData['Verificado (Y/N) (11)'] === 'TRUE',
        sponsored: jobData['Sponsored (Y/N) (12)'] === 'TRUE',
        image: jobData['Image name (13)']
            ? `/assets/images/empresas/${jobData['Image name (13)']}`
            : '/assets/images/empresas/default.jpg',
        fechapub: jobData['Fecha Publicacion (14)'],
    };
}

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

    // Set up "Visitar Sitio Web" button
    const websiteButtonHero = document.getElementById('website-button-hero');
    const websiteButtonDescription = document.getElementById('website-button-description');
    if (jobData.jobLink) {
        websiteButtonHero.href = jobData.jobLink;
        websiteButtonDescription.href = jobData.jobLink;
    } else {
        websiteButtonHero.style.display = 'none';
        websiteButtonDescription.style.display = 'none';
    }

    // Display image
    const imageContainer = document.querySelector('.broker-image-container');
    imageContainer.innerHTML = `
        <img 
            src="${jobData.image}" 
            alt="${jobData.recruiterName || 'Sin Imagen'}" 
            onerror="this.src='/assets/images/empresas/default.jpg';"
        >
    `;
}

function formatFecha(fecha) {
    if (!fecha) return 'Fecha no disponible';

    try {
        const date = new Date(fecha);
        if (isNaN(date.getTime())) throw new Error('Invalid date format');
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('es-CL', options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Fecha no disponible';
    }
}
