import BlogPost from './[slug]';

export default BlogPost;

export async function getStaticProps() {
  return {
    props: {
      post: null,
      relatedPosts: [],
      relatedCourses: []
    }
  };
}
