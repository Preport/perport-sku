import got, { Response } from 'got';
import { FsCache } from '../fsCache';

const NOT_MODIFIED = 304;
const gotInstance = got.extend({
  handlers: [
    //@ts-expect-error
    (options, next) => {
      if (options.isStream) return next(options);

      if (options.context.isLiveUpdate) {
        return (async () => {
          const response = (await next(options)) as Response;
          if (response.statusCode === NOT_MODIFIED) {
            const err = new got.HTTPError(response);
            err.name = 'LiveUpdateNotModifiedError';
            throw err;
          }
          return response;
        })();
      }
      return next(options);
    }
  ],
  cache: FsCache.get()
});

export default gotInstance;
