import { BaseApiClient } from '@/shared/api/base-api-client';
import { AUTH_CONFIG } from '@/shared/config/auth';

export type FileProcessingStatus = 'TEMP' | 'DRAFT' | 'INVALID' | (string & {});
export type ImageProcessingStatus =
  | 'PROCESSING'
  | 'READY'
  | 'INVALID'
  | (string & {});
export type ImageMood =
  | 'INSPIRE'
  | 'ENCOURAGE'
  | 'REASSURE'
  | 'CALM_DOWN'
  | (string & {});

export interface PageRequest {
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  page: number;
  size: number;
  totalRecords: number;
  totalPages: number;
  content: T[];
}

export interface ImageRendition {
  name: string;
  fileId: string;
}

export interface ImageResponse {
  id: string;
  status: ImageProcessingStatus;
  moods: ImageMood[];
  renditions: ImageRendition[];
}

export interface ImageMoodsUpdateRequest {
  moods: ImageMood[];
}

export interface FileProcessingResponse {
  id: string;
  status: FileProcessingStatus;
}

export interface ImageProcessingResponse {
  id: number;
  status: ImageProcessingStatus;
}

export interface ImageCreationRequest {
  fileId: string;
}

class ContentApi extends BaseApiClient {
  constructor() {
    super(AUTH_CONFIG.issuer || '/api');
  }

  public async uploadFile(file: File): Promise<FileProcessingResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.post<FileProcessingResponse>('/v1/api/admin/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  public async getFileStatus(id: string): Promise<FileProcessingResponse> {
    return this.get<FileProcessingResponse>(`/v1/api/admin/file/${id}/status`);
  }

  public async createImage(fileId: string): Promise<ImageProcessingResponse> {
    const payload: ImageCreationRequest = { fileId };

    return this.post<ImageProcessingResponse>('/v1/api/admin/images', payload);
  }

  public async getImageStatus(id: number): Promise<ImageProcessingResponse> {
    return this.get<ImageProcessingResponse>(
      `/v1/api/admin/images/${id}/status`,
    );
  }

  public async getImage(imageId: string): Promise<ImageResponse> {
    return this.get<ImageResponse>(`/v1/api/admin/images/${imageId}`);
  }

  public async getFileBlob(fileId: string): Promise<Blob> {
    return this.get<Blob>(`/v1/api/admin/file/${fileId}`, {
      responseType: 'blob',
    });
  }

  public async deleteImage(imageId: string): Promise<void> {
    await this.delete<void>(`/v1/api/admin/images/${imageId}`);
  }

  public async getImages(
    params: PageRequest = {},
  ): Promise<PageResponse<ImageResponse>> {
    return this.get<PageResponse<ImageResponse>>('/v1/api/admin/images', {
      params,
    });
  }

  public async updateImageMoods(
    imageId: string,
    moods: ImageMood[],
  ): Promise<ImageResponse> {
    const payload: ImageMoodsUpdateRequest = { moods };

    return this.put<ImageResponse>(
      `/v1/api/admin/images/${imageId}/moods`,
      payload,
    );
  }
}

export const contentApi = new ContentApi();
