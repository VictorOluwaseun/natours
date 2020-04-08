import axios from "axios";
const stripe = Stripe("pk_test_wo8YAI59RtICNKEc225W8AGl00OtqqQUOo");
import {
  showAlert
} from "./alert";

export const bookTour = async tourId => {
  try {
    //1 Get checkout session from API
    const session = await axios(`http://127.0.0.1:3000/api/v1/booking/checkout-session/${tourId}`);

    //2. Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    })
    // console.log(session);
  } catch (err) {
    console.log(err);
    showAlert("error", err);
  }


}