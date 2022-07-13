const socket = io(); 

const agregarProducto = () => {
  const title = document.getElementById("title").value; 
  const price = document.getElementById("price").value; 
  const thumbnail = document.getElementById("thumbnail").value; 
  const producto = { title, price, thumbnail };                   
  socket.emit('nuevo_prod', producto);                
  document.getElementById("title").value="";
  document.getElementById("price").value="";
  document.getElementById("thumbnail").value="";
  return false;                                       
}

const enviarMensaje = () => {
  const author = document.getElementById("author").value;
  const text = document.getElementById("text").value; 
  const fecha = new Date();
  const objFecha = {
      dia: fecha.getDate(),
      mes: fecha.getMonth() + 1,
      anio: fecha.getFullYear(),
      hs: fecha.getHours(),
      min: fecha.getMinutes()
  }
const date = `[${objFecha.dia}/${objFecha.mes}/${objFecha.anio} ${objFecha.hs}:${objFecha.min}]`;  
const mensaje = { author, date , text};                   

  socket.emit('new_message', mensaje);                
  document.getElementById("author").value="";
  document.getElementById("text").value="";
  return false;                                       
}

const renderPlantilla = (producto, mensaje, cred) => {
  

  fetch('/templateBienvenido.hbs')
  .then((res) => res.text())
  .then((data) => {
  const template = Handlebars.compile(data);
  const html = template({cred: cred});
  document.getElementById('id_bienvenido').innerHTML = html;    
  })
  
  fetch('/templateTable.hbs')
  .then((res) => res.text())
  .then((data) => {
  const template = Handlebars.compile(data);
  const html = template({producto: producto, title: title, price: price, thumbnail: thumbnail});
  document.getElementById('id_del_div').innerHTML = html;    
  })

  fetch('/templateMensajes.hbs')
  .then((res) => res.text())
  .then((data) => {
  const templateChat = Handlebars.compile(data);
  const htmlChat = templateChat({ mensaje: mensaje});
  document.getElementById('id_del_div_chat').innerHTML = htmlChat;
  })

}

socket.on('new_event', (productos, mensaje, cred) => renderPlantilla(productos, mensaje, cred));