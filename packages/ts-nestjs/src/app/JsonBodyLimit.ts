import { type CustomDecorator, SetMetadata } from '@nestjs/common';

export const JSON_BODY_LIMIT_METADATA = 'jsfsi-core:json-body-limit';

// Sets the JSON body limit of every route of a controller, in place of the app-wide
// JSON_BODY_LIMIT, so only the routes that take large bodies accept them. The limit
// is a `bytes` size ('4mb') or a number of bytes.
export const JsonBodyLimit = (limit: string | number): CustomDecorator<string> =>
  SetMetadata(JSON_BODY_LIMIT_METADATA, limit);
