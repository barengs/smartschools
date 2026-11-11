import * as crypto from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { loadAppConfig } from '../../config/env.config';

export const ALLOWED_BUCKETS = [
  'ppdb-docs',
  'lms-media',
  'erapor-signed',
  'attendance-selfies',
  'library-ebooks',
] as const;

export type AllowedBucket = (typeof ALLOWED_BUCKETS)[number];

export interface PresignedUrlResult {
  method: 'PUT' | 'GET';
  bucket: AllowedBucket;
  objectKey: string;
  url: string;
  expiresInSeconds: number;
}

@Injectable()
export class StorageService {
  private readonly cfg = loadAppConfig();

  presignUpload(
    bucket: string,
    objectKey: string,
    expiresInSeconds = 900,
  ): PresignedUrlResult {
    return this.createPresignedUrl('PUT', bucket, objectKey, expiresInSeconds);
  }

  presignDownload(
    bucket: string,
    objectKey: string,
    expiresInSeconds = 300,
  ): PresignedUrlResult {
    return this.createPresignedUrl('GET', bucket, objectKey, expiresInSeconds);
  }

  private createPresignedUrl(
    method: 'PUT' | 'GET',
    bucket: string,
    rawKey: string,
    expiresInSeconds: number,
  ): PresignedUrlResult {
    if (!ALLOWED_BUCKETS.includes(bucket as AllowedBucket)) {
      throw new BadRequestException(`Bucket "${bucket}" is not allowed`);
    }

    const objectKey = this.sanitizeObjectKey(rawKey);
    const ttl = Math.min(Math.max(expiresInSeconds, 60), 3600);
    const endpoint = new URL(this.cfg.minioEndpoint);
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const credentialScope = `${dateStamp}/${this.cfg.minioRegion}/s3/aws4_request`;

    const basePath = endpoint.pathname.replace(/\/$/, '');
    const encodedKey = objectKey
      .split('/')
      .map((seg) => encodeURIComponent(seg))
      .join('/');
    const canonicalUri = `${basePath}/${bucket}/${encodedKey}`;

    const queryParams: Array<[string, string]> = [
      ['X-Amz-Algorithm', 'AWS4-HMAC-SHA256'],
      ['X-Amz-Credential', `${this.cfg.minioAccessKey}/${credentialScope}`],
      ['X-Amz-Date', amzDate],
      ['X-Amz-Expires', String(ttl)],
      ['X-Amz-SignedHeaders', 'host'],
    ];
    queryParams.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

    const canonicalQuery = queryParams
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQuery,
      `host:${endpoint.host}\n`,
      'host',
      'UNSIGNED-PAYLOAD',
    ].join('\n');

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      this.sha256Hex(canonicalRequest),
    ].join('\n');

    const signingKey = this.deriveSigningKey(dateStamp);
    const signature = crypto
      .createHmac('sha256', signingKey)
      .update(stringToSign)
      .digest('hex');

    const url = `${endpoint.origin}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
    return {
      method,
      bucket: bucket as AllowedBucket,
      objectKey,
      url,
      expiresInSeconds: ttl,
    };
  }

  private sanitizeObjectKey(rawKey: string): string {
    const cleaned = rawKey.trim().replace(/^\/+/, '');
    if (!cleaned || cleaned.includes('..') || cleaned.includes('\\')) {
      throw new BadRequestException('Invalid objectKey');
    }
    return cleaned;
  }

  private deriveSigningKey(dateStamp: string): Buffer {
    const kDate = this.hmac(`AWS4${this.cfg.minioSecretKey}`, dateStamp);
    const kRegion = this.hmac(kDate, this.cfg.minioRegion);
    const kService = this.hmac(kRegion, 's3');
    return this.hmac(kService, 'aws4_request');
  }

  private hmac(key: string | Buffer, data: string): Buffer {
    return crypto.createHmac('sha256', key).update(data).digest();
  }

  private sha256Hex(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

