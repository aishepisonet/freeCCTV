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
    
    // Get access key from URL or sessionStorage
    const params = new URLSearchParams(window.location.search);
    let accessKey = params.get('key');
    
    if (accessKey) {
        sessionStorage.setItem('accessKey', accessKey);
        // Clean URL without reloading
        history.replaceState({}, '', location.pathname);
    } else {
        accessKey = sessionStorage.getItem('accessKey');
    }
    
    async function validateAccess(silent = true) {
        if (locked || validating) return;
        validating = true;
        
        // ❌ No access key = hard lock
        if (!accessKey) {
            lockApp('🔒 Access denied. Authentication required.', false);
            validating = false;
            return;
        }
        
        try {
            // ✅ ONLY show overlay if NOT silent (first load)
            if (!silent) {
                showOverlay('Checking access...', false);
            }
            
            const res = await fetch(
                `/api/validate?key=${accessKey}`,
                { cache: 'no-store' }
            );
            
            const data = await res.json().catch(() => ({}));
            
            if (!res.ok || !data.ok) {
                throw new Error(data.reason || 'Access denied');
            }
            
            // Hide overlay ONLY if it was shown
            if (!silent) {
                hideOverlay();
            }
            
        } catch (err) {
            console.error('Validation error:', err);
            // ❌ HARD FAIL → show overlay + lock
            lockApp(
                `🔒 ${err.message || 'Access denied. Please check your credentials.'}`,
                false
            );
        } finally {
            validating = false;
        }
    }
    
    // Initial validation (silent)
    validateAccess(true);
    
    // Periodic validation every 5 minutes
    setInterval(() => validateAccess(true), 5 * 60 * 1000);
    
    // Reconnect button handler (if you have one)
    if (overlayButton) {
        overlayButton.addEventListener('click', () => {
            window.location.href = '/api/issue?key=' + (accessKey || '');
        });
    }
});
    
////////////////////////////////////////////////////////////////////

// validate-client.js
/*
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


    async function validateAccess(silent = true) {
    if (locked || validating) return;
    validating = true;

    // ❌ No token = hard lock
    if (!token || !ts) {
        lockApp('🔒 Session expired. Please reconnect to WiFi.', true);
        validating = false;
        return;
    }

    try {
        // ✅ ONLY show overlay if NOT silent (first load)
        if (!silent) {
            showOverlay('Checking access...', false);
        }

        const res = await fetch(
            `/api/validate?token=${token}&ts=${ts}`,
            { cache: 'no-store' }
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.ok) {
            throw new Error(data.reason || 'Access denied');
        }

        // 🔁 Token rotation (if enabled server-side)
        if (data.token && data.ts) {
            token = data.token;
            ts = data.ts;
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('ts', ts);
        }

        // Hide overlay ONLY if it was shown
        if (!silent) {
            hideOverlay();
        }

    } catch (err) {
        console.error('Validation error:', err);

        // ❌ HARD FAIL → show overlay + lock
        lockApp(
            `🔒 ${err.message || 'Session expired. Please reconnect.'}`,
            true
        );
    } finally {
        validating = false;
    }
}

    
    // Validate with backend API
 /*   
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
*/
    // Run validation
/*
    showOverlay('Loading app...', false);
    validateAccess(false);

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
*/
