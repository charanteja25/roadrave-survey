/* eslint-env browser */
// Extracted from index.html <script>
let currentSection = 1;
const totalSections = 11;
const formData = {};

// --- Function Definitions (move above usage) ---
function updateProgressBar() {
    const percent = Math.min(100, Math.round((currentSection-1) / gamifiedTotalSections * 100));
    const bar = document.getElementById('gamifiedProgressBar');
    if (bar) bar.style.width = percent + '%';
}
function showBadgePopup(badge) {
    const popup = document.getElementById('badgePopup');
    if (!popup) return;
    const emoji = document.getElementById('badgePopupEmoji');
    const text = document.getElementById('badgePopupText');
    if (emoji) emoji.textContent = badge.emoji;
    if (text) text.textContent = ` You earned the "${badge.name}" badge!`;
    popup.style.display = 'block';
    setTimeout(() => { popup.style.display = 'none'; }, 2000);
}
function checkAndAwardBadges(flatData) {
    badgeRules.forEach(badge => {
        if (badge.check(flatData) && !earnedBadges.find(b => b.id === badge.id)) {
            earnedBadges.push(badge);
            showBadgePopup(badge);
        }
    });
}
function getPersonality(flatData) {
    let scores = { social: 0, planner: 0, adventurer: 0, solo: 0 };
    if (flatData.importanceConnect === 'very-important') scores.social++;
    if (flatData.features && flatData.features.includes('meetup')) scores.social++;
    if (flatData.carpoolInterest === 'no') scores.solo++;
    if (flatData.travelMethod === 'own-car') scores.solo++;
    if (flatData.planningChallenges && flatData.planningChallenges.includes('booking')) scores.planner++;
    if (flatData.safetyImportance === 'very-important' || flatData.safetyImportance === 'essential') scores.planner++;
    if (flatData.frequency === 'often' || flatData.frequency === 'very-often') scores.adventurer++;
    if (flatData.features && flatData.features.includes('event-discovery')) scores.adventurer++;
    let maxType = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    const personalities = {
        social: { emoji: '🦋', name: 'The Social Butterfly', desc: 'You love meeting new people and making connections at every event! Group chats, meetups, and social features are your jam.' },
        planner: { emoji: '🗓️', name: 'The Planner', desc: 'You’re all about logistics, safety, and making sure everything goes smoothly. You value organization and peace of mind.' },
        adventurer: { emoji: '🎸', name: 'The Adventurer', desc: 'You’re always up for a new experience and love attending events. You’re spontaneous, energetic, and ready for anything!' },
        solo: { emoji: '🦄', name: 'The Soloist', desc: 'You value your independence and enjoy events on your own terms. You’re confident, unique, and do things your way.' },
    };
    return personalities[maxType];
}
function getFlatFormData() {
    const flatData = {};
    Object.keys(formData).forEach(key => {
        if (formData[key] && formData[key].type === 'checkbox') {
            flatData[key] = formData[key].values;
        } else if (formData[key] && formData[key].type) {
            flatData[key] = formData[key].value;
        } else {
            flatData[key] = formData[key];
        }
    });
    ['frequency','safetyImportance','travelMethod','carpoolInterest','importanceConnect','features','planningChallenges'].forEach(name => {
        const el = document.querySelector(`[name="${name}"]`);
        if (el && el.type === 'radio') {
            const checked = document.querySelector(`[name="${name}"]:checked`);
            if (checked) flatData[name] = checked.value;
        } else if (el && el.type === 'checkbox') {
            flatData[name] = Array.from(document.querySelectorAll(`[name="${name}"]:checked`)).map(e=>e.value);
        }
    });
    return flatData;
}
function showGamifiedSummary(flatData) {
    const badgeDiv = document.getElementById('earnedBadges');
    if (badgeDiv) {
        if (earnedBadges.length === 0) {
            badgeDiv.innerHTML = '<div style="color:#aaa;font-size:1.1em;">No badges earned yet... but you still rock! 🤘</div>';
        } else {
            badgeDiv.innerHTML = earnedBadges.map(b => `<span style="display:inline-block;margin:0 10px 10px 0;font-size:2em;">${b.emoji}</span><span style="font-weight:bold;">${b.name}</span><br><span style="font-size:0.95em;color:#666;">${b.desc}</span><br>`).join('<br>');
        }
    }
    const personality = getPersonality(flatData);
    const summaryDiv = document.getElementById('personalitySummary');
    if (summaryDiv) summaryDiv.innerHTML = `<span style="font-size:2em;">${personality.emoji}</span><br><span style="font-weight:bold;font-size:1.2em;">${personality.name}</span><br>${personality.desc}`;
}

