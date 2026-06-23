import { useId, useRef, useState, type ChangeEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ImagePlus, Loader2, Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  contentApi,
  type FileProcessingResponse,
  type FileProcessingStatus,
  type ImageProcessingResponse,
  type ImageProcessingStatus,
} from '@/features/content';
import { Button } from '@/shared/ui';

const STATUS_POLL_INTERVAL_MS = 1_000;
const MAX_STATUS_CHECKS = 60;

type UploadPhase =
  | 'idle'
  | 'uploading'
  | 'processingFile'
  | 'creatingImage'
  | 'processingImage';

function isTerminalFileStatus(status: FileProcessingStatus): boolean {
  return status === 'DRAFT' || status === 'INVALID';
}

function isTerminalImageStatus(status: ImageProcessingStatus): boolean {
  return status === 'READY' || status === 'INVALID';
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function ImageUpload() {
  const { t } = useTranslation();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);

  const waitForProcessedFile = async (
    id: string,
  ): Promise<FileProcessingResponse> => {
    for (let attempt = 0; attempt < MAX_STATUS_CHECKS; attempt += 1) {
      const statusResponse = await contentApi.getFileStatus(id);

      if (isTerminalFileStatus(statusResponse.status)) {
        return statusResponse;
      }

      await wait(STATUS_POLL_INTERVAL_MS);
    }

    throw new Error(t('gallery.imageUpload.timeout'));
  };

  const waitForReadyImage = async (
    id: number,
  ): Promise<ImageProcessingResponse> => {
    for (let attempt = 0; attempt < MAX_STATUS_CHECKS; attempt += 1) {
      const statusResponse = await contentApi.getImageStatus(id);

      if (isTerminalImageStatus(statusResponse.status)) {
        return statusResponse;
      }

      await wait(STATUS_POLL_INTERVAL_MS);
    }

    throw new Error(t('gallery.imageUpload.imageTimeout'));
  };

  const uploadImageMutation = useMutation({
    mutationFn: async (selectedFile: File) => {
      setPhase('uploading');
      const uploadResponse = await contentApi.uploadFile(selectedFile);
      let processedFile = uploadResponse;

      if (!isTerminalFileStatus(processedFile.status)) {
        setPhase('processingFile');
        processedFile = await waitForProcessedFile(processedFile.id);
      }

      if (processedFile.status === 'INVALID') {
        throw new Error(t('gallery.imageUpload.invalid'));
      }

      if (processedFile.status !== 'DRAFT') {
        throw new Error(t('gallery.imageUpload.unexpectedStatus'));
      }

      setPhase('creatingImage');
      const imageResponse = await contentApi.createImage(processedFile.id);
      let processedImage = imageResponse;

      if (!isTerminalImageStatus(processedImage.status)) {
        setPhase('processingImage');
        processedImage = await waitForReadyImage(processedImage.id);
      }

      if (processedImage.status === 'INVALID') {
        throw new Error(t('gallery.imageUpload.imageInvalid'));
      }

      if (processedImage.status !== 'READY') {
        throw new Error(t('gallery.imageUpload.unexpectedImageStatus'));
      }
    },
    onSuccess: () => {
      setFile(null);
      setIsUploaded(true);

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    onError: (err) => {
      setError(
        err instanceof Error ? err.message : t('gallery.imageUpload.failed'),
      );
    },
    onSettled: () => {
      setPhase('idle');
    },
  });

  const isWorking = uploadImageMutation.isPending;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;

    setFile(selectedFile);
    setError(null);
    setIsUploaded(false);
  };

  const handleClear = () => {
    setFile(null);
    setError(null);
    setIsUploaded(false);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleUpload = () => {
    if (!file) {
      setError(t('gallery.imageUpload.emptyError'));
      return;
    }

    setError(null);
    setIsUploaded(false);

    uploadImageMutation.mutate(file);
  };

  const actionLabel =
    phase === 'processingFile'
      ? t('gallery.imageUpload.processingFile')
      : phase === 'creatingImage'
        ? t('gallery.imageUpload.creatingImage')
        : phase === 'processingImage'
          ? t('gallery.imageUpload.processingImage')
        : phase === 'uploading'
          ? t('gallery.imageUpload.uploading')
          : t('gallery.imageUpload.upload');

  return (
    <div className='rounded-xl border border-border bg-background p-4'>
      <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground'>
        <ImagePlus className='size-4 text-primary' />
        {t('gallery.imageUpload.title')}
      </div>

      <p className='mt-2 text-sm text-muted-foreground'>
        {t('gallery.imageUpload.description')}
      </p>

      <label
        className='mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-4 py-6 text-center transition hover:border-primary/50 hover:bg-muted/30'
        htmlFor={inputId}
      >
        <Upload className='size-6 text-primary' />
        <span className='mt-3 text-sm font-semibold text-foreground'>
          {t('gallery.imageUpload.choose')}
        </span>
        <span className='mt-1 text-xs text-muted-foreground'>
          {t('gallery.imageUpload.hint')}
        </span>
      </label>

      <input
        ref={inputRef}
        id={inputId}
        className='sr-only'
        type='file'
        accept='image/*'
        onChange={handleFileChange}
      />

      {file && (
        <div className='mt-4 rounded-xl border border-border bg-card p-3'>
          <div className='flex items-center justify-between gap-3'>
            <div className='min-w-0'>
              <p className='text-xs uppercase tracking-[0.08em] text-muted-foreground'>
                {t('gallery.imageUpload.selected')}
              </p>
              <p className='mt-1 truncate text-sm font-medium text-foreground'>
                {file.name}
              </p>
            </div>
            <button
              className='rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50'
              type='button'
              onClick={handleClear}
              aria-label={t('gallery.imageUpload.clear')}
              disabled={isWorking}
            >
              <X className='size-4' />
            </button>
          </div>
        </div>
      )}

      <Button
        className='mt-4 h-10 w-full'
        type='button'
        onClick={handleUpload}
        disabled={isWorking || !file}
      >
        {isWorking && <Loader2 className='size-4 animate-spin' />}
        {actionLabel}
      </Button>

      {isUploaded && (
        <p className='mt-3 rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-foreground'>
          {t('gallery.imageUpload.success')}
        </p>
      )}

      {error && (
        <p className='mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
          {error}
        </p>
      )}
    </div>
  );
}
