export const config = {
  matcher: '/',
};

export default function middleware(req: Request): Response | undefined {
  const authorizationHeader = req.headers.get('authorization');

  if (authorizationHeader !== null) {
    const [scheme, basicAuth] = authorizationHeader.split(' ');

    if (scheme !== 'Basic' || basicAuth === undefined) {
      return new Response('Basic Auth required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      });
    }

    const [user, password] = atob(basicAuth).split(':');

    if (user === '**TBD**' && password === '**TBD**') {
      return;
    }
  }

  return new Response('Basic Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}
