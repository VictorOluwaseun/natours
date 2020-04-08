import axios from "axios";
import {
  showAlert
} from "./alert";

//Type is either "password" or data
export const updateSettings = async (data, type) => {
  try {

    const url = type === "password" ?
      "/api/v1/users/updateMyPassword" :
      "/api/v1/users/updateMe";

    const res = await axios({
      method: "PATCH",
      url,
      data
    });
    if (res.data.status === "success") {
      showAlert("success", `${type.toLowerCase()} updated successfully!`);
      window.location.reload(true);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
}