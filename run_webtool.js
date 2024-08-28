<script>
  // Base URL for the JSON files in Google Drive
  const baseURL = 'https://raw.githubusercontent.com/SteppLab/listener_calculator/main/';

  // Map of file IDs based on method and listener type
  const fileIdMap = {
     orthographic_transcription_inexperienced: 'orthographic_transcription_inexperienced.JSON?token=GHSAT0AAAAAACWW2LEV3EYXAKSK6O55YUQOZWPLOEA',
  orthographic_transcription_SLPs: 'orthographic_transcription_SLPs.JSON?token=GHSAT0AAAAAACWW2LEVEJNEEY3ODUZRNNMCZWPLOIQ',
  VAS_inexperienced: 'VAS_inexperienced.JSON?token=GHSAT0AAAAAACWW2LEVIZHORQNGUMH6WQLWZWPLOMQ',
  VAS_SLPs: 'VAS_SLPs.JSON?token=GHSAT0AAAAAACWW2LEVM6CMREMZH7DBASLKZWPLORQ'
  };

  // Determine the file URL based on method and listener type
  function getFileURL(method, listenerType) {
    const fileId = fileIdMap[`${method.replace(/ /g, '_')}_${listenerType.replace(/ /g, '_')}`];
    return `${baseURL}${fileId}`;
  }

  // Fetch the lookup data based on the URL
  async function fetchLookupData(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching lookup data:', error);
      return {};
    }
  }

  // Find the closest value in an array
  function findClosest(value, array) {
    return array.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
  }

  // Find results based on user input
  async function findResults() {
    const form = document.getElementById('criteriaForm');
    const method = form.assessmentMethod.value.replace(/ /g, '_');
    const listenerType = form.listenerType.value.replace(/ /g, '_');
    const accuracy = parseInt(form.accuracyLevel.value, 10); // Get accuracy as integer
    const priority = form.priority.value;

    const fileURL = getFileURL(method, listenerType);
    const data = await fetchLookupData(fileURL);

    if (!data.sentences || !data.listeners || !data.accuracy) {
      console.error('Invalid data format');
      return;
    }

    const sentenceValues = data.sentences;
    const listenerValues = data.listeners;
    const accuracyData = data.accuracy;

    // Find closest accuracy
    let closestAccuracy = findClosest(accuracy, Object.values(accuracyData).flat());
    
    // Determine the optimal number of sentences and listeners
    let bestResult = { sentences: null, listeners: null, accuracy: Infinity };
    
    for (const sentence of sentenceValues) {
      for (const listener of listenerValues) {
        const currentAccuracy = accuracyData[sentence]?.[listener];
        if (currentAccuracy !== undefined) {
          const accuracyDiff = Math.abs(currentAccuracy - accuracy);
          if (accuracyDiff < bestResult.accuracy) {
            bestResult = { sentences: sentence, listeners: listener, accuracy: accuracyDiff };
          } else if (accuracyDiff === bestResult.accuracy) {
            // Prioritize based on the user's choice
            if (priority === 'fewest listeners' && listener < bestResult.listeners) {
              bestResult = { sentences: sentence, listeners: listener, accuracy: accuracyDiff };
            } else if (priority === 'fewest sentences' && sentence < bestResult.sentences) {
              bestResult = { sentences: sentence, listeners: listener, accuracy: accuracyDiff };
            }
          }
        }
      }
    }

    displayResults(bestResult);
  }

  // Display the results
  function displayResults(result) {
    const resultsDiv = document.getElementById('results');
    if (result.sentences !== null && result.listeners !== null) {
      resultsDiv.innerHTML = `
        <p>Number of Sentences: ${result.sentences}</p>
        <p>Number of Listeners: ${result.listeners}</p>
        <p>Closest Accuracy: ${result.accuracy + parseInt(document.getElementById('accuracyLevel').value, 10)}%</p>
      `;
    } else {
      resultsDiv.innerHTML = '<p>No matching results found.</p>';
    }
  }

  // Update the accuracy label based on the slider value
  function updateAccuracyLabel() {
    const slider = document.getElementById('accuracyLevel');
    const label = document.getElementById('accuracyLabel');
    label.textContent = slider.value + '%';
  }

  // Initialize the slider value display
  document.addEventListener('DOMContentLoaded', () => {
    updateAccuracyLabel();
  });

console.log('JavaScript file loaded successfully.');
</script>