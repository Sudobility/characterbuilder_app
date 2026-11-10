import { useState } from 'react';
import { LocalizedLink as Link } from '../components/layout/LocalizedLink';
import { Heading, Section, Text } from '@sudobility/components';
import { APP_NAME } from '../config';

/**
 * Public "Resources" page — a curated directory of tools for AI filmmaking,
 * grouped by stage of the pipeline. CharacterBuilder sits in "Characters &
 * casting"; everything else links out. Descriptions are neutral and the list is
 * easy to edit (just the `GROUPS` data below).
 */
interface Resource {
  name: string;
  href: string;
  blurb: string;
  /** Internal links use the router; external links open in a new tab. */
  internal?: boolean;
}
interface ResourceGroup {
  id: string;
  title: string;
  description: string;
  items: Resource[];
}

const GROUPS: ResourceGroup[] = [
  {
    id: 'characters',
    title: 'Characters & casting',
    description: 'Design and reuse consistent characters across a project.',
    items: [
      {
        name: `${APP_NAME}`,
        href: '/new',
        internal: true,
        blurb: 'Design a face from a prompt or a photo and cast it in any style — you are here.',
      },
      { name: 'Scenario', href: 'https://www.scenario.com', blurb: 'Train custom models for consistent characters and assets.' },
      { name: 'Astria', href: 'https://www.astria.ai', blurb: 'Fine-tune models on a subject for repeatable likenesses.' },
    ],
  },
  {
    id: 'writing',
    title: 'Writing & story',
    description: 'Develop scripts, beats, loglines and dialogue.',
    items: [
      { name: 'ChatGPT', href: 'https://chatgpt.com', blurb: "OpenAI's assistant for drafting and rewriting." },
      { name: 'Claude', href: 'https://claude.ai', blurb: "Anthropic's assistant for long-form writing and analysis." },
      { name: 'Gemini', href: 'https://gemini.google.com', blurb: "Google's assistant for writing and research." },
      { name: 'Sudowrite', href: 'https://www.sudowrite.com', blurb: 'A writing tool built for fiction and screenwriting.' },
      { name: 'NovelAI', href: 'https://novelai.net', blurb: 'Story-focused text generation with persistent context.' },
      { name: 'Final Draft', href: 'https://www.finaldraft.com', blurb: 'Industry-standard screenwriting software.' },
      { name: 'Squibler', href: 'https://www.squibler.io', blurb: 'AI-assisted writing for scripts and books.' },
    ],
  },
  {
    id: 'image',
    title: 'Image generation',
    description: 'Concept art, stills, keyframes and reference images.',
    items: [
      { name: 'Midjourney', href: 'https://www.midjourney.com', blurb: 'High-quality stylized image generation.' },
      { name: 'Adobe Firefly', href: 'https://firefly.adobe.com', blurb: 'Commercially-safe generation inside Creative Cloud.' },
      { name: 'FLUX (Black Forest Labs)', href: 'https://blackforestlabs.ai', blurb: 'State-of-the-art open image models.' },
      { name: 'Leonardo.ai', href: 'https://leonardo.ai', blurb: 'Image generation with fine-grained style control.' },
      { name: 'Ideogram', href: 'https://ideogram.ai', blurb: 'Image generation that handles text and typography well.' },
      { name: 'OpenAI DALL·E', href: 'https://openai.com/dall-e-3', blurb: 'Image generation built into ChatGPT.' },
      { name: 'Stability AI', href: 'https://stability.ai', blurb: 'Stable Diffusion and related open models.' },
      { name: 'Recraft', href: 'https://www.recraft.ai', blurb: 'Design-focused generation with brand and vector control.' },
      { name: 'Freepik AI', href: 'https://www.freepik.com/ai', blurb: 'A suite of image, video and asset generators.' },
      { name: 'Civitai', href: 'https://civitai.com', blurb: 'Community hub for open models, LoRAs and prompts.' },
      { name: 'Playground', href: 'https://playground.com', blurb: 'Image generation and editing in the browser.' },
    ],
  },
  {
    id: 'video',
    title: 'Video generation',
    description: 'Turn prompts, stills or clips into motion.',
    items: [
      { name: 'Runway', href: 'https://runwayml.com', blurb: 'Text- and image-to-video with editing tools.' },
      { name: 'OpenAI Sora', href: 'https://openai.com/sora', blurb: 'Text-to-video from OpenAI.' },
      { name: 'Google Veo', href: 'https://deepmind.google/technologies/veo/', blurb: "Google DeepMind's high-fidelity video model." },
      { name: 'Kling AI', href: 'https://klingai.com', blurb: 'Image- and text-to-video with strong motion.' },
      { name: 'Luma Dream Machine', href: 'https://lumalabs.ai/dream-machine', blurb: 'Fast, cinematic text- and image-to-video.' },
      { name: 'Pika', href: 'https://pika.art', blurb: 'Playful text- and image-to-video with effects.' },
      { name: 'Hailuo AI (MiniMax)', href: 'https://hailuoai.video', blurb: 'Expressive text- and image-to-video.' },
      { name: 'Vidu', href: 'https://www.vidu.studio', blurb: 'Reference-driven video with character consistency.' },
      { name: 'Higgsfield', href: 'https://higgsfield.ai', blurb: 'Camera-control and motion presets for AI video.' },
      { name: 'Moonvalley', href: 'https://www.moonvalley.ai', blurb: 'A cinematic, licensed-data video model (Marey).' },
      { name: 'Hedra', href: 'https://www.hedra.com', blurb: 'Character video and expressive talking performances.' },
    ],
  },
  {
    id: 'avatars',
    title: 'Avatars & lip sync',
    description: 'Talking heads, presenters and performance transfer.',
    items: [
      { name: 'HeyGen', href: 'https://www.heygen.com', blurb: 'AI avatars and video translation with lip sync.' },
      { name: 'Synthesia', href: 'https://www.synthesia.io', blurb: 'Studio-quality presenter avatars from a script.' },
      { name: 'D-ID', href: 'https://www.d-id.com', blurb: 'Animate a still portrait into a talking head.' },
      { name: 'Captions', href: 'https://www.captions.ai', blurb: 'AI creators, dubbing and editing on mobile and web.' },
      { name: 'Sync', href: 'https://sync.so', blurb: 'High-quality lip sync for any footage.' },
      { name: 'Argil', href: 'https://www.argil.ai', blurb: 'Clone yourself into an AI video avatar.' },
    ],
  },
  {
    id: 'audio',
    title: 'Voice, music & audio',
    description: 'Dialogue, voiceover, score and sound.',
    items: [
      { name: 'ElevenLabs', href: 'https://elevenlabs.io', blurb: 'Realistic voice generation, cloning and dubbing.' },
      { name: 'Suno', href: 'https://suno.com', blurb: 'Generate songs and score from a prompt.' },
      { name: 'Udio', href: 'https://www.udio.com', blurb: 'Music generation with fine control.' },
      { name: 'Murf', href: 'https://murf.ai', blurb: 'Voiceover studio with many stock voices.' },
      { name: 'PlayHT', href: 'https://play.ht', blurb: 'Voice generation and cloning via API.' },
      { name: 'Resemble AI', href: 'https://www.resemble.ai', blurb: 'Voice cloning, speech-to-speech and dubbing.' },
      { name: 'Adobe Podcast', href: 'https://podcast.adobe.com', blurb: 'AI audio cleanup and speech enhancement.' },
      { name: 'Stable Audio', href: 'https://www.stableaudio.com', blurb: 'Generate music and sound effects from text.' },
    ],
  },
  {
    id: 'threeD',
    title: '3D, motion & VFX',
    description: 'Assets, performance capture and compositing.',
    items: [
      { name: 'Luma AI', href: 'https://lumalabs.ai', blurb: 'Capture and generate 3D scenes and objects.' },
      { name: 'Meshy', href: 'https://www.meshy.ai', blurb: 'Text- and image-to-3D model generation.' },
      { name: 'Tripo', href: 'https://www.tripo3d.ai', blurb: 'Fast image- and text-to-3D assets.' },
      { name: 'Rodin (Hyper3D)', href: 'https://hyper3d.ai', blurb: 'High-detail 3D model generation.' },
      { name: 'Wonder Dynamics', href: 'https://wonderdynamics.com', blurb: 'Drop CG characters into live-action shots (Autodesk).' },
      { name: 'Move AI', href: 'https://www.move.ai', blurb: 'Markerless motion capture from video.' },
      { name: 'Cascadeur', href: 'https://cascadeur.com', blurb: 'Physics-assisted 3D character animation.' },
      { name: 'Blender', href: 'https://www.blender.org', blurb: 'Free, open-source 3D creation suite.' },
    ],
  },
  {
    id: 'post',
    title: 'Editing & post',
    description: 'Assemble, grade and finish the cut.',
    items: [
      { name: 'DaVinci Resolve', href: 'https://www.blackmagicdesign.com/products/davinciresolve', blurb: 'Pro editing, color and audio — free tier available.' },
      { name: 'Adobe Premiere Pro', href: 'https://www.adobe.com/products/premiere.html', blurb: 'Industry-standard non-linear editor.' },
      { name: 'Final Cut Pro', href: 'https://www.apple.com/final-cut-pro/', blurb: "Apple's professional editor for macOS." },
      { name: 'CapCut', href: 'https://www.capcut.com', blurb: 'Fast editing with built-in AI effects.' },
      { name: 'Descript', href: 'https://www.descript.com', blurb: 'Edit video and audio by editing the transcript.' },
      { name: 'VEED', href: 'https://www.veed.io', blurb: 'Browser-based editing, subtitles and AI tools.' },
      { name: 'Filmora', href: 'https://filmora.wondershare.com', blurb: 'Approachable editor with AI features.' },
      { name: 'Opus Clip', href: 'https://www.opus.pro', blurb: 'Turn long videos into short, captioned clips.' },
    ],
  },
  {
    id: 'enhance',
    title: 'Upscaling & enhance',
    description: 'Sharpen, upscale and clean up renders.',
    items: [
      { name: 'Topaz Labs', href: 'https://www.topazlabs.com', blurb: 'Upscaling and enhancement for image and video.' },
      { name: 'Magnific', href: 'https://magnific.ai', blurb: 'Creative upscaling that adds detail.' },
      { name: 'Krea', href: 'https://www.krea.ai', blurb: 'Real-time generation, upscaling and enhancement.' },
      { name: 'Pixop', href: 'https://www.pixop.com', blurb: 'Cloud video upscaling and restoration.' },
    ],
  },
  {
    id: 'allinone',
    title: 'All-in-one & pre-production',
    description: 'Storyboards, shot lists and end-to-end workflows.',
    items: [
      { name: 'LTX Studio', href: 'https://ltx.studio', blurb: 'Script-to-screen studio for AI-generated films.' },
      { name: 'Google Flow', href: 'https://labs.google/flow', blurb: 'An AI filmmaking tool built around Veo.' },
      { name: 'Invideo AI', href: 'https://invideo.io', blurb: 'Generate full videos from a prompt.' },
      { name: 'Kaiber', href: 'https://kaiber.ai', blurb: 'Stylized video and music-video generation.' },
      { name: 'Katalist', href: 'https://www.katalist.ai', blurb: 'AI storyboarding with consistent characters.' },
      { name: 'Boords', href: 'https://boords.com', blurb: 'Storyboarding and animatics for teams.' },
    ],
  },
];

