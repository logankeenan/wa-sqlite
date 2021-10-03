async function start() {
  let headers = new Headers();
  headers.append("Range", `bytes=12000-12288`);

  return new Promise((resolve, reject) => {
    fetch("/demo/name-tbd.sqlite", {
      method: "GET",
      headers: headers
    }).then(async (response) => {
      let content = new Int8Array(288);
      const body = await response.body;
      const reader = body.getReader();
      let offset = 0;

      reader.read().then(function processText({
                                                done,
                                                value
                                              }) {
        if (done) {
          console.log("Stream complete");
          console.log(content)
          return;
        }

        content.subarray(offset).set(value)
        offset = offset + value.length;

        // Read some more, and call this function again
        return reader.read().then(processText);
      });
    });
  })
}

start()

// create an ArrayBuffer with a size in bytes
// const output = new Int8Array(6);
// const first = new Uint8Array([1,2,3]);
// const second = new Uint8Array([45,5,6]);

// // Copy the values into the array starting at index 3
// output.subarray(0).set(first)
// output.subarray(0 + second.length).set(second)

// console.log(output);
// // expected output: Uint8Array [0, 0, 0, 1, 2, 3, 0, 0]

















