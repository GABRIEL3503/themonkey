document.addEventListener('DOMContentLoaded', function() {
  // Botón de login
  const loginButton = document.getElementById("login-button");

  // Agregar evento de clic al botón de login
  loginButton.addEventListener("click", function() {
    // Muestra el modal de SweetAlert para ingresar la contraseña
    Swal.fire({
      title: 'Ingrese su contraseña',
      input: 'password',
      inputPlaceholder: 'Contraseña',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Login',
      showLoaderOnConfirm: true,
      preConfirm: (password) => {
        return authenticate(password);  // Llama a tu función authenticate
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Aquí puedes añadir lo que quieras hacer una vez que el usuario esté autenticado
        updateUI();
      }
    });
  });

  // Tu función para autenticar al usuario
  function authenticate(password) {
    const correctPassword = "luca2020";
    if (password === correctPassword) {
      localStorage.setItem("authenticated", "true");
      return true;
    } else {
      Swal.showValidationMessage("Contraseña incorrecta");
      return false;
    }
  }

  // Tu función para verificar si el usuario está autenticado
  function checkAuthentication() {
    return localStorage.getItem("authenticated") === "true";
  }

  // Función para actualizar la UI, si es necesario
 // Función para actualizar la UI según el estado de autenticación
function updateUI() {
  const isAuthenticated = checkAuthentication();
  const clientButtons = document.querySelectorAll('.client-button');
  const statusButtons = document.querySelectorAll('.libre');
  const staButtons = document.querySelectorAll('.ocupado');

  if (isAuthenticated) {   
    clientButtons.forEach(button => button.style.display = "inline-block");
    statusButtons.forEach(button => button.style.pointerEvents = "all");
    staButtons.forEach(button => button.style.pointerEvents = "all");


  } else {
    clientButtons.forEach(button => button.style.display = "none");
    statusButtons.forEach(button => button.classList.add("disabled"));
    staButtons.forEach(button => button.style.pointerEvents = "disabled");
  }
}

});



