import crypto from 'crypto';

export default function handler(req, res) {
  const { token, ts, u, exp } = req.query;

  if (!token || !ts || !u || !exp) {
    return res.status(403).json({ ok: false });
  }

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket.remoteAddress;

  const expected = crypto
    .createHmac('sha256', process.env.ROUTER_SECRET)
    .update(`${u}|${ip}|${ts}`)
    .digest('hex');

  const age = Date.now() - Number(ts);
  const maxAge = Number(exp); // ✅ already ms

  if (expected !== token || age > maxAge) {
    return res.status(403).json({
      ok: false,
      reason: 'Session expired'
    });
  }

  // ✅ Valid session
  res.json({ ok: true });
}




/////////////////// /api/validate.js////////////////////////////////////////////
/*
import crypto from 'crypto';

export default function handler(req, res) {
  try {
    const { token, ts } = req.query;
    const SECRET = process.env.HOTSPOT_SECRET;
    
    // Check if secret is configured
    if (!SECRET) {
      console.error('HOTSPOT_SECRET not configured');
      return res.status(500).json({ 
        ok: false, 
        reason: 'Server configuration error' 
      });
    }
    
    // Get client IP
    const clientIP =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
      req.socket.remoteAddress ||
      'unknown';
    
    // Check hotspot IP range (optional)
  //  if (!/^10\.0\.0\.(\d{1,3})$/.test(clientIP)) {
 //    return res.status(403).json({ 
  //      ok: false, 
  //      reason: 'IP not allowed' 
  //    });
  //  }
    
    // Check if token and timestamp are provided
    if (!token || !ts) {
      return res.status(403).json({ 
        ok: false, 
        reason: 'Missing token or timestamp' 
      });
    }
    
    // Verify token
    const expected = crypto
      .createHmac('sha256', SECRET)
      .update(ts + '|' + clientIP)
      .digest('hex');
    
    // 10-hour expiry
    const TEN_HOURS = 10 * 60 * 60 * 1000;
  //  10 minutes = 10 * 60 * 1000 = 600,000 ms
  //  1 hour     = 60 * 60 * 1000 = 3,600,000 ms
  // 10 hours   = 10 * 60 * 60 * 1000 = 36,000,000 ms
  //  24 hours   = 24 * 60 * 60 * 1000 = 86,400,000 ms
    
    if (expected !== token) {
      return res.status(403).json({ 
        ok: false, 
        reason: 'Invalid token' 
      });
    }
    
    if (Date.now() - Number(ts) > TEN_HOURS) {
      return res.status(403).json({ 
        ok: false, 
        reason: 'Token expired' 
      });
    }
    
    // Token is valid
    return res.status(200).json({ ok: true });
    
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({ 
      ok: false, 
      reason: 'Internal server error' 
    });
  }
}
*/

////////////////////////////////////////////////////////////////////////////////////////////////////

// /api/validate.js
/*
import crypto from 'crypto';

export default function handler(req, res) {
    const { token, ts } = req.query;
    const SECRET = process.env.HOTSPOT_SECRET;

    const clientIP =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;

    // Check hotspot IP range
 //  if (!/^10\.0\.0\.(\d{1,3})$/.test(clientIP)) {
   //    return res.status(403).json({ ok: false, reason: 'IP not allowed' });
  //  }

    if (!token || !ts) return res.status(403).json({ ok: false, reason: 'Missing token' });

    const expected = crypto.createHmac('sha256', SECRET)
                           .update(ts + '|' + clientIP)
                           .digest('hex');

    // 10-minute expiry
    if (expected !== token || Date.now() - Number(ts) > 10*60*60*1000) {
        return res.status(403).json({ ok: false, reason: 'Invalid or expired token' });
    }

    res.status(200).json({ ok: true });
}


////////////////////////////////////////////////////////////////////////////////////////////



/**function getClientIP(req) {
    return (
        req.headers['x-forwarded-for']?.split(',').shift() ||
        req.socket?.remoteAddress ||
        'unknown'
    );
}

export default function handler(req, res) {
    const { token, ts } = req.query;

    // 🔒 Secret key (must match issue token)
    const SECRET = process.env.HOTSPOT_SECRET;

    // Get client IP
    const clientIP =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;

    // ---------- HOTSPOT RANGE CHECK ----------
    function isHotspotIP(ip) {
        // Simple check for 10.0.0.x
        return /^10\.0\.0\.(\d{1,3})$/.test(ip);
    }

    if (!isHotspotIP(clientIP)) {
        return res.status(403).json({ ok: false, reason: 'IP not allowed' });
    }

    // ---------- TOKEN VALIDATION ----------
    if (!token || !ts) {
        return res.status(403).json({ ok: false, reason: 'Missing token' });
    }

    const expected = crypto
        .createHmac('sha256', SECRET)
        .update(ts + '|' + clientIP)
        .digest('hex');

    // 10-minute expiry
    if (expected !== token || Date.now() - Number(ts) > 10 * 60 * 1000) {
        return res.status(403).json({ ok: false, reason: 'Invalid or expired token' });
    }

    // ✅ Success
    return res.status(200).json({ ok: true });
}



function getClientIP(req) {
    return (
        req.headers['x-forwarded-for']?.split(',').shift() ||
        req.socket?.remoteAddress ||
        'unknown'
    );
}

export default function handler(req, res) {
    const { token, ts } = req.query;
    const SECRET = process.env.HOTSPOT_SECRET;

    if (!token || !ts) {
        return res.status(403).json({ ok: false });
    }

    const clientIP = getClientIP(req);

    const expected = crypto
        .createHmac('sha256', SECRET)
        .update(ts + '|' + clientIP)
        .digest('hex');

    if (expected !== token || Date.now() - ts > 10 * 60 * 1000) {
        return res.status(403).json({ ok: false });
    }

    res.status(200).json({ ok: true });
}

export default function handler(req, res) {
  const { token, ts } = req.query;
  const SECRET = 'juanfi_super_secret_key';

  if (!token || !ts) {
    return res.status(401).json({ ok: false });
  }

  // Optional expiration (5 minutes)
  if (Date.now() - Number(ts) > 5 * 60 * 1000) {
    return res.status(401).json({ ok: false });
  }

  // Recreate token
  const client = req.headers['x-forwarded-for'] || 'unknown';
  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(`${ts}|${client}`)
    .digest('hex');

  if (expected !== token) {
    return res.status(401).json({ ok: false });
  }

  return res.status(200).json({ ok: true });
}
*/









