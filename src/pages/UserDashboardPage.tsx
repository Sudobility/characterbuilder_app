import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MasterListItem } from '@sudobility/components';
import { MasterDetailPage } from '../components/layout/MasterDetailPage';
import { Button, Card, CardContent, Heading, Text } from '../ui';
import { useAuth } from '../auth/AuthContext';
import { CreditsPage } from './CreditsPage';
import { GalleryPage } from './GalleryPage';
import { JobHistoryPage } from './JobHistoryPage';

/**
 * The signed-in hub at `/dashboard/:section` — a master/detail page whose
 * sections are real sub-routes (deep-linkable, breadcrumbed). Gallery and job
 * history live here, alongside account and credits. The character editor
 * (`/characters/:id`, `/new`) and sheet studio remain full pages, reached from
 * the Gallery/History "New character" action and the job → character links.
 */
const SECTIONS = [
  { id: 'gallery', label: 'Gallery', description: 'Every image you have generated' },
  { id: 'history', label: 'Job history', description: 'Generation jobs and their status' },
  { id: 'credits', label: 'Credits', description: 'Balance and top-ups' },
  { id: 'account', label: 'Account', description: 'Your profile and sign-out' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

function isSection(v: string | undefined): v is SectionId {
  return SECTIONS.some((s) => s.id === v);
}

export function UserDashboardPage() {
  const { section: raw } = useParams();
  const navigate = useNavigate();
  const section: SectionId = isSection(raw) ? raw : 'gallery';

  // On desktop both panels show; on mobile a selection switches to the detail.
  const [mobileView, setMobileView] = useState<'navigation' | 'content'>('navigation');
  // Deep-linking straight to a section should show the detail on mobile too.
  useEffect(() => {
    if (raw) setMobileView('content');
  }, [raw]);

  const open = (id: SectionId) => {
    navigate(`/dashboard/${id}`);
    setMobileView('content');
  };

  return (
    <MasterDetailPage
      masterTitle="Dashboard"
      masterContent={
        <nav className="flex flex-col gap-1 p-2">
          {SECTIONS.map((s) => (
            <MasterListItem
              key={s.id}
              isSelected={s.id === section}
              onClick={() => open(s.id)}
              label={s.label}
              description={s.description}
            />
          ))}
        </nav>
      }
      detailContent={<SectionDetail section={section} />}
      mobileView={mobileView}
      onBackToNavigation={() => setMobileView('navigation')}
      contentKey={section}
    />
  );
}

function SectionDetail({ section }: { section: SectionId }) {
  switch (section) {
    case 'history':
      return <JobHistoryPage />;
    case 'credits':
      return <CreditsPage />;
    case 'account':
      return <AccountSection />;
    case 'gallery':
    default:
      return <GalleryPage />;
  }
}

function AccountSection() {
  const { user, signOut } = useAuth();
  return (
    <div className="flex flex-col gap-4">
      <Heading level={1} size="2xl">
        Account
      </Heading>
      <Card>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div>
              <Text as="span" size="sm" className="text-theme-text-secondary">
                Signed in as
              </Text>
              <Text as="p" className="font-medium">
                {user?.displayName ?? user?.email ?? 'Account'}
              </Text>
              {user?.email && user?.displayName && (
                <Text as="p" size="sm" className="text-theme-text-secondary">
                  {user.email}
                </Text>
              )}
            </div>
            <div>
              <Button variant="secondary" onClick={() => void signOut()}>
                Sign out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
