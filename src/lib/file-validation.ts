export const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024;

/* Binary types get a magic-byte check — the first few bytes of the actual
   file content, which a renamed/mislabeled file won't have. CSV has no such
   signature (it's plain text), so it's verified by confirming the content
   isn't binary garbage instead. */
const SIGNATURES: Record<string, { label: string; magic?: number[] }> = {
  ".csv": { label: "CSV" },
  ".xlsx": { label: "XLSX", magic: [0x50, 0x4b] },
  ".pdf": { label: "PDF", magic: [0x25, 0x50, 0x44, 0x46] },
  ".png": { label: "PNG", magic: [0x89, 0x50, 0x4e, 0x47] },
  ".jpg": { label: "JPG", magic: [0xff, 0xd8, 0xff] },
  ".jpeg": { label: "JPEG", magic: [0xff, 0xd8, 0xff] },
};

export type FileValidationResult = { ok: true; extension: string } | { ok: false; error: string };

export async function validateAttachment(file: File): Promise<FileValidationResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: `File is too large (max 3MB, this file is ${(file.size / 1024 / 1024).toFixed(1)}MB).`,
    };
  }

  const extension = `.${(file.name.split(".").pop() ?? "").toLowerCase()}`;
  const spec = SIGNATURES[extension];
  if (!spec) {
    return { ok: false, error: "Unsupported file type. Please attach a CSV, XLSX, PDF, PNG, or JPG file." };
  }

  if (spec.magic) {
    const head = new Uint8Array(await file.slice(0, spec.magic.length).arrayBuffer());
    const matches = spec.magic.every((byte, i) => head[i] === byte);
    if (!matches) {
      return { ok: false, error: `This file doesn't look like a real ${spec.label} file.` };
    }
  } else {
    const head = new Uint8Array(await file.slice(0, 512).arrayBuffer());
    const looksBinary = head.some((byte) => byte === 0);
    if (looksBinary) {
      return { ok: false, error: "This file doesn't look like a real CSV file." };
    }
  }

  return { ok: true, extension };
}
