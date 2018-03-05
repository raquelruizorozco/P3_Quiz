/**
 * Created by raquel.ruiz.orozco on 28/02/18.
 */
const { log, biglog, errorlog, colorize} = require("./out");
const model = require('./model');

exports.helpCmd = rl => {
    log("Comandos:");
    log("h|help - Muestra esta ayuda.");
    log("show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
    log("add - Añadir un nuevo quiz interactivamente.");
    log("delete <id> - Borrar el quiz indicado.");
    log("edit <id> - Editar el quiz indicado.");
    log("test <id> - Probar el quiz indicado.");
    log("p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log("credits - Créditos.");
    log("q|quit - Salir del programa.");
    rl.prompt();
};

exports.listCmd = rl => {
    model.getAll().forEach((quiz, id) => {
        log(`[${colorize(id, 'magenta')}]: ${quiz.question}`);

    });
    rl.prompt();
};

exports.showCmd = (rl, id) => {
    if (typeof id === "undefined"){
        errorlog("Falta el parámetro id.");
    } else {
        try{
            const quiz = model.getByIndex(id);
            log(` [${colorize(id,'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        } catch(error){
            errorlog(error.message);
        }
    }
    rl.prompt();
};

exports.addCmd = rl => {
    rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

        rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {
            model.add(question, answer);
            log(`${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
    rl.prompt();
    });
    });

};

exports.deleteCmd = (rl, id) => {
    if (typeof id === "undefined"){
        errorlog("Falta el parámetro id.");
    } else {
        try{
            model.deleteByIndex(id);
        } catch(error){
            errorlog(error.message);
        }
    }
    rl.prompt();
};

exports.editCmd = (rl, id) => {
    if (typeof id === "undefined"){
        errorlog("Falta el parámetro id.");
        rl.prompt();
    } else {
        try{
        const quiz = model.getByIndex(id);
    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0 );

    rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

        process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
        rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {

            model.update(id, question, answer);
    log(` Se ha cambiado el quiz' ${colorize(id, 'magenta')} por:  ${question} ${colorize('=>', 'magenta')} ${answer} `);
    rl.prompt();
    });
    });
        }catch(error){
                errorlog(error.message);
             rl.prompt();
}
}
};

exports.testCmd = (rl, id) => {
    if (typeof id === "undefined"){
        errorlog("Falta el parámetro id.");
        rl.prompt();
    } else {
        try{
            const quiz = model.getByIndex(id);

            rl.question(colorize(`Pregunta: ${quiz.question} `, 'red'), respuesta => {
                if( respuesta.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
                log("CORRECTO",'green');
            }else{
                log("INCORRECTO",'red');
            }
            rl.prompt();
        });
        }catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }



};

exports.playCmd = rl =>
{
    let score = 0;
    let toBeResolved = [];
    //Cargamos todas las preguntas y respuestas que hay en quizzes
    model.getAll().forEach((quiz, id) => {
        toBeResolved[id] = quiz;
})
    ;

    let id = Math.floor(Math.random() * toBeResolved.length);
    let quiz = toBeResolved[id];


    const playOne = () =>
    {

        if (toBeResolved.length === 0) {
            errorlog("No hay más preguntas. Fin del juego");
            rl.prompt();
        } else {
            try {



                rl.question(colorize(`Pregunta: ${quiz.question} `, 'red'), respuesta => {
                    if(respuesta.toLowerCase().trim() === quiz.answer.toLowerCase().trim()
            )
                {
                    log("CORRECTO", 'green');
                    score++;
                    log('Tu puntuación es ');

                    for (let i=0; i< toBeResolved.length; i++){
                        if(toBeResolved[i] == id){
                            toBeResolved.splice(id,1);
                        }
                    }
                    playOne();
                }
            else
                {
                    log("INCORRECTO", 'red');
                    log('Tu puntuación es ');
                    rl.prompt();
                }
            })
                ;

            } catch (error) {
                errorlog(error.message);
                rl.prompt();
            }
        }
        ;

    }
    ;
    playOne();
};
exports.creditsCmd = rl => {
    log('Autores de la práctica.');
    log('Raquel Ruiz Orozco','green');
    log('Nombre 2','green');
    rl.prompt();
};

exports.quitCmd = rl => {
    rl.close();
};