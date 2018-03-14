/**
 * Created by raquel.ruiz.orozco on 28/02/18.
 */
const Sequelize = require('sequelize');

const { log, biglog, errorlog, colorize} = require("./out");
const {models} = require('./model');

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
    /*
    model.getAll().forEach((quiz, id) => {
        log(`[${colorize(id, 'magenta')}]: ${quiz.question}`);
    });
    rl.prompt();
    */

    models.quiz.findAll() //Devuelve un array con los quizzes existentes
        .each(quiz => { // Coge todos los quiz que hay dentro del array que devuelve findAll
        log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
})
.catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();
})

};
const validateId = id => {

    return new Sequelize.Promise((resolve, reject) => {// Sequilize.Promise - promesas de sequielize
        if (typeof id === "undefined") {
        reject(new Error(`Falta el parametro <id>.`));
    } else {
        id = parseInt(id); //coger la parte entera y descartar lo demás
        if (Number.isNaN(id)) {
            reject(new Error(`El valor del parámetro <id> no es un número`))
        } else {
            resolve(id); // Se resuelve la promesa con el id
        }
    }
});
};

exports.showCmd = (rl, id) => {

    validateId(id)
        .then(id => models.quiz.findById(id)) //Del modelo de datos voy al modelo quiz y busco un quiz por id
.then(quiz => {
        if (!quiz) {
        throw new Error(`No existe un quiz asociado al id=${id}.`);
    }
    log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
})
.catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();
});
};

const makeQuestion = (rl, text) => {

    return new Sequelize.Promise((resolve, reject) => {
        rl.question(colorize(text, 'red'), answer => {
        resolve(answer.trim());
});
});
};

exports.addCmd = rl => {

    makeQuestion(rl, 'Introduzca una pregunta: ') //Hasta que no introduzca una pregunta no finaliza
        .then(q => {
        return makeQuestion(rl, 'Introduce la respuesta: ')
            .then(a => {
            return {question: q, answer: a};
});
})
.then(quiz => {
        return models.quiz.create(quiz);
})
.then((quiz) => {
        log(` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
})
.catch(Sequelize.ValidationError, error => { //Si hay errores de validación
        errorlog('El quiz es erroneo: ');
    error.errors.forEach(({message}) => errorlog(message));
})
.catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();
});
};

exports.deleteCmd = (rl, id) => {

    validateId(id)
        .then(id => models.quiz.destroy({where: {id}})) //Condición: el elemento que quiero destruir es el que tiene como id el valor id
.catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();
});
};

exports.editCmd = (rl,id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
.then(quiz => {
        if(!quiz){
        throw new Error(`No existe el parametro asociado ${id}.`);
    }

    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
    return makeQuestion(rl, ' Introduzca la pregunta: ')
        .then(q => {
        process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
    return makeQuestion(rl, 'Introduzca la respuesta ')
        .then(a => {
        quiz.question =q;
    quiz.answer =a;
    return quiz;
});
});
})
.then(quiz => {
        return quiz.save();
})
.then(quiz => {
        log (`Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`)
})
.catch(Sequelize.ValidationError, error => {
        errorlog('El quiz es erroneo:');
    error.errors.forEach(({message}) => errorlog(message));
})
.catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();
});
}

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

exports.playCmd = rl => {
    let score = 0;
    let toBePlayed = [];

    const playOne = () => {

        return Promise.resolve()
            .then (() => {
            if ( toBePlayed.length <= 0) {
            console.log("No hay nada mas que preguntar. Fin del juego");

            return;
        }
        let pos = Math.floor(Math.random() * toBePlayed.length);
        let quiz = toBePlayed[pos];
        toBePlayed.splice(pos, 1);

        return makeQuestion(rl, quiz.question)
            .then(answer => {
            if(answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
            score++;
            log(`Respuesta correcta`,'green');
            return playOne();
        } else {
            log(`Respuesta incorrecta`,'red');
            log('Fin del juego. ');

        }
    })
    })
    }

    models.quiz.findAll({raw: true})
        .then(quizzes => {
        toBePlayed = quizzes;
})
.then(() => {
        return playOne();
})
.catch(e => {
        console.log("error: " + e);
})
.then(() => {
        console.log(`Tu puntuación es: ${score}`);
    rl.prompt();
})
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