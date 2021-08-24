import Home from "./Screens/Home";
import "bootstrap/dist/css/bootstrap.min.css";
import firebase from "firebase";

function App() {
  let firebaseConfig = {
    apiKey: "AIzaSyCTUtkjszCTIJ_VR3jxh8f0THG3OADp8u0",
    authDomain: "cypher-fitness-admin.firebaseapp.com",
    projectId: "cypher-fitness-admin",
    storageBucket: "cypher-fitness-admin.appspot.com",
    messagingSenderId: "461205302016",
    appId: "1:461205302016:web:6edccc6fc30e251d59a1e5",
  };

  // if already initialized, use that one
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  else firebase.app();
  return (
    <>
      <Home />
    </>
  );
}

export default App;
