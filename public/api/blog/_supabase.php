<?php
function blog_json($status, $payload) {
    http_response_code($status);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: https://deepskills.pk');
    header('Access-Control-Allow-Methods: POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    echo json_encode($payload);
    exit();
}

function blog_load_env() {
    $paths = [
        __DIR__ . '/../../.env.local',
        __DIR__ . '/../../.env',
        __DIR__ . '/../../../.env',
    ];

    $env = [];
    foreach ($paths as $path) {
        if (!is_readable($path)) continue;
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#') continue;
            $pos = strpos($line, '=');
            if ($pos === false) continue;
            $key = trim(substr($line, 0, $pos));
            $value = trim(substr($line, $pos + 1));
            $env[$key] = trim($value, "\"'");
        }
    }

    return $env;
}

function blog_config() {
    $env = blog_load_env();
    $url = $env['NEXT_PUBLIC_SUPABASE_URL'] ?? $env['REACT_APP_SUPABASE_URL'] ?? '';
    $key = $env['SUPABASE_SERVICE_ROLE_KEY'] ?? $env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? $env['REACT_APP_SUPABASE_ANON_KEY'] ?? '';
    if (!$url || !$key) {
        blog_json(500, ['error' => 'Supabase environment variables are missing.']);
    }
    return [rtrim($url, '/'), $key];
}

function blog_request($method, $path, $payload = null, $extraHeaders = []) {
    [$url, $key] = blog_config();
    $headers = [
        'apikey: ' . $key,
        'Authorization: Bearer ' . $key,
        'Content-Type: application/json',
    ];
    $headers = array_merge($headers, $extraHeaders);

    $context = [
        'http' => [
            'method' => $method,
            'header' => implode("\r\n", $headers),
            'ignore_errors' => true,
        ],
    ];

    if ($payload !== null) {
        $context['http']['content'] = json_encode($payload);
    }

    $response = file_get_contents($url . '/rest/v1/' . $path, false, stream_context_create($context));
    $status = 0;
    if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $matches)) {
        $status = (int) $matches[1];
    }

    $decoded = json_decode($response ?: 'null', true);
    if ($status >= 400) {
        $message = is_array($decoded) ? ($decoded['message'] ?? $decoded['error'] ?? 'Supabase request failed') : 'Supabase request failed';
        blog_json($status, ['error' => $message]);
    }

    return $decoded;
}

function blog_slugify($value) {
    $value = strtolower(trim((string) $value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value);
    return trim($value, '-');
}

function blog_strip_html($html) {
    $html = preg_replace('/<script[\s\S]*?<\/script>/i', '', (string) $html);
    $html = preg_replace('/<style[\s\S]*?<\/style>/i', '', $html);
    $html = preg_replace('/<[^>]+>/', ' ', $html);
    return trim(preg_replace('/\s+/', ' ', $html));
}

function blog_word_count($html) {
    $text = blog_strip_html($html);
    return $text === '' ? 0 : count(preg_split('/\s+/', $text));
}

function blog_excerpt($html, $max = 170) {
    $text = blog_strip_html($html);
    if (strlen($text) <= $max) return $text;
    return preg_replace('/\s+\S*$/', '', substr($text, 0, $max)) . '...';
}

function blog_plain($value, $max) {
    $value = preg_replace('/[<>]/', '', (string) $value);
    $value = preg_replace('/[\x00-\x1F\x7F]/', '', $value);
    return substr(trim($value), 0, $max);
}

function blog_tags($tags) {
    if (!is_array($tags)) return [];
    $out = [];
    foreach ($tags as $tag) {
        $slug = substr(blog_slugify($tag), 0, 24);
        if ($slug && !in_array($slug, $out, true)) $out[] = $slug;
        if (count($out) >= 8) break;
    }
    return $out;
}

function blog_normalize($post) {
    return [
        'id' => $post['id'] ?? null,
        'title' => $post['title'] ?? '',
        'slug' => $post['slug'] ?? '',
        'excerpt' => $post['excerpt'] ?? blog_excerpt($post['content_html'] ?? ''),
        'content' => $post['content'] ?? null,
        'contentHtml' => $post['content_html'] ?? '',
        'coverImage' => $post['cover_image'] ?? '',
        'category' => $post['category'] ?? 'General',
        'tags' => $post['tags'] ?? [],
        'authorId' => $post['author_id'] ?? '',
        'authorName' => $post['author_name'] ?? 'DeepSkills Team',
        'status' => $post['status'] ?? 'draft',
        'isFeatured' => !empty($post['is_featured']),
        'scheduledAt' => $post['scheduled_at'] ?? null,
        'publishedAt' => $post['published_at'] ?? null,
        'readingTime' => $post['reading_time'] ?? max(1, ceil(blog_word_count($post['content_html'] ?? '') / 200)),
        'viewCount' => $post['view_count'] ?? 0,
        'metaTitle' => $post['meta_title'] ?? '',
        'metaDescription' => $post['meta_description'] ?? '',
        'canonicalUrl' => $post['canonical_url'] ?? '',
        'relatedCourseIds' => $post['related_course_ids'] ?? [],
        'createdAt' => $post['created_at'] ?? null,
        'updatedAt' => $post['updated_at'] ?? null,
    ];
}

function blog_row($input) {
    $contentHtml = $input['contentHtml'] ?? $input['content_html'] ?? '';
    $status = $input['status'] ?? 'draft';
    return [
        'title' => blog_plain($input['title'] ?? '', 120),
        'slug' => substr(blog_slugify($input['slug'] ?? $input['title'] ?? ''), 0, 90),
        'excerpt' => blog_plain($input['excerpt'] ?? blog_excerpt($contentHtml), 220),
        'content' => $input['content'] ?? null,
        'content_html' => $contentHtml,
        'cover_image' => $input['coverImage'] ?? $input['cover_image'] ?? '',
        'category' => $input['category'] ?? 'General',
        'tags' => blog_tags($input['tags'] ?? []),
        'author_id' => $input['authorId'] ?? $input['author_id'] ?? null,
        'author_name' => $input['authorName'] ?? $input['author_name'] ?? 'DeepSkills Team',
        'status' => $status,
        'is_featured' => !empty($input['isFeatured']) || !empty($input['is_featured']),
        'scheduled_at' => $status === 'scheduled' ? ($input['scheduledAt'] ?? $input['scheduled_at'] ?? null) : null,
        'published_at' => $status === 'published' ? ($input['publishedAt'] ?? $input['published_at'] ?? gmdate('c')) : ($input['publishedAt'] ?? $input['published_at'] ?? null),
        'reading_time' => $input['readingTime'] ?? $input['reading_time'] ?? max(1, ceil(blog_word_count($contentHtml) / 200)),
        'meta_title' => blog_plain($input['metaTitle'] ?? $input['meta_title'] ?? '', 60),
        'meta_description' => blog_plain($input['metaDescription'] ?? $input['meta_description'] ?? '', 160),
        'canonical_url' => $input['canonicalUrl'] ?? $input['canonical_url'] ?? '',
        'related_course_ids' => $input['relatedCourseIds'] ?? $input['related_course_ids'] ?? [],
        'updated_at' => gmdate('c'),
    ];
}
?>
