/**
 * Shape of a page's local `PAGE_METADATA` constant. Values stay co-located with
 * each page for readability; this type only shares their structure.
 */
export type PageMetadata = {
  title: string;
  description: string;
  keywords?: string[];
};
