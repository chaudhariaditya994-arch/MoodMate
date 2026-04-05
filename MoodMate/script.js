const moodMap = {
    Calm: {
        emoji: '😊',
        message: 'Feeling calm today? That’s a great moment to stay present.',
        category: 'positive'
    },
    Neutral: {
        emoji: '😐',
        message: 'A neutral day is a steady day. Keep checking in.',
        category: 'neutral'
    },
    Sad: {
        emoji: '😢',
        message: 'It’s okay to feel low sometimes. You are not alone.',
        category: 'negative'
    }
};

let selectedMood = null;

const moodQuotes = {
    Calm: [
        '“Peace comes from within. Do not seek it without.” — Buddha',
        '“The present moment is filled with joy and happiness. If you are attentive, you will see it.” — Thich Nhat Hanh',
        '“Breathing in, I calm my body. Breathing out, I smile.” — Thich Nhat Hanh',
        '“Tension is who you think you should be. Relaxation is who you are.” — Chinese Proverb'
    ],
    Neutral: [
        '“Every moment is a fresh beginning.” — T.S. Eliot',
        '“Small steps every day add up to big results.”',
        '“Not every day is good, but there is something good in every day.”',
        '“Progress is progress, no matter how small.”'
    ],
    Sad: [
        '“The only way out is through.” — Robert Frost',
        '“This too shall pass. You are stronger than you know.”',
        '“Sadness flies away on the wings of time.” — Jean de La Fontaine',
        '“Your present circumstances don’t determine where you can go; they merely determine where you start.” — Nido Qubein'
    ]
};

const moodTips = {
    Calm: [
        'Take five minutes to stretch and breathe slowly.',
        'Write one thing you appreciate about today.',
        'Savor a warm drink and enjoy the quiet moment.'
    ],
    Neutral: [
        'Set one small goal and celebrate when you finish it.',
        'Move your body for ten minutes to boost energy.',
        'Reach out to a friend and share a quick update.'
    ],
    Sad: [
        'Name three things you can do right now to feel a little better.',
        'Give yourself permission to rest and be kind to yourself.',
        'Try a short walk or a gentle breathing exercise.'
    ]
};

