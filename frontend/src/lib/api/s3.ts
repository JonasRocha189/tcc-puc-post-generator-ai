import { ApiError } from "./http";

export type Progresso = (fracao: number) => void;

/**
 * PUT direto no S3 com uma URL pré-assinada pelo backend.
 * Usa XHR porque o fetch não informa o progresso do envio.
 */
export function putNoS3(
  url: string,
  arquivo: File,
  contentType: string,
  onProgress?: Progresso,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new ApiError(xhr.status, "Falha no envio para o S3"));
    xhr.onerror = () =>
      reject(new ApiError(0, "Falha de rede no envio para o S3"));
    xhr.send(arquivo);
  });
}
