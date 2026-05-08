import PublicLayout from '../components/next/PublicLayout';
import Seo from '../components/next/Seo';
import TraineePage from '../src/TraineePage';
import { breadcrumbSchema } from '../lib/structuredData';

export default function Trainers() {
  return (
    <PublicLayout>
      <Seo
        title="Trainers"
        description="Meet the DeepSkills training approach and mentor-led learning model."
        path="/trainers"
        jsonLd={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Trainers', path: '/trainers' }
        ])}
      />
      <TraineePage />
    </PublicLayout>
  );
}

export async function getStaticProps() {
  return { props: {} };
}
