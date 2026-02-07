import crypto from 'crypto';

export default function handler(req, res) {
  try {
    // Get client IP
    const clientIP =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
      req.socket.remoteAddress ||
      'unknown';
    
    console.log('[INFO] Access attempt from IP:', clientIP);
    
    // ========================================
    // Security Check 1: IP Whitelist
    // ========================================
 
    const ALLOWED_IPS = process.env.ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [];
    const YOUR_ISP_RANGE = /^103\.167\.161\.\d{1,3}$/; // Your ISP range Cebu Cable Ip address Ma Issa House
    const YOUR_ISP_RANGE0 = /^103\.167\.160\.\d{1,3}$/; // Your ISP range Cebu Cable Ip address @ Aishepisonet
    const YOUR_ISP_RANGE1 = /^158\.62\.57\.\d{1,3}$/; // Your ISP range Jessie Manipis Ip address
    
    const isYourISP = YOUR_ISP_RANGE.test(clientIP);
    const isWhitelisted = ALLOWED_IPS.includes(clientIP);
    const isAllowedIP = isYourISP || isWhitelisted;
    
    if (!isAllowedIP) {
      console.warn(`[SECURITY] ❌ Blocked access from unauthorized IP: ${clientIP}`);
      return sendErrorHTML(res, {
        title: 'Access Denied',
        message: 'This endpoint is only accessible from authorized IP addresses.',
        icon: '🚫',
        showRetry: false,
        showDebug: `Your IP: ${clientIP}`
      });
    }
    
    console.log('[SECURITY] ✓ IP check passed:', clientIP);
    
    // ========================================
    // Security Check 2: Access Key
    // ========================================
    const accessKey = req.query.key;
    const ISSUE_ACCESS_KEY = process.env.ISSUE_ACCESS_KEY;
    
    if (!ISSUE_ACCESS_KEY) {
      console.error('[CONFIG] ⚠️ ISSUE_ACCESS_KEY not configured');
    }
    
    if (ISSUE_ACCESS_KEY && (!accessKey || accessKey !== ISSUE_ACCESS_KEY)) {
      console.warn(`[SECURITY] 🔐 Invalid or missing access key from IP: ${clientIP}`);
      return sendErrorHTML(res, {
        title: 'Authentication Required',
        message: 'Invalid or missing authentication credentials.',
        icon: '🔐',
        showRetry: false,
        showDebug: accessKey ? 'Invalid key provided' : 'No key provided'
      });
    }
    
    console.log('[SECURITY] ✓ Access key verified');
    
    // ========================================
    // Success - Redirect to App WITH KEY
    // ========================================
    const redirectURL = `https://iptvsample.vercel.app/?key=${accessKey}`;
    
    console.log('[SUCCESS] ✓ Security checks passed, redirecting to app');
    
    return res.redirect(302, redirectURL);
    
  } catch (error) {
    console.error('[ERROR] ❌ Issue API error:', error);
    return sendErrorHTML(res, {
      title: 'Service Error',
      message: 'An unexpected error occurred. Please try again or contact support.',
      icon: '🔌',
      showRetry: true,
      showDebug: error.message
    });
  }
}

