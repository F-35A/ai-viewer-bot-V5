// api/refresh.js — accessToken 자동 갱신
const { setCORS, tokenRequest } = require('./_utils');

module.exports = async (req, res) => {
  setCORS(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'POST만 허용' });

  const body = req.body || {};
  const { refreshToken, clientId, clientSecret } = typeof body === 'string' ? JSON.parse(body) : body;

  if (!refreshToken) return res.json({ success: false, error: 'refreshToken 없음' });
  if (!clientId)     return res.json({ success: false, error: 'clientId 없음' });
  if (!clientSecret) return res.json({ success: false, error: 'clientSecret 없음' });

  try {
    const td = await tokenRequest({
      refresh_token:  refreshToken,
      client_id:      clientId,
      client_secret:  clientSecret,
      grant_type:     'refresh_token',
    });
    res.json({
      success:      true,
      accessToken:  td.access_token,
      expiresIn:    td.expires_in || 3600,
    });
  } catch(e) {
    res.json({ success: false, error: e.message });
  }
};