// cambia estado del boton
document.addEventListener("DOMContentLoaded", function () {
  // Función para cambiar el estado del botón y actualizar en la base de datos
  function toggleStatus(button) {
    const currentStatus = button.getAttribute("data-status");
    const newStatus = currentStatus === "libre" ? "ocupado" : "libre";
    const turnoId = button.getAttribute("data-id");

    // Actualizar UI
    button.setAttribute("data-status", newStatus);
    button.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    button.style.backgroundColor = newStatus === "libre" ? "green" : "red";

    // Actualizar en la base de datos
    fetch(`https://themonkeybarber.com.ar/api/turnos/${turnoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado: newStatus }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Estado actualizado:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  //   solicitud al backend para obtener todos los turnos y luego los mostraremos en la página.


 fetch('https://themonkeybarber.com.ar/api/turnos')

    .then(response => response.json())
    .then(data => {
      data.forEach(turno => {
        if (turno.hora.length === 1) {
          turno.hora = '0' + turno.hora;
        }
      });

      data.sort((a, b) => {
        return a.hora.localeCompare(b.hora);
      });
      const swiperWrapper = document.querySelector('.swiper-wrapper');

      // Agrupar los turnos por día
      const turnosPorDia = data.reduce((acc, turno) => {
        if (!acc[turno.dia]) {
          acc[turno.dia] = [];
        }
        acc[turno.dia].push(turno);
        return acc;
      }, {});

      // Obtener la fecha actual y calcular las fechas para cada día de la semana
      const hoy = new Date();
      const diasDeLaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      // Reorganizar el array para que el día actual sea el primero
      const diaActual = diasDeLaSemana[hoy.getDay()];
      const indexDiaActual = diasDeLaSemana.indexOf(diaActual);
      const diasOrdenados = [...diasDeLaSemana.slice(indexDiaActual), ...diasDeLaSemana.slice(0, indexDiaActual)];

      Object.keys(turnosPorDia).sort((a, b) => {
        return diasOrdenados.indexOf(a) - diasOrdenados.indexOf(b);
      }).forEach(dia => {
        const diaDiv = document.createElement('div');
        diaDiv.className = 'swiper-slide dia';

        // Calcular la fecha para este día de la semana
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + (diasDeLaSemana.indexOf(dia) - hoy.getDay() + 7) % 7);

        // Formatear la fecha para que solo muestre el día y la fecha
        const diaFormateado = `${dia} ${fecha.getDate()}`;

        const titulo = document.createElement('h2');
        titulo.textContent = diaFormateado;
        diaDiv.appendChild(titulo);

        const tabla = document.createElement('table');

        turnosPorDia[dia].forEach(turno => {
          const fila = document.createElement('tr');

          const celdaHora = document.createElement('td');
          celdaHora.textContent = turno.hora;
          fila.appendChild(celdaHora);

          const celdaBotones = document.createElement('td');

          const statusButton = document.createElement('button');
          statusButton.className = turno.estado;
          statusButton.textContent = turno.estado.charAt(0).toUpperCase() + turno.estado.slice(1);
          statusButton.setAttribute("data-status", turno.estado); // Añadir el estado actual como un atributo data
          statusButton.setAttribute("data-id", turno.id); // Añadir el id del turno como un atributo data

          celdaBotones.appendChild(statusButton);
          statusButton.addEventListener("click", function () {
            // Llamar a la función toggleStatus

            const currentStatus = this.getAttribute("data-status");

            toggleStatus(this);
          });

          const clientButton = document.createElement('button');
          clientButton.textContent = 'Clientes';
          clientButton.classList.add('client-button');

          clientButton.addEventListener("click", function () {
            const turnoId = statusButton.getAttribute("data-id");
            console.log("ID del turno:", turnoId);

            // Obtener la información del cliente desde el backend
            fetch(`https://themonkeybarber.com.ar/api/clientes/${turnoId}`)
              .then(response => {
                console.log(response.headers.get('Content-Type'));
                if (response.status === 200 && response.headers.get('Content-Type').includes('application/json')) {
                  return response.text().then(text => text ? JSON.parse(text) : {});
                } else {
                  throw new Error('Respuesta no válida del servidor');
                }
              })
              .then(cliente => {
                console.log("Cliente devuelto del servidor:", cliente);

                if (cliente && (cliente.nombre || cliente.telefono || cliente.email)) {

                  // Si hay un cliente asociado, mostrar la información en un alerta
                  Swal.fire({
                    title: 'Información del Cliente',
                    html: `Cliente: ${cliente.nombre}, Teléfono: ${cliente.telefono}, Email: ${cliente.email} <br> <button id="eliminar-cliente">Eliminar</button>`,
                    focusConfirm: false,
                    preConfirm: () => {
                      // Aquí puedes manejar otras acciones si es necesario
                    },
                    didOpen: () => {
                      const deleteButton = document.getElementById('eliminar-cliente');
                      if (deleteButton) {
                        deleteButton.addEventListener('click', () => {
                          // Eliminar el cliente
                          fetch(`https://themonkeybarber.com.ar/api/clientes/${turnoId}`, {
                            method: 'DELETE',
                          })
                            .then(response => response.json())
                            .then(data => {
                              console.log('Cliente eliminado:', data);
                              Swal.close();
                            })
                            .catch((error) => {
                              console.error('Error:', error);
                            });
                        });
                      }
                    }
                  });


                } else {
                  // Si no hay un cliente asociado, mostrar el modal para ingresar la información
                  Swal.fire({
                    title: 'Ingrese la información del cliente',
                    html:
                      '<input id="swal-input1" class="swal2-input" placeholder="Nombre">' +
                      '<input id="swal-input2" class="swal2-input" placeholder="Teléfono">' +
                      '<input id="swal-input3" class="swal2-input" placeholder="Email">',
                    focusConfirm: false,
                    preConfirm: () => {
                      const nombre = document.getElementById('swal-input1').value;
                      const telefono = document.getElementById('swal-input2').value;
                      const email = document.getElementById('swal-input3').value;
                      fetch(`https://themonkeybarber.com.ar/api/clientes`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ nombre, telefono, email, turnoId }),
                      })
                        .then(response => response.json())
                        .then(data => {
                          console.log('Cliente insertado:', data);
                        })
                        .catch((error) => {
                          console.error('Error:', error);
                        });
                    }
                  });
                }
              })
              .catch(error => {
                console.error('Error:', error);
              });
          });

          celdaBotones.appendChild(clientButton);


          const reserveButton = document.createElement('button');
          reserveButton.textContent = 'Reservar';
          

        

          // Asignar la URL al evento 'click' del botón
   // Asignar la URL al evento 'click' del botón
   var cbu = "000003100035584071991";
   var aliasCBU = "ale-monkeys";
   var phoneNumber = "+5492995328099";
