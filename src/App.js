import Home from "./Screens/Home";
import "bootstrap/dist/css/bootstrap.min.css";
import firebase from "firebase";

function App() {
  let firebaseConfig = {
    apiKey: "AIzaSyCre61idCXicXxaI8JA9PtMX0YY0kNBq1A",
    authDomain: "cypher-fitness.firebaseapp.com",
    databaseURL: "https://cypher-fitness-default-rtdb.firebaseio.com",
    projectId: "cypher-fitness",
    storageBucket: "cypher-fitness.appspot.com",
    messagingSenderId: "863648882260",
    appId: "1:863648882260:web:001df02402e164f8b357c1",
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
