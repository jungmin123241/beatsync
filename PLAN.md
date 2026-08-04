# PLAN — 비트싱크 1차 개발 사이클

> 근거 문서: [PRD.md](PRD.md) (전체 요구사항), [CLAUDE.md](CLAUDE.md) (개발 규칙)

## 이번 사이클 목표

PRD.md 6번 범위에 정의된 세 가지 기능(계정 연동, 심박수 기반 곡 추천·저장, 곡 변경 안내)을 Next.js로 구현해, 가상 심박수로 전체 흐름이 처음부터 끝까지 동작하는 상태로 Vercel에 배포한다.

## 성공 기준

- [x] PRD 5번의 세 기능(0. 계정 연동, 1. 곡 추천·저장, 2. 곡 변경 안내)이 모두 동작한다
- [x] Spotify 로그인 → 나이 입력 → 운동 종류 입력·플레이리스트 지정 → 가상 심박수로 곡 추천 → 저장 → 곡 변경 안내까지, PRD 4번 이용 흐름이 끊김 없이 이어진다
- [x] 추천 곡이 현재 심박수와 유사한 BPM으로 선택된다
- [ ] "저장" 버튼으로 Spotify 플레이리스트에 곡이 추가된다 — **미검증(외부 요인으로 막힘, 아래 참고)**
- [x] Apple Music 등은 구현하지 않는다
- [x] Vercel에 배포되어 실제 URL로 접속·시연 가능하다 — https://beatsync-lemon.vercel.app

### 남은 문제: 곡 저장이 Spotify에서 403으로 막힘

코드가 아니라 Spotify 쪽 제약이다. 저장 요청 시 Spotify가 `403 Forbidden`을 돌려준다.

확인한 사실:
- 로그인 시 부여된 권한은 정상 (`playlist-read-private playlist-modify-private playlist-modify-public`) — 권한 부족이 아님
- 플레이리스트 목록은 본인 소유·공동작업 항목만 보이도록 걸러 둠 — 소유권 문제가 아님
- 읽기(플레이리스트 조회)는 정상 동작 — 토큰 자체는 정상
- 앱 토큰으로 Spotify API를 직접 호출하면 `"Active premium subscription required for the owner of the app."` 응답

즉 **앱 소유자 계정의 Premium 상태가 아직 반영되지 않은 것**이 원인이며, Spotify 안내상 반영에 수 시간이 걸린다. 반영되면 별도 코드 수정 없이 저장이 동작해야 한다. (확인 시 이 항목을 체크로 바꿀 것)

## 작업 순서

먼저 되면 나머지가 쉬워지는 순서로 정렬. (PRD 9번 개발 단위와 동일한 순서)

- [x] 1. Next.js 프로젝트 초기 세팅 및 기본 화면 뼈대 만들기
- [x] 2. Spotify 계정 연동 로그인 화면 만들기
- [x] 3. 음악 서비스 인증 토큰 발급·저장 처리 (API 키는 `.env`로 관리)
- [x] 4. 로그인한 사용자의 플레이리스트 목록 불러오기
- [x] 5. 최초 로그인 직후 나이 입력 온보딩 화면 만들고 최대심박수(220 - 나이) 계산 로직 구현 (localStorage에 저장, 최초 1회만), 운동 종류 입력, 운동별 Spotify 플레이리스트 선택
- [x] 6. 가상 심박수(mock) 발생기 만들기 — 최대심박수(220-나이)의 약 40~90% 범위로 5초마다 값을 변경하고 화면에 실시간으로 표시
- [x] 7. 샘플 곡 목록(제목·아티스트·BPM·Spotify 트랙 ID) 데이터 파일 만들기 — 실제 Spotify에 존재하는 곡으로 25곡 내외, 트랙 ID까지 포함 (BPM 중복 없이 고르게 분포)
- [x] 8. 가장 가까운 BPM 한 곡 선택 - 추천곡 표시, Spotify 플레이리스트 저장 버튼 구현
- [x] 9. 심박수가 바뀌면 즉시 추천 - 곡 변경 시 안내 메시지 표시
- [x] 10. Vercel 배포 및 환경변수 설정

## 정리할 것 (배포 후 남은 임시 코드)

저장 실패 원인을 찾으려고 넣은 진단용 코드가 남아 있다. 원인이 해소되면 되돌린다.

- `src/auth.ts` — 부여된 권한 범위를 찍는 `console.log`, 매번 동의 화면을 띄우는 `show_dialog: "true"`
- `src/app/api/playlists/[id]/tracks/route.ts` — Spotify 응답 본문을 찍는 `console.error` (원인 파악에 유용해 남겨둘지 판단 필요)
- `trash-can/` — 폐기한 `middleware.ts`, `HeartRateDisplay.tsx` (사용자 확인 후 삭제)
