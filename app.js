const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const {readFileSync} = require("node:fs");


//enviar foto de bienvenida

const flujoDatosPedido = addKeyword(["Si",'si'], { sensitive: true })
    .addAnswer(
        "Nombre Completo del Paciente",
        { capture: true },
        async (ctx, { state }) => {
            await state.update({ name: ctx.body });
        }
    )
    .addAnswer(
        "Escribe la dirección de domicilio del paciente",
        { capture: true },
        async (ctx, { state }) => {
            await state.update({ direccion: ctx.body });
        }
    )
    .addAnswer(
        "Número de teléfono del paciente",
        { capture: true },
        async (ctx, { state }) => {
            const telCapturado = ctx.body;
            const regex = /^[0-9]+$/;

            if (regex.test(telCapturado)){
                console.log('Telefono capturadao:', telCapturado);
                await state.update({ tel: telCapturado });
            }else{
                return fallBack()
            }
        }
    )
    .addAnswer(
        "Correo electrónico del paciente",
        { capture: true },
        async (ctx, { state }) => {
            const correoCapturado = ctx.body;
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (regex.test(correoCapturado)){
                console.log('Telefono capturadao:', correoCapturado);
                await state.update({ correo: correoCapturado });
            }else{
                return fallBack()
            }
        }
    )
    .addAnswer(
        "Describe el motivo de la cita",
        { capture: true },
        async (ctx, { state }) => {
            await state.update({ motivo: ctx.body });
        }
    )
    .addAnswer(
        "Escribe fecha y hora de la cita que deseas agendar",
        { capture: true },
        async (ctx, { state }) => {
            await state.update({ fecha: ctx.body });
        }
    )
    .addAnswer('Resumen de tu cita:', null, async (_, { flowDynamic, state }) => {
        const myState = state.getMyState()
        await flowDynamic(`📖Nombre: ${myState.name} \n➡Dirección: ${myState.direccion} \n 📲Teléfono: ${myState.tel} \n 📧Correo Electrónico: ${myState.correo} \n 👀Motivo de la cita: ${myState.motivo} \n ⏰Fecha de la cita: ${myState.fecha}`)
    }).addAnswer(['¿Confirmas tus datos? Escribe *Si* o *No* dependiendo la opción que deseas escoger', 'Si ✅','No ❌'],{capture:true},async(ctx, {state, flowDynamic, gotoFlow}) => {

        console.log('...')


        if(ctx.body ==='No' || ctx.body ==='no'){
            await state.clear(['name', 'direccion', 'tel', 'correo', 'motivo','fecha']);
            return gotoFlow(flujoDatosPedido)
        }else if (ctx.body ==='Si'|| ctx.body ==='si'){
            await flowDynamic("Datos confirmados, en breve un asesor te confirmará la fecha de la cita")
            return  gotoFlow(atentoDomicilio)
        }

    })

const noCita = addKeyword(['No','no'],{})
    .addAnswer('Lamentamos que no quieras agendar una cita.\n ¡Si cambias de opinión puedes escribirnos cuando necesites! 🤗')



const informacion  = addKeyword(["Si",'si'], { sensitive: true })

    .addAnswer(' La Clínica Médica "Vida Plena" se enorgullece en ofrecer un enfoque integral y' +
        'personalizado para la salud y el bienestar de nuestros pacientes. Nos' +
        'especializamos en medicina alternativa, abrazando la diversidad de enfoques' +
        'terapéuticos que complementan y fortalecen la medicina tradicional. Creemos en el' +
        'poder de la mente, el cuerpo y el espíritu para sanar, y trabajamos en colaboración' +
        'con nuestros pacientes para alcanzar un equilibrio óptimo y una vida plena.', {})
    .addAnswer('⚕️ 1. Consulta Médica Integral: Nuestro equipo de profesionales altamente' +
        'capacitados ofrece consultas médicas holísticas que abordan tanto los' +
        'síntomas físicos como los aspectos emocionales y mentales de la salud.' +
        'Trabajamos en conjunto con nuestros pacientes para desarrollar planes de' +
        'tratamiento personalizados que promuevan la curación integral.\n\n' +
        '🪡 2. Acupuntura: Experimente los beneficios terapéuticos milenarios de la' +
        'acupuntura, una práctica que estimula puntos específicos en el cuerpo para' +
        'aliviar el dolor, reducir el estrés y restaurar el equilibrio energético.', {})

    .addAnswer(['¿Deseas agendar una cita con nosotros?', 'Si ✅','No ❌'],{capture:true}, async(ctx, {flowDynamic, gotoFlow}) =>{
        const opcion = ctx.body
        console.log(opcion)
        if (opcion === 'Si' || opcion === 'SI'){
            return gotoFlow(flujoDatosPedido);
        }
        else {
            return gotoFlow(noCita);
        }
    })

const atentoDomicilio = addKeyword('salida').addAnswer('¡Muchas gracias! Ten lindo día, recuerda estar atento al contacto del asesor',{capture:true},async(ctx, {state, flowDynamic, gotoFlow}) => {})



const flowMenu = addKeyword(['Hola','Buenos días', 'Buenas', '¿Cómo estás?', 'Saludos', '¡Hola, bot!',
    'Hola, ¿estás ahí?', 'Iniciar conversación', 'Empezar chat', '¿Qué tal?', 'Hey', '¿Hola, qué haces?', 'Buen día',
    'Buenas tardes', 'Buenas noches', 'Hello', 'Hi', '¿Hay alguien?', '¿Puedo preguntar algo?',
    'Hola, ¿me puedes ayudar?', 'buenas', 'hola']).addAnswer('🙌 Hola!')

    .addAnswer('Bienvendi@ al Hospital MedAlternativa 🏥', {
        media: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgymkm-xDH2pGa5C4t9YI8dLFiXFc6zaxJYXcv35fMLWbleJukvxcZqHsVKRkxzpAXTLJ3koQwBUksqbXsoG8VKZFxg1F1vOa4QeKuOJs_3LdL46CaESqzNVe1CRS6kfm1mRqBoF0J5S6HU2n8jspNEWABAGi44gvzsu3pxSsUgkvsNWvLvf4W7rvJ5mR8/w1684-h1069-p-k-no-nu/Dewi%20Colmenares.png',
    })

    .addAnswer(
    [
        'Escribe un mensaje con el número de la opción que desees:',
        '👉 *A*  Agendar Cita',
        '👉 *B*  Quiero saber más información',


    ], {capture:true}, async(ctx, {flowDynamic, gotoFlow}) =>{
        const opcion = ctx.body
        console.log(opcion)
        if (opcion === 'A' || opcion === 'a' || opcion === 'Agendar' || opcion === 'agendar' || opcion === 'Agendar cita' || opcion === 'agendar cita'){
            return gotoFlow(flujoDatosPedido);
        }
        else if(opcion === 'B' || opcion === 'b' || opcion === 'Información' || opcion === 'info'){
                return gotoFlow(informacion);
        }
    }
)




const main = async () => {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow([flujoDatosPedido,atentoDomicilio,informacion,noCita,flowMenu]);
    const adapterProvider = createProvider(BaileysProvider);

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });


    QRPortalWeb();
};

main();


