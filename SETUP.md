# AI 시청자봇 v5 — 배포 및 설정 가이드

## 1. Vercel 배포 (2분)

1. https://github.com → New repository → `ai-viewer-bot` (Private 권장)
2. 압축 해제한 파일 전체 업로드
3. https://vercel.com → Add New Project → GitHub repo 선택 → Deploy
4. 배포 완료 후 URL 복사 (예: `https://ai-viewer-bot-xxx.vercel.app`)

---

## 2. Google Cloud Console 설정 (3분)

1. https://console.cloud.google.com → 새 프로젝트 생성
2. 왼쪽 메뉴 → **API 및 서비스** → **라이브러리** → `YouTube Data API v3` → **사용 설정**
3. **사용자 인증 정보** → **+ 사용자 인증 정보 만들기** → **OAuth 2.0 클라이언트 ID**
4. 애플리케이션 유형: ⚠️ **웹 애플리케이션** (데스크탑 앱 아님!)
5. **승인된 리디렉션 URI** 추가:
   ```
   https://ai-viewer-bot-xxx.vercel.app/api/oauth-callback
   ```
6. 클라이언트 ID, 클라이언트 시크릿 복사

---

## 3. Groq API Key (1분)

1. https://console.groq.com → 회원가입 → API Keys → Create
2. 생성된 키(`gsk_...`) 복사

---

## 4. 앱 사용

1. Vercel URL 접속
2. **설정 탭**:
   - OAuth 클라이언트 ID / 시크릿 입력
   - **Google 로그인** 버튼 → 팝업에서 방송 채널 계정 선택
   - YouTube 영상 ID 입력 → **Chat ID 자동 조회**
   - Groq API Key 입력
   - **설정 저장**
3. **봇 실행 탭**:
   - **화면 선택** → 캡처할 창/화면 선택
   - **▶ 봇 시작**

---

## 주의사항

- YouTube 채팅 전송 토글은 테스트 후 켜세요 (OFF = 앱 내 로그만)
- Groq 무료 RPD 14,400 / 4명 × 6초 간격 = 4시간 방송 기준 여유있음
- 설정값은 브라우저 localStorage에 저장됨 (다음 접속 시 유지)
