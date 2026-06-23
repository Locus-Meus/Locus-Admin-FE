import { BaseApiClient } from '@/shared/api/base-api-client';
import { AUTH_CONFIG } from '@/shared/config/auth';

export type FileProcessingStatus = 'TEMP' | 'DRAFT' | 'INVALID' | (string & {});
export type ImageProcessingStatus =
  | 'PROCESSING'
  | 'READY'
  | 'INVALID'
  | (string & {});

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
}

export const contentApi = new ContentApi();
