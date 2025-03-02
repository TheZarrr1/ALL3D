<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = $_POST['nombre'];
    $correo = $_POST['correo'];
    $mensaje = $_POST['mensaje'];

    $to = "cristianz2912@yahoo.com.ar";  // Cambia este correo por el tuyo
    $subject = "Nuevo Mensaje de $nombre";
    $body = "Correo: $correo\nMensaje:\n$mensaje";
    $headers = "From: no-reply@tupagina.com";

    // Envía el correo
    if (mail($to, $subject, $body, $headers)) {
        echo "Mensaje enviado correctamente.";
    } else {
        echo "Error al enviar el mensaje.";
    }
}
?>