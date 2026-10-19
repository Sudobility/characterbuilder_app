import { useGenerations } from '@sudobility/characterbuilder_client';
import { ImageTile } from '../components/ImageTile';
import {
  Card,
  CardContent,
  CardHeader,
  Heading,
  Spinner,
  Text,
} from '../ui';

export function GalleryPage() {
  const { data, isLoading } = useGenerations();

  return (
    <div className="flex flex-col gap-4">
      <Heading level={1} size="2xl">
        Gallery
      </Heading>
      {isLoading ? (
        <Spinner size="large" />
      ) : !data || data.items.length === 0 ? (
        <Text as="p" className="text-theme-text-secondary">
          No generations yet.
        </Text>
      ) : (
        data.items.map((gen) => {
          const active = gen.status === 'pending' || gen.status === 'running';
          return (
            <Card key={gen.id}>
              <CardHeader>
                <Text as="span" size="sm" className="text-theme-text-secondary">
                  {new Date(gen.createdAt).toLocaleString()} ·{' '}
                  <span className="uppercase">{gen.status}</span> ·{' '}
                  {gen.images.length} image{gen.images.length === 1 ? '' : 's'} ·{' '}
                  {gen.creditsSpent} credit{gen.creditsSpent === 1 ? '' : 's'}
                </Text>
              </CardHeader>
              <CardContent>
                {active && (
                  <Text as="p" size="sm" className="text-theme-text-secondary">
                    Working… this generation is still rendering.
                  </Text>
                )}
                {gen.status === 'failed' && (
                  <Text as="p" size="sm" className="text-red-500">
                    {gen.error ?? 'Generation failed'}
                  </Text>
                )}
                {gen.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {gen.images.map((img) => (
                      <ImageTile key={img.id} imageId={img.id} alt="generation" />
                    ))}
                  </div>
                )}
                {gen.prompt && (
                  <Text as="p" size="xs" className="mt-2 text-theme-text-secondary">
                    {gen.prompt}
                  </Text>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