function getQuoteForMood(mood) {
    const quotes = moodQuotes[mood] || moodQuotes.Neutral;
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function getStoredHistory() {
    return JSON.parse(localStorage.getItem(getUserScopedKey('moodHistory'))) || [];
}

function saveMoodEntries(entries) {
    localStorage.setItem(getUserScopedKey('moodHistory'), JSON.stringify(entries));
}

function getStoredProfile() {
    return JSON.parse(localStorage.getItem(getUserScopedKey('personalInfo'))) || {};
}

function saveProfile(info) {
    localStorage.setItem(getUserScopedKey('personalInfo'), JSON.stringify(info));
}

function setActiveMoodButton(mood) {
    selectedMood = mood;
    document.querySelectorAll('.emoji-btn').forEach(button => {
        const isActive = button.dataset.mood === mood;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
    updateMoodCard();
}

function updateMoodCard() {
    const label = document.getElementById('todayMoodLabel');
    const emoji = document.getElementById('todayMoodEmoji');
    const message = document.getElementById('todayMoodMessage');
    const topName = document.getElementById('userName');
    const user = getCurrentUser();

    if (topName) {
        topName.textContent = user?.name || 'Guest';
    }

    if (!label || !emoji || !message) return;
    if (!selectedMood) {
        label.textContent = 'Neutral';
        emoji.textContent = '😐';
        message.textContent = 'Thanks for checking in! Keep going.';
        const quoteText = document.getElementById('moodQuote');
        if (quoteText) {
            quoteText.textContent = 'Choose how you feel and get a motivating quote tailored to your mood.';
        }
        return;
    }

    label.textContent = selectedMood;
    emoji.textContent = moodMap[selectedMood].emoji;
    message.textContent = moodMap[selectedMood].message;
    const quoteText = document.getElementById('moodQuote');
    if (quoteText) {
        quoteText.textContent = getQuoteForMood(selectedMood);
    }
}

function renderWeekMood() {
    const history = getStoredHistory();
    const list = document.getElementById('weekMoodList');
    if (!list) return;

    const weekItems = history.slice(0, 6);
    if (weekItems.length === 0) {
        list.innerHTML = '<div class="week-item">No entries yet</div>';
        return;
    }

    list.innerHTML = weekItems.map(entry => `
        <div class="week-item">
            <span class="emoji">${moodMap[entry.mood]?.emoji || '•'}</span>
            <strong>${entry.mood}</strong>
            <small>${entry.date}</small>
        </div>
    `).join('');
}

function renderInsights() {
    const history = getStoredHistory();
    const counts = { positive: 0, neutral: 0, negative: 0 };

    history.forEach(entry => {
        const category = moodMap[entry.mood]?.category;
        if (category) counts[category] += 1;
    });

    const total = Math.max(history.length, 1);
    const positiveBar = document.getElementById('positiveBar');
    const neutralBar = document.getElementById('neutralBar');
    const negativeBar = document.getElementById('negativeBar');
    const note = document.getElementById('insightNote');

    if (positiveBar) positiveBar.style.width = `${(counts.positive / total) * 100}%`;
    if (neutralBar) neutralBar.style.width = `${(counts.neutral / total) * 100}%`;
    if (negativeBar) negativeBar.style.width = `${(counts.negative / total) * 100}%`;

    if (!note) return;
    if (history.length === 0) {
        note.textContent = 'Save your first mood for personalized insights.';
    } else if (counts.positive >= counts.neutral && counts.positive >= counts.negative) {
        note.textContent = 'Positive days are your strongest trend right now.';
    } else if (counts.neutral >= counts.positive && counts.neutral >= counts.negative) {
        note.textContent = 'Most of your days feel even and steady.';
    } else {
        note.textContent = 'You may be having more low days recently—be gentle with yourself.';
    }
}

function renderProfile() {
    const info = getStoredProfile();
    const infoDiv = document.getElementById('personalInfo');
    const topName = document.getElementById('userName');
    const currentUser = getCurrentUser();

    if (topName) {
        topName.textContent = currentUser?.name || info.name || 'Guest';
    }

    if (!infoDiv) return;

    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.name.value = info.name || currentUser?.name || '';
        profileForm.age.value = info.age || '';
        profileForm.email.value = info.email || currentUser?.email || '';
        profileForm.goals.value = info.goals || '';
    }

    if (Object.keys(info).length === 0) {
        infoDiv.innerHTML = '<p>No details saved yet.</p>';
        return;
    }

    infoDiv.innerHTML = `
        <ul>
            <li><strong>Name:</strong> ${info.name}</li>
            <li><strong>Age:</strong> ${info.age}</li>
            <li><strong>Email:</strong> ${info.email || currentUser?.email || 'Not set'}</li>
            <li><strong>Goals:</strong> ${info.goals || 'Not set'}</li>
        </ul>
    `;
}

function renderMotivationPage() {
    const header = document.getElementById('motivationHeader');
    const quotesList = document.getElementById('motivationalQuotes');
    const tipsList = document.getElementById('motivationTips');
    const activeButton = document.querySelector('.motivation-filter button.active');
    const mood = activeButton?.dataset.mood || 'Calm';

    if (!header || !quotesList || !tipsList) return;

    header.textContent = `${mood} Motivation`;
    quotesList.innerHTML = moodQuotes[mood].map(quote => `<li>${quote}</li>`).join('');
    tipsList.innerHTML = moodTips[mood].map(tip => `<li>${tip}</li>`).join('');
}

function attachMotivationHandlers() {
    document.querySelectorAll('.motivation-filter button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.motivation-filter button').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            renderMotivationPage();
        });
    });
}

function showMessage(message) {
    alert(message);
}

function saveMoodEntry(fromJournal = false) {
    if (!selectedMood) {
        showMessage('Please select a mood before saving.');
        return;
    }

    const noteField = document.getElementById('moodJournal');
    const note = noteField ? noteField.value.trim() : '';
    const history = getStoredHistory();

    history.unshift({
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: selectedMood,
        note
    });

    saveMoodEntries(history);
    renderWeekMood();
    renderInsights();
    updateMoodCard();

    if (noteField && fromJournal) {
        noteField.value = '';
    }
}

function saveProfileInfo() {
    const form = document.getElementById('profileForm');
    if (!form) return;

    const info = {
        name: form.name.value.trim(),
        age: form.age.value,
        email: form.email.value.trim(),
        goals: form.goals.value.trim()
    };

    if (!info.name || !info.age) {
        showMessage('Please fill in your name and age.');
        return;
    }

    saveProfile(info);
    renderProfile();
    showMessage('Your personal details were saved.');
}

function attachHandlers() {
    document.querySelectorAll('.emoji-btn').forEach(button => {
        button.addEventListener('click', () => setActiveMoodButton(button.dataset.mood));
    });

    const saveMoodBtn = document.getElementById('saveMoodBtn');
    if (saveMoodBtn) {
        saveMoodBtn.addEventListener('click', () => saveMoodEntry());
    }

    const saveJournalBtn = document.getElementById('saveJournalBtn');
    if (saveJournalBtn) {
        saveJournalBtn.addEventListener('click', () => saveMoodEntry(true));
    }

    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfileInfo);
    }

    attachMotivationHandlers();
}

document.addEventListener('DOMContentLoaded', () => {
    attachHandlers();
    renderWeekMood();
    renderInsights();
    renderProfile();
    renderMotivationPage();
    updateMoodCard();
});
