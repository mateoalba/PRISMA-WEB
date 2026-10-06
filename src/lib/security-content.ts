// Contenido curado para la dimensión "Seguridad y confianza digital" —
// texto tomado verbatim del prototipo (componentes-seguridad-digital.html).
// Los mensajes son ficticios, con fines educativos (simulacro de estafas),
// tal como aclaraba el propio prototipo.

export type CasoSimulador = {
  tipo: string;
  de: string;
  nombre: string;
  hora: string;
  // Las pistas van marcadas como [[texto|número]] dentro del mensaje.
  texto: string;
  opciones: string[];
  correcta: number;
  pistas: string[];
  explicacion: string;
};

export const CASOS: CasoSimulador[] = [
  {
    tipo: "SMS",
    de: "+34 600 982 114",
    nombre: "Desconocido",
    hora: "Hoy 10:42",
    texto:
      "[[CORREOS URGENTE|1]]: Su paquete ES-89214 no pudo ser entregado por falta de 1,85€ de aduana. Ingrese [[INMEDIATAMENTE|2]] a: [[http://correos-entrega-urgente.online/pagar|3]]",
    opciones: [
      "Pulsar el enlace rápidamente para no perder el paquete.",
      "No hacer clic y verificar directamente en la página oficial de Correos.",
      "Responder pidiendo más información.",
    ],
    correcta: 1,
    pistas: [
      "Se hace pasar por una empresa conocida desde un número desconocido.",
      "Te presiona con urgencia para que actúes sin pensar.",
      'El enlace no es la página oficial: tiene palabras raras y termina en ".online".',
    ],
    explicacion:
      "Las empresas de envíos no piden pagos por mensajes con enlaces. Si esperas un paquete, entra tú mismo a la página oficial.",
  },
  {
    tipo: "WhatsApp",
    de: "+593 98 000 0000",
    nombre: "Número nuevo",
    hora: "Ayer 21:15",
    texto:
      "Hola [[mamá, se me dañó el celular y este es mi número nuevo|1]]. Necesito que me ayudes con un pago [[hoy mismo, es urgente|2]]. [[Transfiéreme $350 a esta cuenta|3]] y mañana te devuelvo.",
    opciones: [
      "Transferir el dinero, porque es mi hijo/a.",
      "Llamar al número de siempre de mi hijo/a para confirmar.",
      "Guardar el número nuevo y seguir la conversación.",
    ],
    correcta: 1,
    pistas: [
      'Dice ser un familiar con "número nuevo", un truco muy común.',
      "Otra vez la urgencia: no te deja tiempo para pensar.",
      "Pide dinero a una cuenta que no conoces.",
    ],
    explicacion:
      "Antes de enviar dinero, llama al número que ya conoces de tu familiar o hazle una pregunta que solo él o ella sabría responder.",
  },
  {
    tipo: "Correo",
    de: "seguridad@banco-verificacion.net",
    nombre: "Tu banco",
    hora: "Hoy 08:03",
    texto:
      "Estimado cliente: detectamos [[actividad sospechosa en su cuenta|1]]. Para evitar el bloqueo, [[confirme su clave y el código que le llegará por SMS|2]] en el siguiente enlace. [[Tiene 24 horas|3]].",
    opciones: [
      "Ingresar mi clave para que no bloqueen la cuenta.",
      "Reenviar el correo a un familiar para que lo revise.",
      "No ingresar datos y llamar al número que aparece en mi tarjeta.",
    ],
    correcta: 2,
    pistas: [
      "Te asusta con un problema en tu cuenta.",
      "Tu banco nunca te pedirá tu clave ni códigos por correo o teléfono.",
      "Pone un plazo corto para presionarte.",
    ],
    explicacion: "Ningún banco pide claves ni códigos. Si tienes dudas, llama al número oficial que está al reverso de tu tarjeta.",
  },
];

export type SenalAlerta = {
  titulo: string;
  sub: string;
  ejemplo: string;
  que: string;
};

export const SENALES: SenalAlerta[] = [
  {
    titulo: "Urgencia o amenaza",
    sub: '"Hazlo ahora o perderás tu cuenta".',
    ejemplo: "Su cuenta será bloqueada en 2 horas si no confirma sus datos.",
    que: "Respira. Nadie serio te obliga a decidir en minutos. Cuelga o cierra el mensaje y verifica por tu cuenta.",
  },
  {
    titulo: "Te piden claves o códigos",
    sub: "Contraseñas, PIN o el código que llega por SMS.",
    ejemplo: "Dígame el código de 6 dígitos que le acaba de llegar para validar su identidad.",
    que: "Nunca compartas códigos ni claves, aunque digan ser del banco o de la policía.",
  },
  {
    titulo: "Premios que no pediste",
    sub: "Sorteos, herencias o regalos inesperados.",
    ejemplo: "¡Felicidades! Ganó un televisor. Solo pague $15 de envío para recibirlo.",
    que: 'Si no participaste en nada, no ganaste nada. No pagues "gastos" para recibir un premio.',
  },
  {
    titulo: "Enlaces extraños",
    sub: "Direcciones con letras raras o acortadas.",
    ejemplo: "Actualice sus datos aquí: bit.ly/b4nc0-seguro",
    que: "No toques enlaces de mensajes inesperados. Escribe tú mismo la dirección oficial en el navegador.",
  },
  {
    titulo: "Familiar con número nuevo",
    sub: "Te pide dinero desde otro número.",
    ejemplo: "Hola abuela, soy yo, cambié de número. ¿Me puedes prestar dinero? No le digas a nadie.",
    que: "Llama al número de siempre de tu familiar antes de enviar cualquier cosa.",
  },
];
