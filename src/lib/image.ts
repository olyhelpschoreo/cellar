// Read a picked File into a data URL. In local mode this is what we persist as
// the photo; when Storage lands it'll upload the File and persist the returned
// URL instead — same call site, different tail.
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
