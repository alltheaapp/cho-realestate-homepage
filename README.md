# 조광현 공인중개사 홈페이지

Cloudflare Pages에 바로 올릴 수 있는 정적 홈페이지입니다.

## 파일

- `index.html`: 메인 페이지
- `styles.css`: 디자인 스타일
- `script.js`: 모바일 메뉴, 후기 버튼, 상담 폼 mailto 처리
- `content.js`: 관리자에서 수정 가능한 기본 문구 데이터
- `admin.html`: 문구 수정용 로컬 관리자 페이지
- `admin.js`: 관리자 페이지 저장/내보내기 기능
- `_headers`: Cloudflare Pages 보안/캐시 헤더

## Cloudflare Pages 배포

1. GitHub에 이 폴더를 포함해 업로드합니다.
2. Cloudflare Dashboard > Workers & Pages > Create application > Pages를 선택합니다.
3. 저장소를 연결합니다.
4. Build settings:
   - Framework preset: `None`
   - Build command: 비워두기
   - Build output directory: `cho-realestate-cloudflare`
5. 배포 후 Custom domain에서 도메인을 연결합니다.

## 교체가 필요한 정보

- 전화번호: `02-1234-5678`
- 이메일: `contact@chorealestate.com`
- 주소: `서울특별시 강남구 테헤란로 123 비즈니스 타워 4층`
- 등록번호: `제00000-0000-00000호`
- 카카오 상담 링크: `https://pf.kakao.com/`
- canonical URL: `https://csijak.mycafe24.com/`

## 관리자 페이지

`/admin.html`에서 주요 문구를 수정할 수 있습니다. 현재 버전은 정적 사이트용이라 브라우저 `localStorage`에 저장됩니다.

- 같은 브라우저에서는 수정 내용이 즉시 반영됩니다.
- `JSON 내보내기`를 눌러 실제 배포본에 반영할 데이터를 확인할 수 있습니다.
- 운영용으로 여러 사람이 함께 수정하려면 Cloudflare KV, Supabase, Notion CMS 같은 저장소 연결이 필요합니다.
