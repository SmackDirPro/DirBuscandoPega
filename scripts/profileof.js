document.addEventListener('DOMContentLoaded', async () => {
    // Retrieve job data from localStorage
    let jobData = JSON.parse(localStorage.getItem('selectedJob'));

    // If no jobData in localStorage, fetch it using the job ID from the URL
    if (!jobData) {
        console.log('No job data in localStorage. Fetching dynamically...');
        const urlParams = new URLSearchParams(window.location.search);
        const jobId = urlParams.get('id');

        if (!jobId) {
            alert('No job ID found in the URL.');
            window.location.href = '/'; // Redirect to homepage if no ID
            return;
        }

        try {
            const apiUrl = `https://ofertasp4488.directoriospro.workers.dev/?id=${jobId}`;
            const response = await fetch(apiUrl);
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

    // Display image
    const imageContainer = document.querySelector('.broker-image-container');
    imageContainer.innerHTML = `<img src="${jobData.image}" alt="${jobData.recruiterName || 'Sin Imagen'}">`;
}

function formatFecha(fecha) {
    if (!fecha) return null;

    try {
        // Convert serialized date to JavaScript Date
        const excelEpoch = new Date(1899, 11, 30); // Excel epoch starts from December 30, 1899
        const date = new Date(excelEpoch.getTime() + (fecha) * 24 * 60 * 60 * 1000);

        // Format the date as "25-Nov-2024"
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(',', '').replace(/\s/g, '-');
    } catch (error) {
        console.error('Error formatting date:', error);
        return null;
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
