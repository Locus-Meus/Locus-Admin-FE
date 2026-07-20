import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Eye, Loader2, RefreshCw, Save, Trash2 } from 'lucide-react';

import {
  contentApi,
  type ImageMood,
  type ImageResponse,
} from '@/features/content';
import { Button } from '@/shared/ui';

const AVAILABLE_MOODS: ImageMood[] = [
  'INSPIRE',
  'ENCOURAGE',
  'REASSURE',
  'CALM_DOWN',
];
const DEFAULT_PAGE_SIZE = 10;

function formatRendition(rendition: ImageResponse['renditions'][number]): string {
  return `${rendition.name}: ${rendition.fileId}`;
}

interface ImageCardProps {
  image: ImageResponse;
}

function ImageCard({ image }: ImageCardProps) {
  const queryClient = useQueryClient();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState<ImageMood[]>(image.moods ?? []);

  const imageDetailsQuery = useQuery({
    queryKey: ['admin-image', image.id],
    queryFn: () => contentApi.getImage(image.id),
    enabled: isDetailsOpen,
  });

  const deleteImageMutation = useMutation({
    mutationFn: () => contentApi.deleteImage(image.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-images'] });
      queryClient.removeQueries({ queryKey: ['admin-image', image.id] });
    },
  });

  const updateMoodsMutation = useMutation({
    mutationFn: () => contentApi.updateImageMoods(image.id, selectedMoods),
    onSuccess: async (updatedImage) => {
      setSelectedMoods(updatedImage.moods ?? []);
      await queryClient.invalidateQueries({ queryKey: ['admin-images'] });
      queryClient.setQueryData(['admin-image', image.id], updatedImage);
    },
  });

  const details = imageDetailsQuery.data ?? image;
  const hasMoodChanges = useMemo(() => {
    const initial = [...(image.moods ?? [])].sort().join('|');
    const current = [...selectedMoods].sort().join('|');
    return initial !== current;
  }, [image.moods, selectedMoods]);

  const toggleMood = (mood: ImageMood) => {
    setSelectedMoods((current) =>
      current.includes(mood)
        ? current.filter((currentMood) => currentMood !== mood)
        : [...current, mood],
    );
  };

  const handleDelete = () => {
    const confirmed = window.confirm(`Delete image ${image.id}?`);
    if (!confirmed) return;

    deleteImageMutation.mutate();
  };

  return (
    <article className='rounded-xl border border-border bg-card p-4 shadow-sm'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <p className='text-xs uppercase tracking-[0.08em] text-muted-foreground'>
            Image ID
          </p>
          <p className='mt-1 break-all font-mono text-sm font-medium text-foreground'>
            {image.id}
          </p>
          <span className='mt-2 inline-flex rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary'>
            {image.status}
          </span>
        </div>

        <div className='flex flex-wrap gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => setIsDetailsOpen((value) => !value)}
          >
            <Eye className='size-4' />
            {isDetailsOpen ? 'Hide' : 'Details'}
          </Button>
          <Button
            type='button'
            variant='destructive'
            size='sm'
            onClick={handleDelete}
            disabled={deleteImageMutation.isPending}
          >
            {deleteImageMutation.isPending ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <Trash2 className='size-4' />
            )}
            Delete
          </Button>
        </div>
      </div>

      <div className='mt-4'>
        <p className='text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground'>
          Moods
        </p>
        <div className='mt-2 flex flex-wrap gap-2'>
          {AVAILABLE_MOODS.map((mood) => (
            <label
              key={mood}
              className='inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground transition hover:border-primary/50'
            >
              <input
                type='checkbox'
                checked={selectedMoods.includes(mood)}
                onChange={() => toggleMood(mood)}
                disabled={updateMoodsMutation.isPending}
              />
              {mood}
            </label>
          ))}
        </div>
        <Button
          className='mt-3'
          type='button'
          size='sm'
          onClick={() => updateMoodsMutation.mutate()}
          disabled={!hasMoodChanges || updateMoodsMutation.isPending}
        >
          {updateMoodsMutation.isPending ? (
            <Loader2 className='size-4 animate-spin' />
          ) : (
            <Save className='size-4' />
          )}
          Save moods
        </Button>
        {updateMoodsMutation.isError && (
          <p className='mt-2 text-sm text-destructive'>Could not update moods.</p>
        )}
      </div>

      {isDetailsOpen && (
        <div className='mt-4 rounded-lg border border-border bg-background p-3'>
          {imageDetailsQuery.isLoading ? (
            <p className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Loader2 className='size-4 animate-spin' />
              Loading image details...
            </p>
          ) : imageDetailsQuery.isError ? (
            <p className='text-sm text-destructive'>Could not load image details.</p>
          ) : (
            <>
              <p className='text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground'>
                Renditions
              </p>
              {details.renditions?.length ? (
                <ul className='mt-2 space-y-1'>
                  {details.renditions.map((rendition) => (
                    <li
                      key={`${rendition.name}-${rendition.fileId}`}
                      className='break-all rounded bg-muted/30 px-2 py-1 font-mono text-xs text-foreground'
                    >
                      {formatRendition(rendition)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='mt-2 text-sm text-muted-foreground'>No renditions.</p>
              )}
            </>
          )}
        </div>
      )}

      {deleteImageMutation.isError && (
        <p className='mt-3 text-sm text-destructive'>Could not delete image.</p>
      )}
    </article>
  );
}

export function ImageList() {
  const [page, setPage] = useState(0);
  const size = DEFAULT_PAGE_SIZE;

  const imagesQuery = useQuery({
    queryKey: ['admin-images', { page, size }],
    queryFn: () => contentApi.getImages({ page, size }),
  });

  const totalPages = imagesQuery.data?.totalPages ?? 0;
  const totalRecords = imagesQuery.data?.totalRecords ?? 0;
  const images = imagesQuery.data?.content ?? [];
  const canGoPrevious = page > 0;
  const canGoNext = totalPages > 0 && page + 1 < totalPages;

  return (
    <section className='rounded-xl border border-border bg-background p-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-lg font-semibold text-foreground'>Images</h2>
          <p className='text-sm text-muted-foreground'>
            {totalRecords} total records · page {totalPages ? page + 1 : 0} of {totalPages}
          </p>
        </div>
        <Button
          type='button'
          variant='outline'
          onClick={() => imagesQuery.refetch()}
          disabled={imagesQuery.isFetching}
        >
          <RefreshCw className={imagesQuery.isFetching ? 'size-4 animate-spin' : 'size-4'} />
          Refresh
        </Button>
      </div>

      {imagesQuery.isLoading ? (
        <p className='mt-6 flex items-center gap-2 text-sm text-muted-foreground'>
          <Loader2 className='size-4 animate-spin' />
          Loading images...
        </p>
      ) : imagesQuery.isError ? (
        <p className='mt-6 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
          Could not load images.
        </p>
      ) : images.length ? (
        <div className='mt-4 grid gap-4'>
          {images.map((image) => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      ) : (
        <p className='mt-6 rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground'>
          No images found.
        </p>
      )}

      <div className='mt-4 flex items-center justify-between gap-3'>
        <Button
          type='button'
          variant='outline'
          onClick={() => setPage((current) => Math.max(0, current - 1))}
          disabled={!canGoPrevious || imagesQuery.isFetching}
        >
          <ChevronLeft className='size-4' />
          Previous
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={() => setPage((current) => current + 1)}
          disabled={!canGoNext || imagesQuery.isFetching}
        >
          Next
          <ChevronRight className='size-4' />
        </Button>
      </div>
    </section>
  );
}
