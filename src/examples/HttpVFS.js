import * as VFS from '../VFS.js';

function error(error) {
  console.log("error", error);
}

export class HttpVFS extends VFS.Base {

  name = 'httpvfs';

  xOpen(name, fileId, flags, pOutFlags) {
    console.log("xOpen");
    console.log("name", name);
    console.log("fileId", fileId);
    console.log("flags", flags);

    this.databaseUrl = name;

    pOutFlags.set(flags);

    return VFS.SQLITE_OK;
  }


  xAccess(name, flags, pResOut) {
    console.log("xAccess");
    // return super.xAccess(name, flags, pResOut);
    return VFS.SQLITE_OK;
  }

  xDeviceCharacteristics(fileId) {
    console.log("xDeviceCharacteristics");
    // return super.xDeviceCharacteristics(fileId);
    return VFS.SQLITE_IOCAP_IMMUTABLE;
  }

  xRead(fileId, pData, iOffset) {
    return this.handleAsync(async () => {
      console.log("xRead");
      console.log("fileId", fileId);
      console.log("iOffset", iOffset);
      console.log("pData.size", pData.size);
      let headers = new Headers();
      headers.append("Range", `bytes=${iOffset}-${iOffset + pData.size - 1}`);


      // return new Promise((resolve, reject) => {
      const response = await fetch("/demo/name-tbd.sqlite", {
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

      console.log("here");
      console.log("pData.value", pData.value);
      return VFS.SQLITE_OK;
    });
  }

  xFileSize(fileId, pSize64) {
    console.log("xFileSize");
    console.log("fileId", fileId);
    console.log("pSize64", pSize64);

    return this.handleAsync(async () => {
      const response = await fetch("/demo/name-tbd.sqlite", {
        method: "HEAD",
      })
      console.log("response", response);
      let headers = response.headers;

      console.log("headers", headers);
      let fileSize = headers.get("content-length");
      pSize64.set(fileSize);
      return VFS.SQLITE_OK
    });
  }

}
