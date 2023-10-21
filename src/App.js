import React, { Component } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const url = "/david/rest_api_alu_materias_daw/api/lista_planes_materias.php";
const itemsPerPage = 10; // Cantidad de elementos por página

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      modalInsertar: false,
      form: {
        cve_plan: '',
        grado: '',
        clave: '',
        materia: '',
        horas_prac: '',
        horas_teo: '',
        creditos: '',
        tipoModal: '',
      },
      searchTerm: '', // Nuevo estado para la búsqueda
      currentPage: 1, // Página actual
    };
  }

  peticionGet = () => {
    axios.get(url)
      .then(response => {
        if (response.data && response.data.body && Array.isArray(response.data.body)) {
          this.setState({ data: response.data.body }, () => {
            console.log('Datos actualizados en el estado:', this.state.data);
          });
        } else {
          console.error('Response data is not in the expected format');
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  peticionPost = async () => {
    try {
      const response = await axios.post('/david/rest_api_alu_materias_daw/api/create_materia.php', this.state.form);
      if (response.data && response.data.body) {
        this.modalInsertar();
        this.peticionGet(); // Actualiza la lista después de la inserción
      } else {
        console.error('Response data is not in the expected format');
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  peticionPut = () => {
    axios.put('/david/rest_api_alu_materias_daw/api/update_materia.php', this.state.form)
      .then(response => {
        if (response.data && response.data.body) {
          this.modalInsertar();
          this.peticionGet();
        } else {
          console.error('Response data is not in the expected format');
        }
      })
      .catch(error => {
        console.error('Error updating data:', error);
      });
  }

  peticionDelete = (materia) => {
    console.log("Materia a eliminar:", materia);
    if (materia && materia.materia) {
      axios
        .delete('/david/rest_api_alu_materias_daw/api/delete_materia.php', {
          data: materia,
        })
        .then(() => {
          this.modalInsertar();
          this.peticionGet(); // Actualiza la lista después de eliminar
        })
        .catch((error) => {
          console.error('Error deleting data:', error);
        });
    } else {
      console.error('No se proporcionó un valor de "materia" válido para eliminar.');
    }
  }

  modalInsertar = () => {
    this.setState({ modalInsertar: !this.state.modalInsertar });
  }

  seleccionaMateria = (materia, tipo) => {
    console.log("Valor de 'materia' en seleccionaMateria:", materia);
    this.setState({
      tipoModal: tipo,
      form: {
        cve_plan: materia.cve_plan,
        grado: materia.grado,
        clave: materia.clave,
        materia: materia.materia,
        horas_prac: materia.horas_prac,
        horas_teo: materia.horas_teo,
        creditos: materia.creditos,
      },
    });
  }

  handleChange = async (e) => {
    e.persist();
    await this.setState({
      form: {
        ...this.state.form,
        [e.target.name]: e.target.value,
      },
    });
  }

  componentDidMount() {
    this.peticionGet();
  }

  render() {
    const { form, currentPage, data } = this.state;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

    return (
      <div className="App">
        <br />
        <button className='btn btn-success' onClick={() => { this.setState({ form: null, tipoModal: 'insertar' }); this.modalInsertar(); }}>Agregar Materias</button>
        <br /><br />
        <table className='table'>
          <thead>
            <tr>
              <th>Clave Plan</th>
              <th>Grado</th>
              <th>Clave</th>
              <th>Materia</th>
              <th>Horas Practica</th>
              <th>Horas Teorica</th>
              <th>Creditos</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(materia => {
              return (
                <tr key={materia.cve_plan}>
                  <td>{materia.cve_plan}</td>
                  <td>{materia.grado}</td>
                  <td>{materia.clave}</td>
                  <td>{materia.materia}</td>
                  <td>{materia.horas_prac}</td>
                  <td>{materia.horas_teo}</td>
                  <td>{materia.creditos}</td>
                  <td>
                    <button
                      className='btn btn-primary'
                      onClick={() => { this.seleccionaMateria(materia, 'actualizar'); this.modalInsertar(); }}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    {"     "}
                    <button className='btn btn-danger' onClick={() => this.peticionDelete(materia)}>
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="pagination">
          <button onClick={() => this.setState({ currentPage: currentPage - 1 })} disabled={currentPage === 1}>Anterior</button>
          <button onClick={() => this.setState({ currentPage: currentPage + 1 })} disabled={indexOfLastItem >= data.length}>Siguiente</button>
        </div>

        <Modal isOpen={this.state.modalInsertar}>
          <ModalHeader style={{ display: 'block' }}>
            <span style={{ float: 'right' }}></span>
          </ModalHeader>
          <ModalBody>
            <div className="form-group">
              <label htmlFor="cve_plan">Clave Plan</label>
              <input className="form-control" type="text" name="cve_plan" id="cve_plan" onChange={this.handleChange} value={form ? form.cve_plan : ''} />
              <br />
              <label htmlFor="grado">Grado</label>
              <input className="form-control" type="text" name="grado" id="grado" onChange={this.handleChange} value={form ? form.grado : ''} />
              <br />
              <label htmlFor="clave">Clave</label>
              <input className="form-control" type="text" name="clave" id="clave" onChange={this.handleChange} value={form ? form.clave : ''} />
              <br />
              <label htmlFor="materia">Materia</label>
              <input className="form-control" type="text" name="materia" id="materia" onChange={this.handleChange} value={form ? form.materia : ''} />
              <br />
              <label htmlFor="horas_prac">Horas Practica</label>
              <input className="form-control" type="text" name="horas_prac" id="horas_prac" onChange={this.handleChange} value={form ? form.horas_prac : ''} />
              <br />
              <label htmlFor="horas_teo">Horas Teoricas</label>
              <input className="form-control" type="text" name="horas_teo" id="horas_teo" onChange={this.handleChange} value={form ? form.horas_teo : ''} />
              <br />
              <label htmlFor="creditos">Creditos</label>
              <input className="form-control" type="text" name="creditos" id="creditos" onChange={this.handleChange} value={form ? form.creditos : ''} />
              <br />
            </div>
          </ModalBody>
          <ModalFooter>
            {this.state.tipoModal === 'insertar' ?
              <button className="btn btn-success" onClick={() => this.peticionPost()}>
                Insertar
              </button> :
              <button className='btn btn-primary' onClick={() => this.peticionPut()}>
                Actualizar
              </button>
            }
            <button className="btn btn-danger" onClick={() => this.modalInsertar()}>Cancelar</button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default App;
