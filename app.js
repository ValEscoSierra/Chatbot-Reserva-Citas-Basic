const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')


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
            await flowDynamic("Cita asignada, si sucede cualquier inconveniente te escribira un asesor")
            return  gotoFlow(atentoDomicilio)
        }

    })








const atentoDomicilio = addKeyword('salida').addAnswer('¡Muchas gracias! Ten lindo día, recuerda estar atento a tu cita',{capture:true},async(ctx, {state, flowDynamic, gotoFlow}) => {})




const flowMenu = addKeyword(['Hola','Buenos días', 'Buenas', '¿Cómo estás?', 'Saludos', '¡Hola, bot!',
    'Hola, ¿estás ahí?', 'Iniciar conversación', 'Empezar chat', '¿Qué tal?', 'Hey', '¿Hola, qué haces?', 'Buen día',
    'Buenas tardes', 'Buenas noches', 'Hello', 'Hi', '¿Hay alguien?', '¿Puedo preguntar algo?',
    'Hola, ¿me puedes ayudar?', 'buenas', 'hola']).addAnswer('🙌 Hola bienvenido al Hospital MedAlternativa 🏥')

    .addAnswer('Este mensaje envia una imagen', {
        media: 'D:\\Sarita\\clipArt.png',
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

        }
    }
)




const main = async () => {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow([flujoDatosPedido,atentoDomicilio,flowMenu]);
    const adapterProvider = createProvider(BaileysProvider);

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });


    QRPortalWeb();
};

main();


