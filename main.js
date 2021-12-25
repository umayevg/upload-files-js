import {upload} from "./upload";

upload("#file", {
  multipleFiles: true,
  accept: [".jpg", ".png", ".gif"],
  onUpload(files) {
    // here uploading logic
    files.forEach(file => {
      console.log(file)
    })
  }

});
