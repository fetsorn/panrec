import { World, setWorldConstructor, After } from "@cucumber/cucumber";
import { TextEncoder, TextDecoder } from "node:util";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadMocks } from "../../mocks/index.js";

// node polyfills for browser APIs
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

let counter = 0;

export class PanrecWorld extends World {
  constructor(options) {
    super(options);
    this.mocks = loadMocks();
    this.data = [];
    this.stdoutOutput = "";
    this.tmpdir = null;
    this.jsonOutputPath = null;
    this.fixture = null;
    this.expected = null;
    this.records = null;
  }

  setupCryptoImport() {
    Object.defineProperty(globalThis, "crypto", {
      value: {
        subtle: crypto.webcrypto.subtle,
        randomUUID: () => {
          counter += 1;
          return `${counter}`;
        },
      },
      writable: true,
      configurable: true,
    });
  }

  setupCryptoExport() {
    Object.defineProperty(globalThis, "crypto", {
      value: {
        subtle: crypto.webcrypto.subtle,
        randomUUID: crypto.randomUUID,
      },
      writable: true,
      configurable: true,
    });
  }

  createTmpdir() {
    this.tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), "panrec-test-"));
    return this.tmpdir;
  }

  cleanup() {
    if (this.tmpdir) {
      fs.rmSync(this.tmpdir, { recursive: true, force: true });
      this.tmpdir = null;
    }
  }
}

setWorldConstructor(PanrecWorld);

After(function () {
  this.cleanup();
});
