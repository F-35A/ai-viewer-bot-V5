// api/oauth-start.js
const { setCORS, parseBody } = require('./_utils');

module.exports = async (req, res) => {
  setCORS(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'POST만 허용' });

  const { clientId, clientSecret } = parseBody(req);

  if (!clientId)     return res.json({ success: false, error: 'clientId가 없습니다' });
  if (!clientSecret) return res.json({ success: false, error: 'clientSecret이 없습니다' });

  const proto       = req.headers['x-forwarded-proto'] || 'https';
  const host        = req.headers['x-forwarded-host']  || req.headers.host;
  const redirectUri = `${proto}://${host}/api/oauth-callback`;

  // state에 clientId, clientSecret 담아서 콜백에서 사용
  const state = Buffer.from(JSON.stringify({ clientId, clientSecret, redirectUri })).toString('base64');

  const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
    + `?client_id=${encodeURIComponent(clientId)}`
    + `&redirect_uri=${encodeURIComponent(redirectUri)}`
    + `&response_type=code`
    + `&scope=${encodeURIComponent('https://www.googleapis.com/auth/youtube')}`
    + `&access_type=offline`
    + `&prompt=consent`
    + `&state=${encodeURIComponent(state)}`;

  res.json({ success: true, authUrl });
};
