import fs from "fs";
import path from "path";

import readChunk from "read-chunk";
import imageType from "image-type";
import isSvg from "is-svg";

import { DEFAULT_LOCALE } from "../libs/constants";
import { ROOTS } from "../libs/env";
import { memoize, slugToFolder } from "./utils";

function isFileAttachment(filePath: string) {
  return (
    isAudio(filePath) ||
    isFont(filePath) ||
    isVideo(filePath) ||
    isImage(filePath)
  );
}

function isAudio(filePath: string) {
  return /\.(mp3|ogg)$/i.test(filePath);
}

function isFont(filePath: string) {
  return /\.(ttf)$/i.test(filePath);
}

function isVideo(filePath: string) {
  return /\.(mp4|webm)$/i.test(filePath);
}

function isImage(filePath: string) {
  if (fs.statSync(filePath).isDirectory()) {
    return false;
  }
  if (filePath.toLowerCase().endsWith(".svg")) {
    return isSvg(fs.readFileSync(filePath));
  }

  const buffer = readChunk.sync(filePath, 0, 12);
  if (buffer.length === 0) {
    return false;
  }
  const type = imageType(buffer);
  if (!type) {
    // This happens when there's no match on the "Supported file types"
    // https://github.com/sindresorhus/image-type#supported-file-types
    return false;
  }

  return true;
}

function urlToFilePath(url: string) {
  const [, locale, , ...slugParts] = decodeURI(url).split("/");
  return path.join(locale.toLowerCase(), slugToFolder(slugParts.join("/")));
}

const find = memoize((relativePath: string) => {
  return ROOTS.map((root) => path.join(root, relativePath)).find(
    (filePath) => fs.existsSync(filePath) && isFileAttachment(filePath)
  );
});

export function findByURL(url: string) {
  return find(urlToFilePath(url));
}

export function findByURLWithFallback(url: string): string {
  let filePath = findByURL(url);
  const urlParts = url.split("/");
  const locale = urlParts[1].toLowerCase();
  if (!filePath && locale !== DEFAULT_LOCALE) {
    urlParts[1] = DEFAULT_LOCALE;
    const defaultLocaleURL = urlParts.join("/");
    filePath = findByURL(defaultLocaleURL);
  }
  return filePath;
}
