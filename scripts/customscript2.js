// Cloudflare Worker URL
 const apiUrl = 'https://buscarp044.directoriospro.workers.dev/';

// Function to fetch agent data from Google Sheets
async function fetchAgents() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.error) {
            console.error('Google Sheets API Error:', data.error.message);
            return [];
        }
        
        const agents = data.values;
        return agents; // Array of agent data
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        return [];
    }
}

// Function to populate the agent cards dynamically
function populateAgentCards(agents) {
    const agentsGrid = document.querySelector('.agents-grid');

    // Loop over only rows 2, 3, and 4
    agents.forEach((agent, index) => {
        if (index < 7 || index > 9) return; // Skip the header and rows outside 2, 3, and 4

        const agentName = agent[1];       // Name from column 1 (Nombre Corredor)
        const agentDescription = agent[5]; // Description from column 2
        const agentImage = agent[20] ? `/assets/images/empresas/${agent[20]}` : '/assets/images/empresas/default.jpg'; // Image file name from column 6 (fallback if empty)
        const agentId = agent[0]; // Broker ID

        // Create agent card HTML
        const agentCard = document.createElement('div');
        agentCard.classList.add('agent-card');

        agentCard.innerHTML = `
            <div class="agent-image" style="background-image: url('${agentImage}');"></div>
            <h3>${agentName}</h3>
            <p>${agentDescription}</p>
            <a href="/featured.html?id=${agentId}" class="agent-cta" onclick='saveBrokerToLocalStorage(${JSON.stringify(agent)})'>Ver Perfil</a>
        `;

        // Append the agent card to the grid
        agentsGrid.appendChild(agentCard);
    });
}


// Save broker data to localStorage and navigate to featured.html
function saveBrokerToLocalStorage(brokerData) {
    console.log('Saving broker data:', brokerData); // Log broker data before saving
localStorage.setItem('selectedBroker', JSON.stringify(brokerData));
window.location.href = 'featured.html'; // Redirect to featured.html

}


// Fetch data and populate cards
fetchAgents().then(agents => populateAgentCards(agents));


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

// JavaScript for Accordion FAQ
document.querySelectorAll('.faq-item h3').forEach(item => {
    item.addEventListener('click', () => {
        const openItem = document.querySelector('.faq-item.open');
        if (openItem && openItem !== item.parentElement) {
            openItem.classList.remove('open');
        }
        item.parentElement.classList.toggle('open');
    });
});



async function fetchRecentJobs() {
    const apiUrl = 'https://ofertasrec088.directoriospro.workers.dev/'; // Replace with your worker's URL
    try {
      const response = await fetch(apiUrl);
      const jobs = await response.json();
  
      if (jobs.error) {
        console.error('Error fetching recent jobs:', jobs.error);
        return [];
      }
      return jobs;
    } catch (error) {
      console.error('Error fetching recent jobs:', error);
      return [];
    }
  }
  
  function populateRecentJobs(jobs) {
    const jobsGrid = document.querySelector('.recent-jobs .jobs-grid');
  
    jobs.forEach(job => {
      const jobCard = document.createElement('div');
      jobCard.classList.add('job-card');
  
      // Ensure correct keys are used based on your sheet headers
      const image = job['Image name (13)']
        ? `/assets/images/empresas/${job['Image name (13)']}`
        : '/assets/images/empresas/default.jpg';
  
      jobCard.innerHTML = `
        <div class="job-image" style="background-image: url('${image}');"></div>
        <h3>${job['Cargo (6)'] || 'Cargo no disponible'}</h3>
        <p><strong>Reclutadora:</strong> ${job['Nombre Reclutadora (1)'] || 'No especificada'}</p>
        <p><strong>Contratante:</strong> ${job['Nombre Contratante (2)'] || 'No especificada'}</p>
        <p><strong>Ciudad:</strong> ${job['Ciudad Cargo (3)'] || 'No especificada'}</p>
        <p><strong>Fecha de Publicación:</strong> ${job['Fecha Publicacion (14)'] || 'No disponible'}</p>
        <a href="/profileof.html?id=${job['#Id']}" class="job-cta">Más Info</a>
      `;
  
      jobsGrid.appendChild(jobCard);
    });
  }
  
  
  // Fetch and populate recent jobs
  fetchRecentJobs().then(jobs => populateRecentJobs(jobs));
  