function hostOf(href: string): string {
  try {
    return new URL(href).host.replace(/^www\./, '');
  } catch {
    return href;
  }
}

/**
 * The tool's logo, served locally from `public/resource-logos/<host>.png` (the
 * site's favicon, normalized). Sits on a white tile so dark/monochrome marks
 * read in both light and dark themes. Falls back to a letter badge if the image
 * is missing.
 */
function Logo({ item }: { item: Resource }) {
  const [failed, setFailed] = useState(false);
  const src = item.internal ? '/logo-96.png' : `/resource-logos/${hostOf(item.href)}.png`;
  if (failed) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-theme-bg-secondary text-base font-semibold text-theme-text-secondary">
        {item.name.charAt(0)}
      </span>
    );
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-theme-border bg-white p-1">
      <img
        src={src}
        alt=""
        aria-hidden
        loading="lazy"
        className="h-full w-full object-contain"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

function ResourceCard({ item }: { item: Resource }) {
  const content = (
    <div className="flex items-start gap-3">
      <Logo item={item} />
      <div className="min-w-0">
        <Text as="span" className="block font-semibold text-theme-text-primary">
          {item.name}
        </Text>
        <Text as="span" size="sm" className="mt-1 block text-theme-text-secondary">
          {item.blurb}
        </Text>
        {!item.internal && (
          <Text as="span" size="xs" className="mt-2 block text-theme-text-secondary">
            {hostOf(item.href)} ↗
          </Text>
        )}
      </div>
    </div>
  );
  const className =
    'block rounded-lg border border-theme-border bg-theme-bg-primary p-4 transition-colors hover:border-theme-text-primary';
  return item.internal ? (
    <Link to={item.href} className={className}>
      {content}
    </Link>
  ) : (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  );
}

