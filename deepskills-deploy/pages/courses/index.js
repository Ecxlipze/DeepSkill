import PublicLayout from '../../components/next/PublicLayout';
import Seo from '../../components/next/Seo';
import CoursesPage from '../../src/CoursesPage';
import { breadcrumbSchema } from '../../lib/structuredData';

export default function Courses() {
  return (
    <PublicLayout>
      <Seo
        title="Courses"
        description="Explore DeepSkills course outlines in React, Laravel, WordPress, graphic design, and digital careers."
        path="/courses"
        jsonLd={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Courses', path: '/courses' }
        ])}
      />
      <CoursesPage />
    </PublicLayout>
  );
}

export async function getStaticProps() {
  return { props: {} };
}
