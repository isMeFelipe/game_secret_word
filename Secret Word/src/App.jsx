// CSS
import "./App.css";

// React
import { useCallback, useEffect, useState } from "react";

// data
import { wordsList } from "./data/words.js";

// Components
import StartScreen from "./components/StartScreen";
import Game from "./components/Game";
import GameOver from "./components/GameOver";

const stages = [
  { id: 1, name: "start" },
  { id: 2, name: "game" },
  { id: 3, name: "end" },
];

function App() {
  const guesses_amount = 3;
  const [gameStage, setGameStage] = useState(stages[0].name);
  const [words] = useState(wordsList);

  const [pickedWord, setPickedWord] = useState("");
  const [pickedCategory, setPickedCategory] = useState("");
  const [letters, setLetters] = useState([]);

  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongLetters, setWrongLetters] = useState([]);
  const [guesses, setGuesses] = useState(guesses_amount);
  const [score, setScore] = useState(0);

  const pickWordAndCategory = useCallback(() => {
    // Picking a random category
    const categories = Object.keys(words);
    const category =
      categories[Math.floor(Math.random() * Object.keys(categories).length)];

    // Picking a random word of the picked category
    const word =
      words[category][Math.floor(Math.random() * words[category].length)];

    return { word, category };
  }, [words]);

  // Starts the secret word game
  const startGame = useCallback(() => {
    clearLetterStates();
    const { word, category } = pickWordAndCategory();

    // Creating an array of letters
    let wordLetters = word.split("");
    wordLetters = wordLetters.map((letter) => letter.toUpperCase());

    // Filling in states
    setPickedWord(word);
    setPickedCategory(category);
    setLetters(wordLetters);

    setGameStage(stages[1].name);
  }, [pickWordAndCategory]);

  // Process the letter input
  const verifyLetter = (letter) => {
    const normalizedLetter = letter.toUpperCase();
    const letterMappings = {
      A: ["A", "Ã", "Á", "Â"],
      E: ["E", "É", "Ê"],
      I: ["I", "Í"],
      O: ["O", "Ó", "Õ", "Ô"],
      U: ["U", "Ú"],
      C: ["C", "Ç"],
    };

    const updateGuessedLetters = (value) => {
      setGuessedLetters((actualGuessedLetters) => [
        ...actualGuessedLetters,
        value,
      ]);
    };

    const updateWrongLetters = (value) => {
      setWrongLetters((actualWrongLetters) => [...actualWrongLetters, value]);
      setGuesses((actualGuesses) => actualGuesses - 1);
    };

    const checkAndAddLetters = (array) => {
      let exist = false;
      for (const value of array) {
        if (guessedLetters.includes(value) || wrongLetters.includes(value)) {
          exist = true;
          continue;
        }

        if (letters.includes(value)) {
          updateGuessedLetters(value);
          exist = true;
        }
      }
      return exist;
    };

    // Verifica se a letra é especial e lida com seus acentos
    if (letterMappings[normalizedLetter]) {
      const exist = checkAndAddLetters(letterMappings[normalizedLetter]);
      if (!exist) {
        updateWrongLetters(normalizedLetter);
      }
      return;
    }

    // Verifica se a letra já foi utilizada
    if (
      guessedLetters.includes(normalizedLetter) ||
      wrongLetters.includes(normalizedLetter)
    ) {
      return;
    }

    // Adiciona a letra correta ou remove uma tentativa
    if (letters.includes(normalizedLetter)) {
      updateGuessedLetters(normalizedLetter);
    } else {
      updateWrongLetters(normalizedLetter);
    }
  };

  const clearLetterStates = () => {
    setGuessedLetters([]);
    setWrongLetters([]);
  };

  // Monitoring

  // Check win codition
  useEffect(() => {
    const uniqueLetters = [
      ...new Set(letters.filter((letter) => letter !== " ")),
    ];
    if (guessedLetters.length == uniqueLetters.length) {
      setScore((actualScore) => (actualScore += 100));
      startGame();
    }
  }, [guessedLetters, letters, startGame]);

  // Check lose codition
  useEffect(() => {
    if (guesses <= 0) {
      clearLetterStates();
      setGameStage(stages[2].name);
    }
  }, [guesses]);

  // Restarts the game
  const retry = () => {
    setScore(0);
    setGuesses(guesses_amount);
    setGameStage(stages[0].name);
  };

  return (
    <>
      <div className="App">
        {gameStage === "start" && <StartScreen startGame={startGame} />}
        {gameStage === "game" && (
          <Game
            verifyLetter={verifyLetter}
            pickedCategory={pickedCategory}
            letters={letters}
            guessedLetters={guessedLetters}
            wrongLetters={wrongLetters}
            guesses={guesses}
            score={score}
            setGuessedLetters={setGuessedLetters}
          />
        )}
        {gameStage === "end" && <GameOver retry={retry} score={score} />}
      </div>
    </>
  );
}

export default App;
