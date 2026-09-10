// api/oauth-callback.js
const { tokenRequest } = require('./_utils');

module.exports = async (req, res) => {
  const { code, state, error } = req.query;

  const fail = (msg) => res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="background:#0a0a0f;color:#ff3b3b;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;gap:16px">
  <div style="font-size:40px">❌</div>
  <div style="font-size:18px">${msg}</div>
  <div style="font-size:13px;color:#5a5a7a">이 창을 닫고 다시 시도하세요</div>
</body></html>`);

  if (error) return fail(`로그인 취소: ${error}`);
  if (!code)  return fail('인증 코드가 없습니다');
  if (!state) return fail('state 파라미터가 없습니다');

  let clientId, clientSecret, redirectUri;
  try {
    const parsed  = JSON.parse(Buffer.from(state, 'base64').toString());
    clientId      = parsed.clientId;
    clientSecret  = parsed.clientSecret;
    redirectUri   = parsed.redirectUri;
  } catch {
    return fail('state 파싱 실패');
  }

  try {
    const td = await tokenRequest({
      code,
      client_id:     clientId,
      client_secret: clientSecret,
      redirect_uri:  redirectUri,
      grant_type:    'authorization_code',
    });

    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="background:#0a0a0f;color:#00e5ff;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;gap:16px">
  <div style="font-size:40px">✅</div>
  <div style="font-size:20px;font-weight:700">로그인 성공!</div>
  <div style="font-size:13px;color:#5a5a7a">이 창을 닫아도 됩니다</div>
  <script>
    try {
      window.opener && window.opener.postMessage({
        type:         'oauth-token',
        accessToken:  ${JSON.stringify(td.access_token)},
        refreshToken: ${JSON.stringify(td.refresh_token || '')},
        expiresIn:    ${Number(td.expires_in) || 3600}
      }, '*');
    } catch(e) {}
    setTimeout(() => window.close(), 1500);
  </script>
</body></html>`);
  } catch(e) {
    fail('토큰 교환 실패: ' + e.message);
  }
};
