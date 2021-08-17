import React, { useEffect } from "react";
import {
  Navbar,
  Container,
  Nav,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import firebase from "firebase";

import "../App.css";

function Home(props) {
  const [state, setState] = React.useState(true);
  const [image, setImage] = React.useState("");
  const [data, setData] = React.useState([]);
  const [videoURL, setVideoURL] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [isLoading, setLoading] = React.useState(true);
  const [activeState, setActiveState] = React.useState([1, 0, 0]);

  const urlRef = React.createRef();

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

  // handlers
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleVideoClick = () => {
    setState(true);
    setLoading(true);
    setActiveState([1, 0, 0]);

    firebase
      .firestore()
      .collection("videos")
      .get()
      .then((querySnapshot) => {
        let temp = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().thumbnail !== undefined)
            temp.push({ id: doc.id, ...doc.data() });
        });
        setData(temp);
      })
      .finally(() => setLoading(false));
  };

  const handlePictureClick = () => {
    setState(false);
    setLoading(true);
    setActiveState([0, 1, 0]);
    firebase
      .firestore()
      .collection("images")
      .get()
      .then((querySnapshot) => {
        let temp = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().link !== undefined)
            temp.push({ id: doc.id, ...doc.data() });
        });
        setData(temp);
      })
      .finally(() => setLoading(false));
  };

  const handleSave = () => {
    state
      ? console.log("do video save query")
      : console.log("do pic save query");
  };

  const handleDelete = () => {};

  const onFileChange = (event) => {
    setImage(event.target.files[0]);
  };

  useEffect(handleVideoClick, []);

  return (
    <>
      <style>{"body { background-color: #012443; }"}</style>
      <Navbar className="nav-bar" variant="dark" fixed="top">
        <Container>
          <Navbar.Brand className="nav-brand">Cypher Fitness</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link
              active={activeState[0] ? true : false}
              onClick={handleVideoClick}
            >
              Videos
            </Nav.Link>
            <Nav.Link
              active={activeState[1] ? true : false}
              onClick={handlePictureClick}
            >
              Pictures
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      {isLoading === false ? (
        <>
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Add {state === 0 ? "Video" : "Picture"}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              {state ? (
                <Form>
                  <Form.Group controlId="formBasicEmail">
                    <Form.Label>Video Url</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter viemo url"
                      onChange={() => setVideoURL(urlRef.current.value)}
                      ref={urlRef}
                      value={videoURL}
                    />
                  </Form.Group>
                </Form>
              ) : (
                <input type="file" onChange={onFileChange} />
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button variant="danger" onClick={handleClose}>
                Close
              </Button>
              <Button variant="success" onClick={handleSave}>
                Upload
              </Button>
            </Modal.Footer>
          </Modal>
          <Container
            style={{
              marginTop: 70,
              justifyContent: "center",
            }}
            fluid="md"
          >
            <Row className="mt-1">
              <Col lg={true} className="d-flex justify-content-end">
                <Button
                  className="add_button"
                  variant="success"
                  onClick={handleShow}
                >
                  Upload {state === 0 ? "Video" : "Picture"}
                </Button>
              </Col>
            </Row>
            <Row className="mt-1">
              {data.map((element) => (
                <Col
                  md={3}
                  style={{ justifyContent: "center", padding: 10 }}
                  key={element.id}
                >
                  <Card className="card">
                    {state ? (
                      <Card.Header style={{ width: "100%" }}>
                        <iframe
                          title="veimoPlayer"
                          src={element.link}
                          frameBorder="0"
                          allow="autoplay; fullscreen"
                          allowFullScreen
                        ></iframe>
                      </Card.Header>
                    ) : (
                      <Card.Img
                        variant="top"
                        className="photo"
                        src={element.link}
                      />
                    )}

                    <Card.Body>
                      <Button
                        style={{ alignSelf: "flex-start" }}
                        variant="danger"
                        onClick={handleDelete}
                      >
                        Delete
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </>
      ) : (
        <>
          <div className="centered">
            <Spinner animation="grow" variant="light" />
          </div>
        </>
      )}
    </>
  );
}

export default Home;
