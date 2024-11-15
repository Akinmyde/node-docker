// Define the Illustration interface
export interface Illustration {
  id?: number; // 'id' is optional because it will be generated by the database
  name: string;
  preview: string;
  impressions?: number; // Optional, since these values can be set to a default
  uses?: number; // Optional, for the same reason as above
}
 