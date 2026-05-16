# Cloudflare Pages 배포

이 폴더는 Cloudflare Pages 정적 사이트로 바로 배포할 수 있습니다.

## 직접 업로드

Cloudflare API Token이 필요합니다.

토큰 권한:

- Account
- Cloudflare Pages
- Edit

배포 명령:

```bash
CLOUDFLARE_API_TOKEN=토큰값 npx wrangler pages deploy . --project-name cho-realestate-homepage
```

이미 `CLOUDFLARE_API_TOKEN` 환경변수에 토큰이 들어 있다면:

```bash
npm run deploy
```

## Cloudflare Pages 대시보드 배포

GitHub 저장소 루트에 이 폴더 안의 파일들을 올린 뒤 Pages에서 연결합니다.

설정:

```text
Framework preset: None
Build command: 비워두기
Build output directory: /
```

## 참고

관리자 페이지(`/admin.html`)의 문구/후기 저장은 현재 브라우저 localStorage 방식입니다. 운영용 서버 저장이 필요하면 Cloudflare KV 또는 Supabase 연동이 필요합니다.