// --- Gamification Data ---
const gamifiedTotalSections = 11;
const badgeRules = [
    { id: 'festivalFanatic', emoji: '🎪', name: 'Festival Fanatic', desc: 'Attends events very often', check: data => data.frequency === 'very-often' },
    { id: 'safetyStar', emoji: '🛡️', name: 'Safety Star', desc: 'Values safety features highly', check: data => data.safetyImportance === 'very-important' || data.safetyImportance === 'essential' },
    { id: 'ecoTraveler', emoji: '🌱', name: 'Eco Traveler', desc: 'Chooses carpool or public transport', check: data => data.travelMethod === 'carpool' || data.travelMethod === 'public-transport' },
    { id: 'socialButterfly', emoji: '🦋', name: 'Social Butterfly', desc: 'Loves connecting with others', check: data => data.importanceConnect === 'very-important' },
    { id: 'soloist', emoji: '🦄', name: 'The Soloist', desc: 'Prefers to travel alone', check: data => data.carpoolInterest === 'no' },
    { id: 'planner', emoji: '🗓️', name: 'The Planner', desc: 'Cares about logistics and planning', check: data => data.planningChallenges && data.planningChallenges.includes('booking') },
    { id: 'adventurer', emoji: '🎸', name: 'The Adventurer', desc: 'Attends many events, open to new experiences', check: data => data.frequency === 'often' || data.frequency === 'very-often' },
];
let earnedBadges = [];

