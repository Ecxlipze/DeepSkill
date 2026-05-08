import { getSupabaseServerClient } from '../../../lib/supabaseServer';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase environment variables are missing.' });
  }

  const { id } = req.query;
  if (req.body?.actor?.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can delete blog posts.' });
  }

  const { error } = await supabase.from('blog_posts').delete().eq('id', id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ deleted: true });
}
