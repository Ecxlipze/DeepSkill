import PublicLayout from '../components/next/PublicLayout';
import Seo from '../components/next/Seo';
import HomePage from '../src/HomePage';
import { localBusinessSchema, organizationSchema, websiteSchema } from '../lib/structuredData';

export default function Home() {
  return (
    <PublicLayout>
      <Seo
        path="/"
        jsonLd={[organizationSchema(), localBusinessSchema(), websiteSchema()]}
      />
      <HomePage />
    </PublicLayout>
  );
}

export async function getStaticProps() {
  return { props: {} };
}
