# Gallery Agent Notes

Use this file when working on gallery-related tasks, image upload, image listing, or admin image API integration.

## Gallery Location

- Main page: `src/pages/gallery/ui/gallery-page.tsx`
- Upload widget: `src/pages/gallery/ui/image-upload.tsx`
- Image management/list widget: `src/pages/gallery/ui/image-list.tsx`
- Content API client: `src/features/content/api/content-api.ts`
- Public content exports: `src/features/content/index.ts`
- Gallery route is `/gallery` and is protected by `RequireAuth`.

## Backend Base URL and Auth

- Gallery/content API calls use `contentApi`, which extends `BaseApiClient`.
- `ContentApi` currently uses `AUTH_CONFIG.issuer || '/api'` as its base URL.
- `BaseApiClient` injects `Authorization: Bearer <token>` from `useSessionStore` unless `skipAuthHandling` is set.
- HTTP 401 is handled globally by `BaseApiClient` auth recovery/failure logic.

## Existing Admin Content Endpoints

File flow:

- `POST /v1/api/admin/file` uploads a file as `multipart/form-data` with field name `file`.
- `GET /v1/api/admin/file/{id}/status` polls uploaded file processing status.
- File terminal statuses used by the UI: `DRAFT`, `INVALID`.

Image creation/status flow:

- `POST /v1/api/admin/images` creates an image from `{ fileId }`.
- `GET /v1/api/admin/images/{id}/status` polls image/rendition processing status.
- Image terminal statuses used by the UI: `READY`, `INVALID`.

Image admin management flow:

- `GET /v1/api/admin/images/{imageId}` fetches one image.
- `DELETE /v1/api/admin/images/{imageId}` deletes one image.
- `GET /v1/api/admin/images?size=10&page=0` lists images with pagination and includes images of all statuses.
- `PUT /v1/api/admin/images/{imageId}/moods` updates moods using `{ moods: [...] }`.

## Image Data Shape

Expected image response fields:

```ts
interface ImageResponse {
  id: string;
  status: ImageProcessingStatus;
  moods: ImageMood[];
  renditions: Array<{
    name: string;
    fileId: string;
  }>;
}
```

Known moods:

- `INSPIRE`
- `ENCOURAGE`
- `REASSURE`
- `CALM_DOWN`

Known rendition names from backend requirements:

- `origin`
- `w640`
- `w1024`
- `w1920`

When rendering previews, prefer a smaller web-friendly rendition if available, usually `w640`, then `origin`, then the first available rendition. Confirm the actual file download/render endpoint before implementing previews if it is not already present in code.

## UI/Data Fetching Conventions

- Use TanStack Query for gallery API state.
- Current image list query key prefix: `['admin-images']`.
- Current image detail query key prefix: `['admin-image', imageId]`.
- Invalidate `['admin-images']` after successful upload, delete, or moods update.
- Keep upload and image management UI separated into focused components.
- Prefer shared UI primitives from `src/shared/ui`.

## Upload Flow Notes

The upload widget follows this sequence:

1. Upload file with `contentApi.uploadFile(file)`.
2. Poll file status until `DRAFT` or `INVALID`.
3. Create image with `contentApi.createImage(fileId)`.
4. Poll image status until `READY` or `INVALID`.
5. On success, clear the selected file and trigger parent refresh callback.

Polling constants live in `src/pages/gallery/ui/image-upload.tsx`.
