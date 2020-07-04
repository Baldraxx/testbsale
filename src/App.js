import React, { useState } from "react";
import {
  Card,
  Button,
  Alert,
  Container,
  Row,
  Col,
  Nav,
  Navbar,
  Form,
  FormControl,
  Badge,
  Modal,
  Table,
  Jumbotron
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCartPlus } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "./App.css";

//Clase principal de la aplicacion
class Shop extends React.Component {
  //constructor
  constructor(props) {
    super(props);
    
    this.state = {
      token: "22636ca690d932cc523065f4b3dea68ed3184bdb", //token de seguridad
      item: [], //listado total o parcial de productos disponibles
      searchItem: "", //texto para buscar en el listado
      cartDetails: [], //productor escogidos para el carrito de compra
      totalCantidad: 0, //Total cantidad de productos para Badge
      AlertShow: false, //Mensaje de alerta
    };
  }

  //funcion de carga inicial
  componentDidMount() {
    this.loadData();
  }

  //funcion que carga la informacion
  loadData() {
    //variable de busqueda especifica de producto, si tiene algun valor, añadira la variable a la url
    var search =
      this.state.searchItem !== ""
        ? "?search_text=" + this.state.searchItem
        : "";
    //enviado request para obtener productos
    var self = this;
    axios({
      method: "get",
      url:
        "http://ec2-54-183-147-121.us-west-1.compute.amazonaws.com:8383/v2/markets/1/collection/2/market_info.json" +
        search,
      headers: { access_token: this.state.token },
      async: false,
      responseType: "json",
    })
      .then(function (response) {
        //en caso de codigo 200
        var arr = []; //nuevo array
        Object.keys(response.data.data).forEach(function (key) {
          //añade los datos relevantes al nuevo array
          arr.push(response.data.data[key]);
        });
        self.setState({ item: arr }); //setea el estado item el nuevo array creado
        if (arr.length === 0) {
          //si no encuentra nada, muestra mensaje de alerta
          self.setState({ AlertShow: true });
        }
      })
      .catch(function (error) {
        //en caso de error
        //muestra mensaje de alerta
        self.setState({ AlertShow: true });
      });
  }

  //Funcion para modificar carrito
  saveItem(id, price, urlImg, name) {
    //obtiene la cantidad escogida del producto selecccionado
    var cantidad =
      document.getElementById("quantity" + id).value === ""
        ? 1
        : document.getElementById("quantity" + id).value;
    //obtiene el estado de carrito de compra
    const arreglo = this.state.cartDetails;

    if (arreglo.length === 0) {
      //SI el carrito viene vacio...
      //crea el objeto...
      var objeto = {
        quantity: cantidad,
        unitValue: price,
        idVarianteProducto: id,
        urlImg: urlImg,
        name: name,
      };
      //y lo ingresa al arreglo del carrito
      arreglo.push(objeto);
    } else {
      //SI el carrito no viene vacio
      //crea booleano que verifica que el nuevo dato no existe en el actual arreglo
      var flag = true;
      //se revisa el arreglo para comprobar que el nuevo producto existe en el carrito
      arreglo.forEach(function (elemento) {
        if (elemento.idVarianteProducto === id) {
          //si encuentra el producto...
          elemento.quantity = cantidad; //actualiza a cantidad...
          flag = false; //y el booleano se cambia a false pues el nuevo dato si existe en el actual arreglo
        }
      });
      if (flag === true) {
        //si el booleano no cambio, significa que el nuevo dato no existia en el actual arreglo
        //crea el objeto...
        var objeto1 = {
          quantity: cantidad,
          unitValue: price,
          idVarianteProducto: id,
          urlImg: urlImg,
          name: name,
        };
        //y lo ingresa al arreglo del carrito
        arreglo.push(objeto1);
      }
    }
    //renueva el estado cartDetail con el nuevo carrito recien modificado
    this.setState({ cartDetails: arreglo });
    //porcede a contar la cantidad total de productos para mostrarlo en el Badge del boton carrito
    this.contarCantidadTotal();
  }

