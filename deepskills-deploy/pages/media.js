import PublicLayout from '../components/next/PublicLayout';
import Seo from '../components/next/Seo';
import MediaPage from '../src/MediaPage';
import { supabase } from '../src/supabaseClient';
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

export async function getServerSideProps() {
  try {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Media SSR Supabase error:', error);
      return { props: { initialItems: [] } };
    }

    return {
      props: {
        initialItems: data || []
      }
    };
  } catch (error) {
    console.error('Media SSR fetch failed:', error);
    return { props: { initialItems: [] } };
  }
}
