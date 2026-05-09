import PublicLayout from '../components/next/PublicLayout';
import Seo from '../components/next/Seo';
import RegisterPage from '../src/RegisterPage';
import { breadcrumbSchema } from '../lib/structuredData';

export default function Register() {
  return (
    <PublicLayout>
      <Seo
        title="Register"
        description="Register your interest in a DeepSkills course."
        path="/register"
        jsonLd={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Register', path: '/register' }
        ])}
      />
      <RegisterPage />
    </PublicLayout>
  );
}

export async function getStaticProps() {
  return { props: {} };
}
