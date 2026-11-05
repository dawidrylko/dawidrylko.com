// JSON is not safe inside <script> as it stands: a "</script>" in any string value
// ends the block and spills the rest of the data into the page.
export const serializeJsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c');