function sendErrorHTML(res, { title, message, icon, showRetry = true, showDebug = null }) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    
    .container {
      background: white;
      padding: 50px 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      text-align: center;
      animation: fadeIn 0.5s ease;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .icon {
      font-size: 80px;
      margin-bottom: 20px;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    h1 {
      color: #333;
      margin-bottom: 15px;
      font-size: 28px;
      font-weight: 600;
    }
    
    p {
      color: #666;
      line-height: 1.8;
      margin-bottom: 30px;
      font-size: 16px;
    }
    
    .buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 15px 35px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-weight: bold;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
      font-size: 16px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    
    .btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
    }
    
    .btn:active {
      transform: translateY(-1px);
    }
    
    .btn-secondary {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    
    .btn-secondary:hover {
      box-shadow: 0 10px 25px rgba(240, 147, 251, 0.4);
    }
    
    .debug-info {
      margin-top: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 10px;
      font-size: 12px;
      color: #6c757d;
      border-left: 4px solid #667eea;
      text-align: left;
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 40px 30px;
      }
      
      h1 {
        font-size: 24px;
      }
      
      p {
        font-size: 14px;
      }
      
      .btn {
        padding: 12px 28px;
        font-size: 14px;
      }
      
      .buttons {
        flex-direction: column;
      }
      
      .btn {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    
    <div class="buttons">
      ${showRetry ? '<button class="btn" onclick="location.reload()">🔄 Try Again</button>' : ''}
      <a href="http://10.0.0.1/portal.html" class="btn btn-secondary">🏠 Back to Portal</a>
    </div>

    ${showDebug ? `<div class="debug-info">Debug: ${showDebug}</div>` : ''}
  </div>
  
</body>
</html>
  `;
  
  return res.status(403).setHeader('Content-Type', 'text/html').send(html);
}

////////////////////// /api/issue.js ///////////////////////////////////////////////////////
/*
import crypto from 'crypto';

// Rate limiting store (in-memory for serverless)
const requestLog = new Map();

export default function handler(req, res) {
  try {
    // Get client IP
    const clientIP =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
      req.socket.remoteAddress ||
      'unknown';
    
    console.log('[INFO] Access attempt from IP:', clientIP);
    
    // ========================================
    // Security Check 1: IP Whitelist ISP ip 103.167.161.176
    // ========================================
 
    const ALLOWED_IPS = process.env.ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [];
    //const IP_RANGE_PATTERN = /^10\.0\.0\.\d{1,3}$/; // Hotspot network range
    const YOUR_ISP_RANGE = /^103\.167\.161\.\d{1,3}$/; // Your ISP range
    //const YOUR_ISP_RANGE = /^192\.168\.123\.\d{1,3}$/; // Your ISP range
    
    
    // Allow hotspot network IPs OR specific whitelisted IPs
    //const isHotspotIP = IP_RANGE_PATTERN.test(clientIP);
    const isYourISP = YOUR_ISP_RANGE.test(clientIP);
    const isWhitelisted = ALLOWED_IPS.includes(clientIP);
    const isAllowedIP = isYourISP || isWhitelisted;
    
    if (!isAllowedIP) {
      console.warn(`[SECURITY] ❌ Blocked access from unauthorized IP: ${clientIP}`);
      return sendErrorHTML(res, {
        title: 'Access Denied',
        message: 'This endpoint is only accessible from the hotspot network.',
        icon: '🚫',
        showRetry: false,
        showDebug: `Your IP: ${clientIP}`
      });
    }
    
    console.log('[SECURITY] ✓ IP check passed:', clientIP);
    
    // ========================================
    // Security Check 2: Rate Limiting
    // ========================================
    const now = Date.now();
    const rateKey = `${clientIP}`;
    const requests = requestLog.get(rateKey) || [];
    
    // Clean old requests (older than 1 minute)
    const recentRequests = requests.filter(timestamp => now - timestamp < 60000);
    
    // Allow max 5 requests per minute per IP
    if (recentRequests.length >= 5) {
      console.warn(`[SECURITY] ⏱️ Rate limit exceeded for IP: ${clientIP}`);
      return sendErrorHTML(res, {
        title: 'Too Many Requests',
        message: 'You are making too many requests. Please wait a moment before trying again.',
        icon: '⏱️',
        showRetry: true,
        showDebug: `Requests in last minute: ${recentRequests.length}`
      });
    }
    
    // Log this request
    recentRequests.push(now);
    requestLog.set(rateKey, recentRequests);
    
    // Clean up old entries (keep only last 100 IPs)
    if (requestLog.size > 100) {
      const oldestKey = requestLog.keys().next().value;
      requestLog.delete(oldestKey);
    }
    
    console.log('[SECURITY] ✓ Rate limit check passed');
    
    // ========================================
    // Security Check 3: Access Key
    // ========================================
    const accessKey = req.query.key;
    const ISSUE_ACCESS_KEY = process.env.ISSUE_ACCESS_KEY;
    
    if (!ISSUE_ACCESS_KEY) {
      console.error('[CONFIG] ⚠️ ISSUE_ACCESS_KEY not configured');
    }
    
    if (ISSUE_ACCESS_KEY && (!accessKey || accessKey !== ISSUE_ACCESS_KEY)) {
      console.warn(`[SECURITY] 🔐 Invalid or missing access key from IP: ${clientIP}`);
      return sendErrorHTML(res, {
        title: 'Authentication Required',
        message: 'Invalid or missing authentication credentials.',
        icon: '🔐',
        showRetry: false,
        showDebug: accessKey ? 'Invalid key provided' : 'No key provided'
      });
    }
    
    console.log('[SECURITY] ✓ Access key verified');
    
    // ========================================
    // Generate Token
    // ========================================
    const SECRET = process.env.HOTSPOT_SECRET;
    
    if (!SECRET) {
      console.error('[ERROR] ❌ HOTSPOT_SECRET is not configured');
      return sendErrorHTML(res, {
        title: 'Configuration Error',
        message: 'Server is not properly configured. Please contact the administrator.',
        icon: '⚙️',
        showRetry: false,
        showDebug: 'HOTSPOT_SECRET missing'
      });
    }
    
    const ts = Date.now();
    const token = crypto
      .createHmac('sha256', SECRET)
      .update(ts + '|' + clientIP)
      .digest('hex');
    
    //const redirectURL = `https://iptvsample.vercel.app/?token=${token}&ts=${ts}`;
    const redirectURL = `https://iptvsample.vercel.app/?token=a94663437afaf47a079f27d364df4560947c03e3b0c50c5394eb47b2552eb5ed`;
    
    console.log('[SUCCESS] ✓ Token generated, redirecting to app');
    
    return res.redirect(302, redirectURL);
    
  } catch (error) {
    console.error('[ERROR] ❌ Issue API error:', error);
    return sendErrorHTML(res, {
      title: 'Service Error',
      message: 'An unexpected error occurred. Please try again or contact support.',
      icon: '🔌',
      showRetry: true,
      showDebug: error.message
    });
  }
}

function sendErrorHTML(res, { title, message, icon, showRetry = true, showDebug = null }) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    
    .container {
      background: white;
      padding: 50px 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      text-align: center;
      animation: fadeIn 0.5s ease;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .icon {
      font-size: 80px;
      margin-bottom: 20px;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    h1 {
      color: #333;
      margin-bottom: 15px;
      font-size: 28px;
      font-weight: 600;
    }
    
    p {
      color: #666;
      line-height: 1.8;
      margin-bottom: 30px;
      font-size: 16px;
    }
    
    .buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 15px 35px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-weight: bold;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
      font-size: 16px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    
    .btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
    }
    
    .btn:active {
      transform: translateY(-1px);
    }
    
    .btn-secondary {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    
    .btn-secondary:hover {
      box-shadow: 0 10px 25px rgba(240, 147, 251, 0.4);
    }
    
    .debug-info {
      margin-top: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 10px;
      font-size: 12px;
      color: #6c757d;
      border-left: 4px solid #667eea;
      text-align: left;
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 40px 30px;
      }
      
      h1 {
        font-size: 24px;
      }
      
      p {
        font-size: 14px;
      }
      
      .btn {
        padding: 12px 28px;
        font-size: 14px;
      }
      
      .buttons {
        flex-direction: column;
      }
      
      .btn {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    
    <div class="buttons">
      ${showRetry ? '<button class="btn" onclick="location.reload()">🔄 Try Again</button>' : ''}
      <a href="http://10.0.0.1/portal.html" class="btn btn-secondary">🏠 Back to Portal</a>
    </div>

    ${showDebug ? `<div class="debug-info">Debug: ${showDebug}</div>` : ''}
  </div>
  
</body>
</html>
  `;
  
  return res.status(403).setHeader('Content-Type', 'text/html').send(html);
}
*/
