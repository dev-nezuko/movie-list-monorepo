// types/Image.ts
export interface Image {
  name?: string;
  type?: string;
  file: File | null; // Change 'string | ArrayBuffer' to 'File | null'
}
