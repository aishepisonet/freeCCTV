// validate-client.js
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('overlay');
    const overlayText = document.getElementById('overlayText');
    const overlayButton = document.getElementById('overlayButton');

    if (!overlay || !overlayText) {
        console.error('Overlay elements missing!');
        return;
    }

    let locked = false;
    let validating = false;

    function showOverlay(text, showButton = false) {
        overlayText.textContent = text;
        overlay.classList.add('show');
        
        if (overlayButton) {
            overlayButton.style.display = showButton ? 'block' : 'none';
        }
    }

    function hideOverlay(delay = 800) {
        setTimeout(() => {
            overlay.classList.remove('show');
            if (overlayButton) {
                overlayButton.style.display = 'none';
            }
        }, delay);
    }

    function lockApp(msg = '🔒 Access restricted', showReconnectButton = true) {
        if (locked) return;
        locked = true;
        showOverlay(msg, showReconnectButton);
        document.body.classList.add('locked');
    }

    // Get token from URL or sessionStorage
    const params = new URLSearchParams(window.location.search);
    let token = params.get('token');
    let ts = params.get('ts');

    if (token && ts) {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('ts', ts);
        history.replaceState({}, '', location.pathname);
    } else {
        token = sessionStorage.getItem('token');
        ts = sessionStorage.getItem('ts');
    }

    // Validate with backend API
    async function validateAccess() {
        if (locked || validating) return;
        validating = true;

        if (!token || !ts) {
            lockApp('🔒 Session expired. Please reconnect to WiFi.', true);
            validating = false;
            return;
        }

        try {
            showOverlay('Checking access...', false);
            
            const res = await fetch(`/api/validate?token=${token}&ts=${ts}`, { 
                cache: 'no-store' 
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                lockApp(`🔒 ${data.reason || 'Access denied'}`, true);
            } else {
                hideOverlay();
            }
        } catch (err) {
            console.error('Validation error:', err);
            lockApp('🔒 Network error. Please check your connection.', true);
        } finally {
            validating = false;
        }
    }

    // Run validation
    showOverlay('Loading app...', false);
    validateAccess();

    // Recheck every 60 seconds
    setInterval(validateAccess, 60000);

    // Recheck when tab becomes visible
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) validateAccess();
    });

    // Network change monitoring
    if ('connection' in navigator && navigator.connection) {
       navigator.connection.addEventListener('change', () => {
            showOverlay('Network changed...', false);
           validateAccess();
         });
    }
});

////////////////////////////////////////////////////////////////////

/*
// validate.js
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('overlay');
    const overlayText = document.getElementById('overlayText');

    if (!overlay || !overlayText) {
        console.error('Overlay elements missing!');
        return;
    }

    let locked = false;
    let validating = false;

    function showOverlay(text) {
        overlayText.textContent = text;
        overlay.classList.add('show');
    }

    function hideOverlay(delay = 800) {
        setTimeout(() => overlay.classList.remove('show'), delay);
    }

    function lockApp(msg = '🔒 Access restricted') {
        if (locked) return;
        locked = true;
        showOverlay(msg);
        document.body.classList.add('locked');
    }

    // Get token from URL or sessionStorage
    const params = new URLSearchParams(window.location.search);
    let token = params.get('token');
    let ts = params.get('ts');

    if (token && ts) {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('ts', ts);
        history.replaceState({}, '', location.pathname);
    } else {
        token = sessionStorage.getItem('token');
        ts = sessionStorage.getItem('ts');
    }

    // Validate access
    async function validateAccess() {
        if (locked || validating) return;
        validating = true;

        if (!token || !ts) {
            lockApp('🔒 Session expired. Please reconnect to WiFi.');
            validating = false;
            return;
        }

        try {
            showOverlay('Checking access...');
            const res = await fetch(`/api/validate?token=${token}&ts=${ts}`, { 
                cache: 'no-store' 
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                lockApp(`🔒 ${data.reason || 'Access denied'}`);
            } else {
                hideOverlay();
            }
        } catch (err) {
            console.error('Validation error:', err);
            lockApp('🔒 Network error');
        } finally {
            validating = false;
        }
    }

    // Run validation
    showOverlay('Loading app...');
    validateAccess();

    // Recheck every 60 seconds
   // setInterval(validateAccess, 60000);
    setInterval(validateAccess, 3 * 60 * 1000); // every 3 minutes


    // Recheck when tab becomes visible
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) validateAccess();
    });

    // Network change monitoring
    if ('connection' in navigator && navigator.connection) {
        navigator.connection.addEventListener('change', () => {
            showOverlay('Network changed...');
            validateAccess();
        });
    }
});
*/
