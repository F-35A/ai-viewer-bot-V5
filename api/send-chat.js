// api/send-chat.js
const { setCORS, parseBody, request } = require('./_utils');

module.exports = async (req, res) => {
  setCORS(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'POST만 허용' });

  const { message, liveChatId, accessToken } = parseBody(req);

  if (!message)     return res.json({ success: false, error: '메시지가 없습니다' });
  if (!liveChatId)  return res.json({ success: false, error: 'liveChatId가 없습니다' });
  if (!accessToken) return res.json({ success: false, error: '로그인이 필요합니다 (accessToken 없음)' });

  try {
    await request('POST',
      'https://www.googleapis.com/youtube/v3/liveChat/messages?part=snippet',
      {
        snippet: {
          liveChatId,
          type: 'textMessageEvent',
          textMessageDetails: { messageText: message },
        }
      },
      accessToken
    );
    res.json({ success: true });
  } catch(e) {
    res.json({ success: false, error: e.message });
  }
};
