export type UploadImageOptions = {
  cloudName: string;
  fileName?: string;
  folder?: string;
  publicId?: string;
  uploadPreset: string;
};

export async function uploadImage(
  fileOrBlob: Blob | File,
  options: UploadImageOptions,
) {
  const formData = new FormData();
  const fileName = options.fileName ?? getBlobFileName(fileOrBlob);

  formData.append('file', fileOrBlob, fileName);
  formData.append('upload_preset', options.uploadPreset);

  if (options.folder) {
    formData.append('folder', options.folder);
  }

  if (options.publicId) {
    formData.append('public_id', options.publicId);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${options.cloudName}/image/upload`,
    {
      body: formData,
      method: 'POST',
    },
  );
  const payload = await response.json().catch(() => null);

  if (!response.ok || typeof payload?.secure_url !== 'string') {
    throw new Error(
      `Cloudinary upload failed (${response.status}): ${JSON.stringify(payload)}`,
    );
  }

  return payload.secure_url as string;
}

function getBlobFileName(fileOrBlob: Blob | File) {
  if (typeof File !== 'undefined' && fileOrBlob instanceof File) {
    return fileOrBlob.name;
  }

  return 'image.jpg';
}
