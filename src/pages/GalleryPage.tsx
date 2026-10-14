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
        data.items.map((gen) => (
          <Card key={gen.id}>
            <CardHeader>
              <Text as="span" size="sm" className="text-theme-text-secondary">
                {new Date(gen.createdAt).toLocaleString()} · {gen.images.length}{' '}
                image{gen.images.length > 1 ? 's' : ''} · {gen.creditsSpent} credit
                {gen.creditsSpent > 1 ? 's' : ''}
              </Text>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {gen.images.map((img) => (
                  <ImageTile key={img.id} imageId={img.id} alt="generation" />
                ))}
              </div>
              <Text as="p" size="xs" className="mt-2 text-theme-text-secondary">
                {gen.prompt}
              </Text>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
