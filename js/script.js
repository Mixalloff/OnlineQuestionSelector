// Массив слов на момент последней проверки
var wordsHash = [];

// структура вопросов
var testQuestions = [
    {
        id: "1",
        text: "Ошибка при выгрузке",
        answer: "Answer 1",
        keywords: [ "ОШИБКА", "ВЫГРУЗКА" ],
        priority: 1, // (?) приоритет, основанный на кликах по вопросу и тп...
        match: 0 // количество соответствующих ключевых слов
    },
    {
        id: "2",
        text: "Возникла ошибка авторизации",
        answer: "Ответ 2",
        //keywords: [ "ОШИБКА", "ОШИБКИ", "ОШИБКУ", "АВТОРИЗАЦИЯ", "АВТОРИЗАЦИИ", "АВТОРИЗАЦИЮ", "АВТОРИЗОВАТЬ" ],
        keywords: [ "ОШИБКА", "АВТОРИЗАЦИЯ" ],
        priority: 0,
        match: 0 
    }
];

// Функция сортировки вопросов
function sortQuestions(questions) {
    return questions.sort(function(a, b) {
        // Сортировка по совпадениям
        return b.match - a.match;
    });
}

// Функция отображения списка подходящих вопросов
// questions - массив вопросов для отображения
function showRelatedQuestion(questions) {
    sortQuestions(questions);
    $(".questions_result_block").html("");
    questions.forEach(function(element) {
       // $(".questions_result_block").
       var elem = constructQuestionBlock(element);
       $(".questions_result_block").append(elem);
       //console.log(elem);
    }, this);
}

// Конструирование блока вопроса
// questionItem - объект "Вопрос""
function constructQuestionBlock(questionItem) {
    return block = $(
            '<div id="' + questionItem.id + '"class="question_item">'
                + questionItem.text +
            '</div><br>'
        );
}

// Функция-обработчик ввода
function enterHandler(event) {
    //if(event.key=="Backspace"){alert("Нажата клавиша BackSpace!")};
    
    // Берем введенный текст
    var userQuestion = $("#user_question").val().toUpperCase();
    // Разбор на слова
    var words = userQuestion.match(/([a-zA-Zа-яА-Я]+)/gi);
    
    var newWordsArray = []; // массив новых слов
    var deletedWordsArray = []; // массив новых слов
    // находим новые слова
    for(var i = 0; i < words.length; i++) {
        if (wordsHash.indexOf(words[i]) == -1) {
            newWordsArray.push(words[i]); 
        }
    }
    // находим удаленные слова
    for(var i = 0; i < wordsHash.length; i++) {
        if (words.indexOf(wordsHash[i]) == -1) {
            deletedWordsArray.push(wordsHash[i]); 
        }
    }
    wordsHash = words;
    checkKeywords(newWordsArray, deletedWordsArray);
}

// Функция выделения ключевых слов среди добавленных
// addedWords - массив новых слов из введенной строки 
// deletedWords - массив удаленных слов с момента предыдущей проверки
function checkKeywords(addedWords, deletedWords) {
    if (addedWords.length == 0 && deletedWords.length == 0) {
         return false;
    }
    var resultQuestions = [];
    testQuestions.forEach(function(element) {
        //element.match = 0;
        // Проверка каждого нового слова
        addedWords.forEach(function(newWord) {
            // Добавляем совпадения, если слово достаточно близко к ключевому
            for(var i = 0; i < element.keywords.length; i++) {
                var distance = metrika(newWord, element.keywords[i]);
                if(distance < newWord.length/2) {
                    element.match++;
                    return;
                }
            }
        });
        deletedWords.forEach(function(deletedWord) {
            // Добавляем совпадения, если слово достаточно близко к ключевому
            for(var i = 0; i < element.keywords.length; i++) {
                var distance = metrika(deletedWord, element.keywords[i]);
                if(distance < deletedWord.length/2) {
                    element.match--;
                    return;
                }
            }
        });
        
        // Если есть совпадения
        if(element.match > 0) {
            // Добавляем в массив результатов
            resultQuestions.push(element);
        }
    });
    
    showRelatedQuestion(resultQuestions);
}

// Возвращает расстояние между словами по Левенштейну(метрику)
function metrika(word1, word2) {
    var matrix = [];
    // начальное заполнение матрицы
    for(var i = 0; i <= Math.max(word1.length, word2.length); i++) {
         matrix[i] = [];
         matrix[i][0] = i;
         matrix[0][i] = i;
    }
    // расчет матрицы
    for(var i = 1; i <= word1.length; i++) {
        for(var j = 1; j <= word2.length; j++) {
           if (word2[i-1] == word1[j-1]) {
                matrix[i][j] = matrix[i-1][j-1];
           }
           else {
               matrix[i][j] = Math.min(matrix[i][j-1],matrix[i-1][j],matrix[i-1][j-1]) + 1;
           }
        }
    }
    return matrix[word1.length][word2.length];
    //return matrix;
}