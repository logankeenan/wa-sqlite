import * as VFS from '../VFS.js';

export class HttpVFS extends VFS.Base {

  name = 'httpvfs';
  dbRelativeLocation = "/demo/name-tbd.sqlite"

  xOpen(name, fileId, flags, pOutFlags) {
    pOutFlags.set(flags);
    return VFS.SQLITE_OK;
  }


  xAccess(name, flags, pResOut) {
    return VFS.SQLITE_OK;
  }

  xDeviceCharacteristics(fileId) {
    return VFS.SQLITE_IOCAP_IMMUTABLE;
  }

  xRead(fileId, pData, iOffset) {
    return this.handleAsync(async () => {
      let headers = new Headers();
      headers.append("Range", `bytes=${iOffset}-${iOffset + pData.size - 1}`);
      const response = await fetch(this.dbRelativeLocation, {
        method: "GET",
        headers: headers
      });
      const reader = response.body.getReader();
      let offset = 0;
      let done = false;

      while (done === false) {
        let result = await reader.read();
        done = result.done
        if (!done) {
          pData.value.subarray(offset).set(result.value)
          offset = offset + result.value.length;
        }
      }
      return VFS.SQLITE_OK;
    });
  }

  xFileSize(fileId, pSize64) {
    return this.handleAsync(async () => {
      const response = await fetch(this.dbRelativeLocation, {
        method: "HEAD",
      })
      let headers = response.headers;
      let fileSize = headers.get("content-length");
      pSize64.set(fileSize);
      return VFS.SQLITE_OK
    });
  }

}