  //cuenta la cantidad de productos del carrito
  contarCantidadTotal() {
    var cantidad = 0; //contador
    this.state.cartDetails.forEach(function (elemento) {
      cantidad += parseInt(elemento.quantity); //suma la cantidad del producto al contador
    });
    //setea el nuevo valor al estado totalcantidad
    this.setState({ totalCantidad: cantidad });
  }
  //render encargado de mostrar la aplicacion
  render() {
    //estilos de las cartas de productos
    const cardstyle = {
      color: "dark",
      padding: "10px",
      margin: "10px",
      minHeight: "450px",
    };

    return (
      <React.Fragment>
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand href="#home">Test BSALE</Navbar.Brand>
          <Nav className="mr-auto">
            <Nav.Link href="#">
              {/* Boton del Modal Carrito de compra */}
              <CarritoCompra
                data={this.state.cartDetails}
                cantidad={this.state.totalCantidad}
                onHide={()=>this.contarCantidadTotal()}
              />
            </Nav.Link>
          </Nav>
          
          {/* Formulario de busqueda */}
          <Form onSubmit={(ev) => ev.preventDefault()} inline>
            <FormControl
              type="text"
              placeholder="Search"
              // cada vez que cambie este cambio actualizara el estado searchItem
              onChange={(ev) => this.setState({ searchItem: ev.target.value })}
              className="mr-sm-2"
            />
            {/* al pulsar el boton Buscar comenzara a listar los productos con un nuevo filtro */}
            <Button onClick={() => this.loadData()} variant="outline-info">
              Buscar
            </Button>
          </Form>
        </Navbar>
        {/* Contenedor principal */}
        <Container>
          
          <br />
          {/* Mensaje de alerta en caso de no encontrar productos */}
          <Alert
            variant="warning"
            show={this.state.AlertShow}
          >
            Productos no Disponibles!
          </Alert>
          <Row>
            {/* iteracion que se encarga de desglosar todos los productos y presentarlos */}
            {this.state.item.map((i) => (
              <Col xs={6} md={3} key={i.id.toString()}>
                <Card style={cardstyle}>
                  <Card.Img
                    variant="top"
                    src={
                      i.urlImg === null
                        ? "https://www.ed-versatil.com/images/no-photo.png"
                        : i.urlImg
                    }
                  />
                  <Card.Body>
                    <Card.Title>{i.name}</Card.Title>
                    <Card.Text>$ {parseInt(i.variant.finalPrice)} .-</Card.Text>
                    <Form onSubmit={(ev) => ev.preventDefault()}>
                      <Row>
                        <Col>
                          {/* input de cantidad de producto */}
                          <Form.Control
                            id={"quantity" + i.variant.id}
                            type="number"
                            placeholder="1"
                            min="1"
                          />
                        </Col>
                        <Col>
                          <Button
                            // al dar click guarda ESTE producto
                            onClick={(e) =>
                              this.saveItem(
                                i.variant.id,
                                i.variant.finalPrice,
                                i.urlImg,
                                i.name
                              )
                            }
                            variant="primary"
                          >
                            <FontAwesomeIcon icon={faCartPlus} />
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <br/>
          {/* Titulo */}
          <Titulo/>
        </Container>
      </React.Fragment>
    );
  }
}
//Jumbotron del titulo
function Titulo(){
  return(
    <Jumbotron>
      <h1>Prueba Técnica BSALE</h1>
      <p>
        Prueba realizada por Bayron Ramírez Parada, para BSALE.
      </p>
      <p>
        <a href="https://github.com/Baldraxx/testbsale" target={"_blank"}>Ver mas...</a>
      </p>
    </Jumbotron>
  )
}
//Modal encargado del Carrito de compras
function MostrarModal(props) {
  const [data, setData] = useState(props.data); //estado de la Data (Carrito)
  const [SuccessShow, setSuccessShow] = useState(false); //estado del mensaje de confirmacion
  const [DangerShow, setDangerShow] = useState(false); //estado del mensaje de error

  //funcion que se encarga de eliminar productor que ya no se quieren en el carrito de compras
  function editData(id) {
    var arr = []; //crea el nuevo arreglo
    data.forEach(function (elemento, key) {
      if (elemento.idVarianteProducto !== id) {
        //miestra el id del producto sea distinto al id escogido...
        arr.push(elemento); //añadira al nuevo array
      }
    });
    setData(arr); //setea la nueva data
  }

  //Funcion encargada de enviar todos los datos del carrito al servidor
  function enviarCarrito(token) {
    axios({
      method: "post",
      url:
        "http://ec2-54-183-147-121.us-west-1.compute.amazonaws.com:8585/v1/cart.json",
      data: { cartDetails: data },
      headers: { access_token: '22636ca690d932cc523065f4b3dea68ed3184bdb' },
      async: false,
    })
      .then(function (response) {
        //si el envio fue un exito
        if (response.data.code === "200") {
          //si el codigo es 200
          setSuccessShow(true); //muestra mensaje success
        } else {
          // si no...
          setDangerShow(true); //muestra mensaje error
        }
      })
      .catch(function (error) {
        //en caso de error
        setDangerShow(true); //muestra mensaje error
      });
  }

  //muestra el carrito de compras
  return (
    <React.Fragment>
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Carrito de Compra
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Mensaje Success */}
        <Alert
          variant="success"
          show={SuccessShow}
          onHide={() => setSuccessShow(false)}
        >
          Carrito Subido!
        </Alert>
        {/* Mensaje error */}
        <Alert
          variant="danger"
          show={DangerShow}
          onHide={() => setDangerShow(false)}
        >
          Error al Subir Carrito!
        </Alert>
        <br />
        <div >
        <Table  striped bordered hover size="sm" responsive>
          <thead>
            <tr>
              <th>Cant.</th>
              <th>Item</th>
              <th>$ Unidad</th>
              <th>SubTotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            
            {/* iteracion encarga de mostrar todos los productos del carrito seleccionado */}
            {data.map((th) => (
              <tr key={th.idVarianteProducto.toString()}>
                <th>{th.quantity}</th>
                <th>
                  <img
                    width={64}
                    height={64}
                    className="align-self-center mr-3"
                    alt="imagen"
                    src={
                      th.urlImg === null
                        ? "https://www.ed-versatil.com/images/no-photo.png"
                        : th.urlImg
                    }
                  />{" "}
                  {th.name}
                </th>
                <th>$ {parseInt(th.unitValue)}</th>
                <th>$ {parseInt(th.unitValue) * parseInt(th.quantity)}</th>
                <th>
                  <FontAwesomeIcon
                    style={{ cursor: "pointer" }}
                    title="Eliminar Articulo"
                    onClick={() => editData(th.idVarianteProducto)}
                    icon={faTrash}
                  />
                </th>
              </tr>
            ))}
          </tbody>
        </Table>
        <Form onSubmit={(ev) => ev.preventDefault()} inline>
          {/* boton que envia el json del carrito */}
          <Button  variant="secondary" onClick={() => enviarCarrito()}>
            Comprar
          </Button>
        </Form>
        </div>
      </Modal.Body>
      {/* cierra el modal */}
      <Modal.Footer>
        <Button onClick={props.onHide}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
    </React.Fragment>
  );
}
// funcion que muestra el boton que ,uestra el modal del carrito
function CarritoCompra(props) {
  const [modalShow, setModalShow] = useState(false); //estado del modal del carrito
  return (
    <>
      <Button variant="dark" onClick={props.cantidad>0?() => setModalShow(true):undefined}>
        {/* Basge de Cantidad de productos */}
        Carrito <Badge variant="danger">{props.cantidad}</Badge>
      </Button>
      {/* Carrito de Compras */}
      
      <MostrarModal
        // estado por defecto del modal
        show={modalShow}
        // data del carrito
        data={props.data}
        //funcion para volver a ocultar el Modal
        onHide={() => setModalShow(false)}
      />
    </>
  );
}

export default Shop;
