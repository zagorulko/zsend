import msgpack from 'msgpack-js';

const ECDH_CURVE = 'P-256';
const AES_MODE = 'AES-GCM';
const AES_LENGTH = 256;
const AES_IV_BYTES = 12;

export function ecdhGenerate() {
  let _key;
  return window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: ECDH_CURVE
    },
    false,
    ['deriveKey']
  )
  .then(key => {
    _key = key;
    return window.crypto.subtle.exportKey(
      'jwk',
      key.publicKey
    );
  })
  .then(publicKeyJwk => {
    return [_key.privateKey, publicKeyJwk];
  });
}

export function ecdhDerive(privateKey, peerPublicKeyJwk) {
  return window.crypto.subtle.importKey(
    'jwk',
    peerPublicKeyJwk,
    {
      name: 'ECDH',
      namedCurve: ECDH_CURVE
    },
    false,
    []
  )
  .then(peerPublicKey => {
    return window.crypto.subtle.deriveKey(
      {
        name: 'ECDH',
        namedCurve: ECDH_CURVE,
        public: peerPublicKey
      },
      privateKey,
      {
        name: AES_MODE,
        length: AES_LENGTH
      },
      false,
      ['encrypt', 'decrypt']
    );
  });
}

export function aesGenerateRawKey() {
  let _key;
  return window.crypto.subtle.generateKey(
    {
      name: AES_MODE,
      length: AES_LENGTH
    },
    true,
    ['encrypt','decrypt']
  )
  .then(key => {
    _key = key;
    return window.crypto.subtle.exportKey(
      'raw',
      key
    );
  })
  .then(keydata => {
    return [_key, new Uint8Array(keydata)];
  });
}

export function aesImportRawKey(rawKey) {
  return window.crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: AES_MODE },
    false,
    ['encrypt','decrypt']
  );
}

export function aesEncrypt(key, data) {
  let iv = window.crypto.getRandomValues(new Uint8Array(AES_IV_BYTES));
  return window.crypto.subtle.encrypt(
    {
      name: AES_MODE,
      iv: iv
    },
    key,
    msgpack.encode(data)
  )
  .then(encrypted => {
    return {
      iv: new Uint8Array(iv),
      data: new Uint8Array(encrypted)
    };
  });
}

export function aesDecrypt(key, data) {
  return window.crypto.subtle.decrypt(
    {
      name: AES_MODE,
      iv: data.iv
    },
    key,
    data.data
  )
  .then(decrypted => {
    return msgpack.decode(new Uint8Array(decrypted));
  });
}
