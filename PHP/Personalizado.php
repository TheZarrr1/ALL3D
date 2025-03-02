<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Asegúrate de que PHPMailer esté en el path correcto
require 'vendor/autoload.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = $_POST['nombre'];
    $detalles = $_POST['detalles'];
    $archivos = $_FILES['archivos'];

    // Configuración de PHPMailer para usar Yahoo SMTP
    $mail = new PHPMailer(true);

    try {
        // Configuración del servidor SMTP de Yahoo
        $mail->isSMTP();
        $mail->Host = 'smtp.mail.yahoo.com';  // Servidor SMTP de Yahoo
        $mail->SMTPAuth = true;
        $mail->Username = 'cristianz2912@yahoo.com.ar';  // Tu correo de Yahoo
        $mail->Password = 'TU_PASSWORD_AQUI';  // Tu contraseña de Yahoo (puede que necesites generar una contraseña de aplicación)
        $mail->SMTPSecure = 'ssl';  // Utiliza SSL
        $mail->Port = 465;  // Puerto SMTP de Yahoo

        // Configuración del remitente y destinatario
        $mail->setFrom('cristianz2912@yahoo.com.ar', 'ALL 3D');
        $mail->addAddress('cristianz2912@yahoo.com.ar');  // Enviar a tu propio correo

        // Asunto y cuerpo del correo
        $mail->Subject = "Nuevo Pedido Personalizado de $nombre";
        $mail->Body    = "Detalles del Pedido:\n$detalles";

        // Adjuntar archivos si existen
        if (isset($archivos['name'][0]) && !empty($archivos['name'][0])) {
            foreach ($archivos['tmp_name'] as $key => $tmp_name) {
                $nombre_archivo = basename($archivos['name'][$key]);
                $mail->addAttachment($tmp_name, $nombre_archivo);
            }
        }

        // Enviar el correo
        $mail->send();
        echo "Pedido enviado correctamente.";
    } catch (Exception $e) {
        echo "Error al enviar el correo: {$mail->ErrorInfo}";
    }
}
?>