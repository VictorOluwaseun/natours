import axios from "axios";
import {
  showAlert
} from "./alert";

// var headers = new Headers();
// headers.append('Content-type', 'application/json');
// headers.append('Accept', 'application/json');

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:3000/api/v1/users/login",
      data: {
        email,
        password
      }
    });
    if (res.data.status === "success") {
      showAlert("success", "Logged in successfully!");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (err) {
    // return null;
    showAlert("error", err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "http://127.0.0.1:3000/api/v1/users/logout"
    });
    if (res.data.status === "success") location.replace("/"); //location.reload(true);
  } catch (err) {
    // return null;
    showAlert("error", "Error logging out! Try again.")
  }
}