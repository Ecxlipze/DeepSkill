export default async function handler(req, res) {
  if (!['POST', 'GET'].includes(req.method)) {
    res.setHeader('Allow', 'POST, GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const slug = req.method === 'POST' ? req.body?.slug : req.query?.slug;

  try {
    await res.revalidate('/blogs');
    if (slug) {
      await res.revalidate(`/blogs/${slug}`);
    }

    return res.status(200).json({ revalidated: true, slug: slug || null });
  } catch (error) {
    return res.status(500).json({ revalidated: false, error: error.message });
  }
}