// --- DOMContentLoaded: All DOM access and event listeners go here ---
document.addEventListener('DOMContentLoaded', function() {
    // Set unique ID
    const uniqueIdInput = document.getElementById('uniqueId');
    if (uniqueIdInput) {
        uniqueIdInput.value = 'RR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    }
    // Hide all sections except the first
    document.querySelectorAll('.section').forEach(section => {
        if (section.dataset.section !== '1') {
            section.classList.add('hidden');
        }
    });
    updateProgressBar();

    // Next/Prev Section functions
    window.nextSection = function() {
        const currentSectionElement = document.querySelector(`[data-section="${currentSection}"]`);
        window.storeCurrentSectionData();
        currentSectionElement.classList.add('hidden');
        // Improved logic jump for 'Never' frequency
        if (currentSection === 3) {
            const freq = document.querySelector('input[name="frequency"]:checked');
            if (freq && freq.value === 'never') {
                currentSection = 4; // Go to Challenges/Barriers
            } else {
                currentSection++;
            }
        } else if (currentSection === 4) {
            // If they selected 'never' in section 3, jump to Feedback after Challenges
            let freq = null;
            if (formData.frequency && formData.frequency.value) {
                freq = formData.frequency.value;
            } else {
                const freqInput = document.querySelector('input[name="frequency"]:checked');
                if (freqInput) freq = freqInput.value;
            }
            if (freq === 'never') {
                currentSection = 9; // Feedback
            } else {
                currentSection++;
            }
        } else {
            currentSection++;
        }
        if (currentSection <= totalSections) {
            document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));
            const nextSectionElement = document.querySelector(`[data-section="${currentSection}"]`);
            if (nextSectionElement) nextSectionElement.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        updateProgressBar();
        const flatData = getFlatFormData();
        checkAndAwardBadges(flatData);
        if (currentSection === 12) {
            showGamifiedSummary(flatData);
        }
    };
    window.prevSection = function() {
        const currentSectionElement = document.querySelector(`[data-section="${currentSection}"]`);
        window.storeCurrentSectionData();
        currentSectionElement.classList.add('hidden');
        currentSection--;
        if (currentSection >= 0) {
            document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));
            const prevSectionElement = document.querySelector(`[data-section="${currentSection}"]`);
            if (prevSectionElement) {
                prevSectionElement.classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
        updateProgressBar();
    };

    // Store section data
    window.storeCurrentSectionData = function() {
        const currentSectionElement = document.querySelector(`[data-section="${currentSection}"]`);
        if (!currentSectionElement) return;
        const inputs = currentSectionElement.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            const groupName = input.name;
            if (input.type === 'radio' && input.checked) {
                formData[groupName] = { type: 'radio', value: input.value };
            } else if (input.type === 'checkbox') {
                if (!formData[groupName]) {
                    formData[groupName] = { type: 'checkbox', values: [] };
                }
                if (input.checked) {
                    formData[groupName].values.push(input.value);
                }
            } else if (input.type === 'textarea' || input.tagName === 'SELECT') {
                formData[groupName] = { type: input.type, value: input.value };
            }
        });
        try {
            localStorage.setItem('roadRaveFormData', JSON.stringify(formData));
        } catch (e) {
            console.error('Failed to save form data:', e);
        }
    };

    // Patch form submit to only validate visible section
    const researchForm = document.getElementById('researchForm');
    if (researchForm) {
        let submitting = false;
        researchForm.addEventListener('submit', async (e) => {
            if (submitting) {
                e.preventDefault();
                return;
            }
            // Remove required from hidden fields
            const hiddenInputs = Array.from(document.querySelectorAll('.section.hidden input, .section.hidden select, .section.hidden textarea'));
            const removedRequired = [];
            hiddenInputs.forEach(input => {
                if (input.hasAttribute('required')) {
                    input.removeAttribute('required');
                    removedRequired.push(input);
                }
            });
            // Only validate visible section
            const visibleSection = document.querySelector('.section:not(.hidden)');
            let valid = true;
            if (visibleSection) {
                const requiredInputs = visibleSection.querySelectorAll('[required]');
                requiredInputs.forEach(input => {
                    if (!input.checkValidity()) {
                        valid = false;
                        input.classList.add('input-error');
                        // Optionally, scroll to first invalid input
                        input.focus();
                    } else {
                        input.classList.remove('input-error');
                    }
                });
            }
            // Custom validation for email and age
            const emailInput = document.getElementById('userEmail');
            const ageInput = document.getElementById('userAge');
            let customError = false;
            // Email validation (if not empty)
            if (emailInput && emailInput.value) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(emailInput.value)) {
                    valid = false;
                    customError = true;
                    emailInput.classList.add('input-error');
                    const errMsg = emailInput.parentElement.querySelector('.error-message');
                    if (errMsg) errMsg.textContent = 'Please enter a valid email address.';
                    emailInput.focus();
                } else {
                    emailInput.classList.remove('input-error');
                    const errMsg = emailInput.parentElement.querySelector('.error-message');
                    if (errMsg) errMsg.textContent = '';
                }
            }
            // Age validation
            if (ageInput && ageInput.value) {
                const age = parseInt(ageInput.value, 10);
                if (isNaN(age) || age < 1 || age > 100) {
                    valid = false;
                    customError = true;
                    ageInput.classList.add('input-error');
                    const errMsg = ageInput.parentElement.querySelector('.error-message');
                    if (errMsg) errMsg.textContent = 'Please enter a valid age (1-100).';
                    ageInput.focus();
                } else {
                    ageInput.classList.remove('input-error');
                    const errMsg = ageInput.parentElement.querySelector('.error-message');
                    if (errMsg) errMsg.textContent = '';
                }
            }
            // If custom error, prevent submission and show section
            if (customError) {
                e.preventDefault();
                // Show the section with the error
                document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));
                const errorSection = emailInput && emailInput.classList.contains('input-error') ? emailInput.closest('.section') : ageInput.closest('.section');
                if (errorSection) errorSection.classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                // Restore required attributes
                removedRequired.forEach(input => input.setAttribute('required', 'required'));
                return;
            }
            if (!valid) {
                e.preventDefault();
                // Optionally, show a message
                if (!document.getElementById('sectionErrorMsg')) {
                    const msg = document.createElement('div');
                    msg.id = 'sectionErrorMsg';
                    msg.style.color = '#ff4444';
                    msg.style.margin = '10px 0';
                    msg.textContent = 'Please complete all required fields in this section.';
                    if (visibleSection) visibleSection.querySelector('.section-content').prepend(msg);
                }
                // Restore required attributes
                removedRequired.forEach(input => input.setAttribute('required', 'required'));
                return;
            } else {
                // Remove error message if present
                const msg = document.getElementById('sectionErrorMsg');
                if (msg) msg.remove();
            }
            // Now proceed with submission
            e.preventDefault();
            submitting = true;
            // Disable all submit buttons
            researchForm.querySelectorAll('button[type="submit"], .btn-next').forEach(btn => btn.disabled = true);
            window.storeCurrentSectionData();
            document.querySelector(`[data-section="${currentSection}"]`).classList.add('hidden');
            currentSection = totalSections;
            document.querySelector(`[data-section="${currentSection}"]`).classList.remove('hidden');
            const flatData = getFlatFormData();
            flatData.uniqueId = document.getElementById('uniqueId') ? document.getElementById('uniqueId').value : '';
            flatData.userName = document.getElementById('userName') ? document.getElementById('userName').value : '';
            flatData.userAge = document.getElementById('userAge') ? document.getElementById('userAge').value : '';
            flatData.userGender = document.getElementById('userGender') ? document.getElementById('userGender').value : '';
            flatData.userEmail = document.getElementById('userEmail') ? document.getElementById('userEmail').value : '';
            // Debug: log all data being sent
            console.log('Submitting data:', flatData);
            const endpoint = 'https://sheetdb.io/api/v1/5p4g8qrf3tr1c';
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: flatData })
                });
                if (response.ok) {
                    document.querySelector('.thank-you .section-content').innerHTML += '<div style="margin-top:20px;color:#fff;background:#43e97b;padding:16px;border-radius:10px;">Your responses have been saved! ✅<br><small>You can connect this form to Google Sheets, SheetDB, or your own backend by changing the endpoint in the code.</small></div>';
                } else {
                    document.querySelector('.thank-you .section-content').innerHTML += '<div style="margin-top:20px;color:#fff;background:#ff4444;padding:16px;border-radius:10px;">There was a problem saving your responses. Please try again.</div>';
                    submitting = false;
                    researchForm.querySelectorAll('button[type="submit"], .btn-next').forEach(btn => btn.disabled = false);
                }
            } catch {
                document.querySelector('.thank-you .section-content').innerHTML += '<div style="margin-top:20px;color:#fff;background:#ff4444;padding:16px;border-radius:10px;">There was a problem saving your responses. Please try again.</div>';
                submitting = false;
                researchForm.querySelectorAll('button[type="submit"], .btn-next').forEach(btn => btn.disabled = false);
            }
            localStorage.removeItem('roadRaveFormData');
            currentSection = 12;
            document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));
            document.querySelector('[data-section="12"]').classList.remove('hidden');
            updateProgressBar();
            showGamifiedSummary(getFlatFormData());
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Restore required attributes
            removedRequired.forEach(input => input.setAttribute('required', 'required'));
        });
    }
    // Beta form submit
    const betaForm = document.getElementById('betaForm');
    if (betaForm) {
        betaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('betaEmail') ? document.getElementById('betaEmail').value : '';
            const consent = document.getElementById('betaConsent') ? document.getElementById('betaConsent').checked : false;
            const uniqueId = document.getElementById('uniqueId') ? document.getElementById('uniqueId').value : '';
            if (!email || !consent) return;
            try {
                await fetch('https://sheetdb.io/api/v1/5p4g8qrf3tr1c', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: { uniqueId, betaEmail: email, betaConsent: consent ? 'yes' : 'no' } })
                });
                document.getElementById('betaForm').style.display = 'none';
                document.getElementById('betaSuccess').style.display = 'block';
            } catch {
                document.getElementById('betaSuccess').style.display = 'block';
                document.getElementById('betaSuccess').innerText = 'There was a problem saving your beta signup. Please try again.';
            }
        });
    }
    // Share profile button
    const shareBtn = document.getElementById('shareProfileBtn');
    if (shareBtn) {
        shareBtn.onclick = function() {
            const summary = document.getElementById('personalitySummary') ? document.getElementById('personalitySummary').innerText : '';
            const badges = earnedBadges.map(b=>b.emoji+" "+b.name).join(', ');
            const shareText = `My RoadRave Event Profile: ${summary}\nBadges: ${badges}\nTake the quiz at [your-link]`;
            if (navigator.share) {
                navigator.share({ title: 'My RoadRave Event Profile', text: shareText });
            } else {
                navigator.clipboard.writeText(shareText);
                alert('Profile copied! Share it with your friends!');
            }
        };
    }

    // Gender 'Other' toggle
    window.toggleGenderOther = function() {
        const genderSelect = document.getElementById('userGender');
        const genderOther = document.getElementById('genderOther');
        if (genderSelect && genderOther) {
            if (genderSelect.value === 'other') {
                genderOther.classList.remove('hidden');
            } else {
                genderOther.classList.add('hidden');
            }
        }
    };
    // Region 'Other' toggle
    window.toggleRegionOther = function() {
        const regionSelect = document.getElementById('region');
        const regionOther = document.getElementById('regionOther');
        if (regionSelect && regionOther) {
            if (regionSelect.value === 'other') {
                regionOther.classList.remove('hidden');
            } else {
                regionOther.classList.add('hidden');
            }
        }
    };
    // Occupation followups toggle
    window.toggleOccupationFollowups = function() {
        const occupation = document.getElementById('occupation');
        const occupationOther = document.getElementById('occupationOther');
        const student = document.getElementById('studentFollowup');
        const youngPro = document.getElementById('youngProfessionalFollowup');
        const freelancer = document.getElementById('freelancerFollowup');
        const academia = document.getElementById('academiaFollowup');
        const professional = document.getElementById('professionalFollowup');
        // Hide all
        if (occupationOther) occupationOther.classList.add('hidden');
        if (student) student.classList.add('hidden');
        if (youngPro) youngPro.classList.add('hidden');
        if (freelancer) freelancer.classList.add('hidden');
        if (academia) academia.classList.add('hidden');
        if (professional) professional.classList.add('hidden');
        // Show relevant
        if (occupation) {
            switch (occupation.value) {
                case 'student': if (student) student.classList.remove('hidden'); break;
                case 'young-professional': if (youngPro) youngPro.classList.remove('hidden'); break;
                case 'freelancer': if (freelancer) freelancer.classList.remove('hidden'); break;
                case 'academia': if (academia) academia.classList.remove('hidden'); break;
                case 'professional': if (professional) professional.classList.remove('hidden'); break;
                case 'other': if (occupationOther) occupationOther.classList.remove('hidden'); break;
            }
        }
    };
    // Generic 'Other' toggle for select, radio, and checkbox groups
    window.toggleOther = function(group) {
        const groupEls = document.getElementsByName(group);
        const otherInput = document.getElementsByName(group + 'Other')[0];
        if (!groupEls || !otherInput) return;
        let show = false;
        groupEls.forEach(el => {
            if ((el.type === 'checkbox' || el.type === 'radio') && el.checked && el.value === 'other') {
                show = true;
            }
            if (el.tagName === 'SELECT' && el.value === 'other') {
                show = true;
            }
        });
        if (show) {
            otherInput.classList.remove('hidden');
        } else {
            otherInput.classList.add('hidden');
        }
    };
}); 