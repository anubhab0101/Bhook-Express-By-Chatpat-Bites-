import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

function withTimeout<T>(promise: Promise<T>, ms = 10000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => window.setTimeout(() => reject(new Error("Upload timed out")), ms)),
  ]);
}

async function fileToCompressedDataUrl(file: File): Promise<string> {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Invalid image file"));
      image.src = objectUrl;
    });

    const maxSize = 900;
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Image processing is not supported");
    ctx.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function uploadImage(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  try {
    const snap = await withTimeout(uploadBytes(storageRef, file));
    return withTimeout(getDownloadURL(snap.ref));
  } catch (err) {
    console.warn("Firebase Storage upload failed; using inline image", err);
    return fileToCompressedDataUrl(file);
  }
}

export async function uploadMenuImage(file: File, name: string): Promise<string> {
  return uploadImage(file, `menu/${Date.now()}_${name}`);
}

export async function uploadLogoImage(file: File): Promise<string> {
  return uploadImage(file, `settings/logo_${Date.now()}`);
}
