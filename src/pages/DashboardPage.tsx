import { Link, useNavigate } from 'react-router-dom';
import {
  useCharacters,
  useDeleteCharacter,
} from '@sudobility/characterbuilder_client';
import { filledCount } from '@sudobility/characterbuilder_lib';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Heading,
  Spinner,
  Text,
} from '../ui';

export function DashboardPage() {
  const { data, isLoading } = useCharacters();
  const del = useDeleteCharacter();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Heading level={1} size="2xl">
          Your characters
        </Heading>
        <Button variant="primary" onClick={() => navigate('/new')}>
          New character
        </Button>
      </div>

      {isLoading ? (
        <Spinner size="large" />
      ) : !data || data.items.length === 0 ? (
        <Card>
          <CardContent>
            <Text as="p" className="text-theme-text-secondary">
              No characters yet. Create one to start designing a face.
            </Text>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <Heading level={3} size="lg">
                  {c.name}
                </Heading>
                <Text as="span" size="sm" className="text-theme-text-secondary">
                  {c.role || 'no role'} · {filledCount(c.spec)} features set
                </Text>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Link to={`/characters/${c.id}`}>
                    <Button variant="secondary" size="sm">
                      Open
                    </Button>
                  </Link>
                  <Button
                    variant="destructive-outline"
                    size="sm"
                    disabled={del.isPending}
                    onClick={() => del.mutate(c.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
