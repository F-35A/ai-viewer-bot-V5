// api/youtube.js
const { setCORS, request } = require('./_utils');

module.exports = async (req, res) => {
  setCORS(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.json({ success: false, error: '로그인이 필요합니다' });

  const { action, videoId, liveChatId, pageToken } = req.query;

  try {
    // Live Chat ID 조회
    if (action === 'livechat-id') {
      if (!videoId) return res.json({ success: false, error: 'videoId가 없습니다' });

      const data = await request('GET',
        `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${encodeURIComponent(videoId)}`,
        null, token
      );

      const chatId = data?.items?.[0]?.liveStreamingDetails?.activeLiveChatId;
      if (chatId) return res.json({ success: true, chatId });
      return res.json({ success: false, error: '현재 라이브 중이 아니거나 영상 ID가 잘못됐습니다' });
    }

    // 채팅 읽기
    if (action === 'read-chat') {
      if (!liveChatId) return res.json({ success: false, error: 'liveChatId가 없습니다' });

      let url = `https://www.googleapis.com/youtube/v3/liveChat/messages`
        + `?liveChatId=${encodeURIComponent(liveChatId)}`
        + `&part=snippet,authorDetails&maxResults=20`;
      if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;

      const data = await request('GET', url, null, token);
      const messages = (data.items || [])
        .map(item => ({
          id:     item.id,
          author: item.authorDetails?.displayName || '익명',
          msg:    item.snippet?.textMessageDetails?.messageText || '',
        }))
        .filter(m => m.msg);

      return res.json({ success: true, messages, nextPageToken: data.nextPageToken || '' });
    }

    res.json({ success: false, error: `알 수 없는 action: ${action}` });
  } catch(e) {
    res.json({ success: false, error: e.message });
  }
};