reserveButton.addEventListener("click", function () {
  // Capturar la fecha y la hora del turno actual
  let fecha = diaFormateado;
  // Asegúrate de que esto coincide con cómo obtienes la fecha desde el backend
  let hora = turno.hora;  // Asegúrate de que esto coincide con cómo obtienes la hora desde el backend

  // Construir el mensaje
  let mensaje = `Hola! Quiero reservar un turno para el día ${fecha} a las ${hora}. Te comparto el coprobante de pago de la seña `;

  // Codificar el mensaje
  let mensajeCodificado = encodeURIComponent(mensaje);

  // Construir la URL completa
  let urlWhatsApp = `https://api.whatsapp.com/send?phone=2996724372&text=${mensajeCodificado}`;
  // Muestra el SweetAlert
  Swal.fire({
    title: 'RESERVA DE TURNO',
    html:`
    <p>👉Para reservar realizá una seña de $400 <br> 💈 Si no puedes venir y avisas con tiempo serán reintegrados, o quedarán a favor en tu próximo corte 💈 <br> Gracias!</p>
    <p><strong>CBU:</strong> ${cbu}</p>
    <p><strong>Alias:</strong> ${aliasCBU}</p>
    <p><strong>Teléfono:</strong> ${phoneNumber}</p>
    <div id="acciones" style="display: flex; flex-direction: column;">
      <a href="javascript:void(0);" id="copyCBU" class="link-accion">COPIAR CBU</a>
      <a href="javascript:void(0);" id="copyAlias" class="link-accion">COPIAR ALIAS</a>
      <a href="${urlWhatsApp}" target="_blank" class="link-accion">COMPARTIR COMPROBANTE</a>
    </div>
  `,
    icon: 'info',
    showCancelButton: true,
    showConfirmButton: false,
    cancelButtonText: 'Cerrar',
  });
});

// Copiar CBU o Alias al portapapeles
document.addEventListener('click', function(event) {
  if (event.target.id === 'copyCBU' || event.target.id === 'copyAlias') {
    const textToCopy = event.target.id === 'copyCBU' ? cbu : aliasCBU;
    navigator.clipboard.writeText(textToCopy).then(() => {
      event.target.textContent = `${event.target.id === 'copyCBU' ? 'CBU' : 'Alias'} Copiado`; // Cambiar texto del enlace
      setTimeout(() => {
        event.target.textContent = `Copiar ${event.target.id === 'copyCBU' ? 'CBU' : 'Alias'}`; // Restablecer texto después de 2 segundos
      }, 2000);
    }).catch(err => {
      Swal.showValidationMessage(`Error: ${err}`);
    });
  }
});
        
       

          // Aquí podrías añadir un evento para realizar la reserva
          celdaBotones.appendChild(reserveButton);

          fila.appendChild(celdaBotones);
          tabla.appendChild(fila);
        });

        diaDiv.appendChild(tabla);
        swiperWrapper.appendChild(diaDiv);
      });



    })
    .catch(error => console.error('Error:', error));
});
// updateUI();



// Escuchar el evento de clic en el botón de inicio de sesión
document.getElementById("login-button").addEventListener("click", function () {
  const password = document.getElementById("password").value;
  authenticate(password);
});

// Actualizar la UI cuando la página se carga
// document.addEventListener("DOMContentLoaded", function() {
//   updateUI();
// });



