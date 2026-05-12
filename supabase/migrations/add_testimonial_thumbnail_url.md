# Add testimonial thumbnail URL

Run this in the Supabase SQL editor if the `testimonials` table does not already have a `thumbnail_url` column:

```sql
ALTER TABLE public.testimonials
ADD COLUMN IF NOT EXISTS thumbnail_url text;
```
