import axios from "axios";

export default function fetchROM(path, full) {
  return axios({
    method: "get",
    url: full ? path : "/data/" + path,
    responseType: "arraybuffer"
  });
}
