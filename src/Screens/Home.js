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
// import imageCompression from "browser-image-compression";
import { handleVideoClick, handlePictureClick } from "../Handlers/handlers";
import imageCompression from "browser-image-compression";

import "../App.css";

function Home(props) {
  const [state, setState] = React.useState(true);
  const [imageFile, setImage] = React.useState("");
  const [data, setData] = React.useState([]);
  const [videoURL, setVideoURL] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [isLoading, setLoading] = React.useState(true);
  const [activeState, setActiveState] = React.useState([1, 0, 0]);
  const [isUploading, setUploading] = React.useState(false);

  const urlRef = React.createRef();

  // handlers
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleUploadVideo = () => {};

  const handleUpload = () => {
    if (state) {
      fetch("https://player.vimeo.com/video/586377266/config").then((res) => {
        console.log(res.json());
      });
    } else {
      let reload = handleUploadPicture(imageFile, setImage, setUploading);

      reload.then(() => {
        setUploading(false);
        setImage(NaN);
        handlePictureClick(setData, setState, setLoading, setActiveState);
        handleClose();
      });
    }
  };

  const handleDelete = (docId) => {};

  const onFileChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleUploadPicture = async () => {
    let downloadURL;
    console.log(`originalFile size ${imageFile.size / 1024 / 1024} MB`);
    if (isNaN(imageFile.size)) {
      alert("Chooase an image!");
      return;
    }
    setUploading(true);
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(imageFile, options);
      console.log(
        "compressedFile instanceof Blob",
        compressedFile instanceof Blob
      ); // true
      console.log(
        `compressedFile size ${compressedFile.size / 1024 / 1024} MB`
      ); // smaller than maxSizeMB
      var uploadTask = firebase
        .storage()
        .ref()
        .child("images/" + Date.now())
        .put(compressedFile);

      uploadTask.snapshot.ref.getDownloadURL().then((url) => {
        console.log("File available at", url);
        firebase
          .firestore()
          .collection("images")
          .add({
            link: url,
            timestamp: Date.now(),
            day: new Date.getDay(),
          })
          .then(() => {
            setUploading(false);
            setImage(NaN);
            handleClose();
          });
      });
    } catch (error) {
      console.log("Firestore eRR:" + error);
    }
  };
  useEffect(
    () => handleVideoClick(setData, setState, setLoading, setActiveState),
    []
  );

  return (
    <>
      <style>{"body { background-color: #012443; }"}</style>
      <Navbar className="nav-bar" variant="dark" fixed="top">
        <Container>
          <Navbar.Brand className="nav-brand">Cypher Fitness</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link
              active={activeState[0] ? true : false}
              onClick={() =>
                handleVideoClick(setData, setState, setLoading, setActiveState)
              }
            >
              Videos
            </Nav.Link>
            <Nav.Link
              active={activeState[1] ? true : false}
              onClick={() =>
                handlePictureClick(
                  setData,
                  setState,
                  setLoading,
                  setActiveState
                )
              }
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
                <input type="file" onChange={onFileChange} required />
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button variant="danger" onClick={handleClose}>
                Close
              </Button>
              <Button variant="success" onClick={handleUpload}>
                Upload
              </Button>
              {isUploading ? (
                <Spinner animation="border" variant="warning" />
              ) : null}
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