export function ResourcesPage() {
  const toolCount = GROUPS.reduce((n, g) => n + g.items.length, 0);
  return (
    <Section spacing="3xl">
      <div className="flex flex-col gap-3">
        <Heading level={1} size="3xl" weight="bold">
          Resources
        </Heading>
        <Text as="p" size="lg" color="muted" className="max-w-2xl">
          A directory of {toolCount}+ tools for AI filmmaking, from script to
          screen. Design your cast here, then take them through writing, image,
          video, avatars, audio, 3D and post. Links open in a new tab.
        </Text>
        <nav aria-label="Resource categories" className="flex flex-wrap gap-2">
          {GROUPS.map((g) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="rounded-full border border-theme-border px-3 py-1 text-sm text-theme-text-secondary hover:border-theme-text-primary hover:text-theme-text-primary"
            >
              {g.title}
            </a>
          ))}
        </nav>
      </div>

      <div className="mt-10 flex flex-col gap-10">
        {GROUPS.map((group) => (
          <section key={group.id} id={group.id} className="scroll-mt-24">
            <Heading level={2} size="xl" weight="semibold">
              {group.title}
            </Heading>
            <Text as="p" size="sm" color="muted" className="mt-1">
              {group.description}
            </Text>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <ResourceCard key={item.name} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </Section>
  );
}
