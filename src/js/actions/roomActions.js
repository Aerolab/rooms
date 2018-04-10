import axios from "axios";

export function fetchRoom() {
  return function(dispatch) {
    dispatch({type: "FETCH_ROOM"});

    /*
      http://rest.learncode.academy is a public test server, so another user's experimentation can break your tests
      If you get console errors due to bad data:
      - change "reacttest" below to any other username
      - post some tweets to http://rest.learncode.academy/api/yourusername/tweets
    */
    axios.get("http://localhost:3165/api/rooms/sala-1")
      .then((response) => {
        dispatch({type: "FETCH_ROOM_FULFILLED", payload: response.data})
      })
      .catch((err) => {
        dispatch({type: "FETCH_ROOM_REJECTED", payload: err})
      })
  }
}
