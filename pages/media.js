import PublicLayout from '../components/next/PublicLayout';
import Seo from '../components/next/Seo';
import MediaPage from '../src/MediaPage';
import { breadcrumbSchema } from '../lib/structuredData';

export default function Media({ initialItems }) {
  return (
    <PublicLayout>
      <Seo
        title="Media"
        description="DeepSkills media, student showcases, workshops, and training highlights."
        path="/media"
        jsonLd={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Media', path: '/media' }
        ])}
      />
      <MediaPage initialItems={initialItems} />
    </PublicLayout>
  );
}

export async function getStaticProps() {
  return { props: { initialItems: [] } };
}
