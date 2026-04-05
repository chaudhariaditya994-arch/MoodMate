// calculator.js - Mood calculator for MoodMate

function calculateMood() {
    const form = document.getElementById('moodForm');
    if (!form) return;
    
    const mood = document.querySelector('input[name="mood"]:checked');
    if (!mood) {
        document.getElementById('moodScore').textContent = 'Please select a mood!';
        return;
    }
    
    // Mood scores: happy=3, relaxed=2, sad=1
    const scores = { happy: 3, relaxed: 2, sad: 1 };
    const score = scores[mood.value];
    
    // Get history for average
    const history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    const avgScore = history.length > 0 ? (history.reduce((sum, entry) => sum + scores[entry.mood], 0) / history.length) : score;
    
    let message = `Your mood score: ${score}/3`;
    if (history.length > 0) {
        message += `<br>Average mood score: ${avgScore.toFixed(1)}/3`;
    }
    
    if (avgScore > 2.5) {
        message += '<br>Great! Keep up the positive vibes! 🎉';
    } else if (avgScore < 1.5) {
        message += '<br>Consider some self-care activities. 💕';
    }
    
    document.getElementById('moodScore').innerHTML = message;
}

// Export for use
window.calculateMood = calculateMood;

