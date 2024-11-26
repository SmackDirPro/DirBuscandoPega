document.addEventListener('DOMContentLoaded', () => {
    // Retrieve job data from localStorage
    const jobData = JSON.parse(localStorage.getItem('selectedJob'));

    if (jobData) {
        // Populate all fields in the profile page
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

        // Badges
        if (jobData.verified) {
            document.getElementById('verified-badge').style.display = 'inline-block';
        } else {
            document.getElementById('verified-badge').style.display = 'none';
        }

        if (jobData.sponsored) {
            document.getElementById('sponsored-badge').style.display = 'inline-block';
        } else {
            document.getElementById('sponsored-badge').style.display = 'none';
        }

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
    } else {
        console.error('No job data found in localStorage.');
    }
});
