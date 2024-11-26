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

    // Shuffle the array and start from row 12 (index 11)
    const shuffledAgents = agents.slice(11); // Start from row 12
    shuffledAgents.sort(() => Math.random() - 0.5); // Randomly shuffle the array

    // Select up to 3 random agents from the shuffled array
    const selectedAgents = shuffledAgents.slice(0, 3);

    // Populate the cards with the selected agents
    selectedAgents.forEach(agent => {
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