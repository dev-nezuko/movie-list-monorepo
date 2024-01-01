import "@testing-library/jest-dom";

// Provide a minimal mock for URL.createObjectURL to keep image-related
// helpers from throwing in the JSDOM environment used by Jest.
if (!(window as any).URL) {
  (window as any).URL = {} as URL;
}

if (typeof (window as any).URL.createObjectURL !== "function") {
  (window as any).URL.createObjectURL = () => "blob:mock-url";
}

