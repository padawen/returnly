import type { Instrumentation } from 'next'

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const path = request.path.split('?')[0]
  const details = error instanceof Error ? error : new Error(String(error))

  console.error(
    JSON.stringify({
      event: 'request_error',
      digest: 'digest' in details ? details.digest : undefined,
      message: details.message,
      stack: details.stack,
      path,
      method: request.method,
      route: context.routePath,
      routeType: context.routeType,
    }),
  )
}
