import React, { useEffect, useState } from "react";
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
import $ from "jquery";
import imageCompression from "browser-image-compression";

import "../App.css";

function Home(props) {
  const [state, setState] = React.useState(true);
  const [image, setImage] = React.useState("");
  const [data, setData] = React.useState([]);
  const [videoURL, setVideoURL] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [isUploading, setUploading] = useState(false);
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

  const handleUploadPicture = async () => {
    // console.log(`originalFile size ${image.size / 1024 / 1024} MB`);
    if (isNaN(image.size)) return alert("Choose an image!");
    setUploading(true);

    try {
      const compressedFile = await imageCompression(image, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      // console.log(
      //   "compressedFile instanceof Blob",
      //   compressedFile instanceof Blob
      // ); // true
      // console.log(
      //   `compressedFile size ${compressedFile.size / 1024 / 1024} MB`
      // );

      firebase
        .storage()
        .ref("images/Cypher" + Date.now())
        .put(compressedFile)
        .then((snapshot) => {
          snapshot.ref.getDownloadURL().then((url) => {
            firebase
              .firestore()
              .collection("images")
              .add({
                link: url,
                timestamp: Date.now(),
                day: getDay(),
              })
              .then(() => {
                firebase
                  .firestore()
                  .collection("images")
                  .doc("stats")
                  .update({
                    total: firebase.firestore.FieldValue.increment(1),
                  })
                  .then(() => {
                    handleClose();
                    setUploading(false);
                    setImage(NaN);
                  })
                  .catch(() => {
                    setUploading(false);
                  });
              })
              .catch((error) => {
                setUploading(false);
                alert("Image Uploading Failed !!");
              });
          });
        })
        .catch((error) => {
          setUploading(false);
          alert("Image Uploading Failed !!");
        });
    } catch (error) {
      alert("Image Uploading Failed !!");
    }
  };

  const handleVideoClick = () => {
    setState(true);
    setLoading(true);
    setActiveState([1, 0, 0]);

    firebase
      .firestore()
      .collection("videos")
      .onSnapshot((querySnapshot) => {
        let temp = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().thumbnail !== undefined)
            temp.push({ id: doc.id, ...doc.data() });
        });
        setData(temp);
        setLoading(false);
      });
  };

  const handlePictureClick = () => {
    setState(false);
    setLoading(true);
    setActiveState([0, 1, 0]);

    firebase
      .firestore()
      .collection("images")
      .onSnapshot((querySnapshot) => {
        let temp = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().link !== undefined)
            temp.push({ id: doc.id, ...doc.data() });
        });
        setData(temp);
        setLoading(false);
      });
  };

  const getDay = () => {
    switch (new Date().getDay()) {
      case 0:
        return "Sunday";
      case 1:
        return "Monday";
      case 2:
        return "Tuesday";
      case 3:
        return "Wednesday";
      case 4:
        return "Thursday";
      case 5:
        return "Friday";
      case 6:
        return "Saturday";
    }
  };

  const handleSave = () => {
    if (state) {
      // video upload query
      setUploading(true);

      let id = videoURL;
      if (videoURL.includes("player.vimeo.com")) {
        id = videoURL.slice(videoURL.indexOf("/video/") + 7);
        if (id.length > 9) id = id.slice(0, id.indexOf("/"));
      } else {
        id = videoURL.slice(videoURL.indexOf(".com/") + 5);
        if (id.length > 9) id = id.slice(0, id.indexOf("/"));
      }

      $.ajax({
        type: "GET",
        url:
          "https://vimeo.com/api/oembed.json?url=" +
          encodeURIComponent(videoURL),
        dataType: "json",
        success: function (data) {
          firebase
            .firestore()
            .collection("videos")
            .doc(id)
            .set({
              timestamp: Date.now(),
              day: getDay(),
              link: `https://player.vimeo.com/video/${id}`,
              thumbnail: data.thumbnail_url,
            })
            .then(() => {
              firebase
                .firestore()
                .collection("videos")
                .doc("stats")
                .update({
                  total: firebase.firestore.FieldValue.increment(1),
                })
                .then(() => {
                  handleClose();
                  setUploading(false);
                  setVideoURL("");
                })
                .catch(() => setUploading(false));
            })
            .catch(() => {
              setUploading(false);
              alert("Video Uploading Failed !!");
            });
        },
      });
    } else {
      // image upload query
      handleUploadPicture();
    }
  };

  const handleDelete = (id) => {
    let collection = state ? "videos" : "images";

    firebase
      .firestore()
      .collection(collection)
      .doc(id)
      .delete()
      .then(() => {
        firebase
          .firestore()
          .collection(collection)
          .doc("stats")
          .update({
            total: firebase.firestore.FieldValue.increment(-1),
          });
      })
      .catch((error) => alert(error.message));
  };

  const onFileChange = (event) => {
    setImage(event.target.files[0]);
  };

  useEffect(handleVideoClick, []);

  return (
    <>
      <style>{"body { background-color: #012443; }"}</style>
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>

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
              {isUploading ? (
                <Spinner animation="border" variant="success" />
              ) : (
                <>
                  <Button variant="danger" onClick={handleClose}>
                    Close
                  </Button>
                  <Button variant="success" onClick={handleSave}>
                    Upload
                  </Button>
                </>
              )}
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
                  Upload {state ? "Video" : "Picture"}
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
                        onClick={() => handleDelete(element.id)}
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
