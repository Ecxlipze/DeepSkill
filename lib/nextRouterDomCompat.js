import React from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

const MOTION_PROPS = new Set([
  'initial',
  'animate',
  'exit',
  'transition',
  'variants',
  'whileHover',
  'whileTap',
  'whileFocus',
  'whileDrag',
  'whileInView',
  'viewport',
  'drag',
  'dragConstraints',
  'dragElastic',
  'layout',
  'layoutId'
]);

function omitMotionProps(props) {
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => !MOTION_PROPS.has(key))
  );
}

export const Link = React.forwardRef(function RouterCompatLink(
  { to, href, replace, children, ...props },
  ref
) {
  const linkProps = omitMotionProps(props);

  return (
    <NextLink ref={ref} href={to || href || '#'} replace={replace} {...linkProps}>
      {children}
    </NextLink>
  );
});

export function useNavigate() {
  const router = useRouter();

  return React.useCallback(
    (to, options = {}) => {
      if (typeof to === 'number') {
        router.back();
        return;
      }

      if (options.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    },
    [router]
  );
}

export function useLocation() {
  const router = useRouter();
  const [hash, setHash] = React.useState('');
  const pathname = router.asPath.split('?')[0].split('#')[0];

  React.useEffect(() => {
    setHash(window.location.hash || '');
  }, [router.asPath]);

  return {
    pathname,
    search: router.asPath.includes('?') ? `?${router.asPath.split('?')[1].split('#')[0]}` : '',
    hash
  };
}

export function useParams() {
  const router = useRouter();
  const pathname = router.asPath.split('?')[0].split('#')[0];
  const parts = pathname.split('/').filter(Boolean);

  if (parts[0] === 'admin') {
    if (parts[1] === 'students' && parts[2]) return { id: parts[2] };
    if (parts[1] === 'teachers' && parts[2]) return { id: parts[2] };
    if (parts[1] === 'courses' && parts[2]) return { courseId: parts[2] };
  }

  return {};
}

export function Navigate({ to, replace = false }) {
  const navigate = useNavigate();

  React.useEffect(() => {
    navigate(to, { replace });
  }, [navigate, replace, to]);

  return null;
}

export function BrowserRouter({ children }) {
  return children;
}

export function Routes({ children }) {
  return children;
}

export function Route() {
  return null;
}
