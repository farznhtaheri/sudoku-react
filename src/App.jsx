import { languages } from "./languages"
import { useEffect, useState } from "react"
import clsx from 'clsx';
import { getFarewellText, getRandomWord } from './utils'
import confetti from "https://cdn.skypack.dev/canvas-confetti"

export default function AssemblyEndgame() {

  const [currentWord, setCurrentWord] = useState(" ");
  const [guessedLetters, setGuessedLetters] = useState([]);
  const alphabet = "abcdefghijklmnopqrstuvwxyz";

  const lastLetter = guessedLetters[guessedLetters.length - 1];
  const isLastGuessCorrect = lastLetter ? currentWord.split('').includes(lastLetter) : true;
  
  let wrongGuessCount = 0;
  
  // calculating wrongGuessCount
  guessedLetters.forEach(letter => {
    if (!currentWord.split('').includes(letter)) {
      wrongGuessCount++;
    }
  })

  const isGameWon = currentWord.split('').every(letter => guessedLetters.includes(letter)) 
    && wrongGuessCount < 8;
  const isGameLost = wrongGuessCount >= 8 && !isGameWon;
  const isGameOver = isGameLost || isGameWon;

  async function fetchWord() {
    setCurrentWord(await getRandomWord());
  }

  useEffect(() => {
    fetchWord();
  }, [])

  if (isGameWon) {
    confetti();
  }
  
  // displaying the keyboard
  const key = alphabet.split("").map(letter => 
    <button 
      disabled={isGameOver}
      onClick={() => handleKey(letter)} 
      key={letter} 
      className={clsx("key", {red_key: guessedLetters.includes(letter) 
          && !currentWord.includes(letter), 
        green_key: guessedLetters.includes(letter) 
          && currentWord.includes(letter)})}>{letter.toUpperCase()}</button>
  )

  function displayWordClass(char) {
    if (currentWord === " ") {
      return 'loading';
    }
    return guessedLetters.includes(char) ? 
    "character" : "character lost-character";
  }

  // displaying the word (correctly guessed letters): display a letter if the user has guessed it
  const characterArr = currentWord.split('').map((char, index) =>  
    <span 
      key={index} 
      className={displayWordClass(char)}>
      {guessedLetters.includes(char) ? char.toUpperCase() :
       isGameLost ? char.toUpperCase() : ""}</span>
  )

  // displaying language chips (lost or not)
  const languagesChips = languages.map((language, index) => {
    const isLanguageLost = index < wrongGuessCount && index != 8;
    return <span 
      key={language.name}
      className={`language-chip ${isLanguageLost ? "lost" : ""}`}
      style={{
      backgroundColor: language.backgroundColor,
      color: language.color
      }}>{language.name}</span>
  })  

  // handle keyboard updates
  function handleKey(letter) {
    setGuessedLetters(prev => { 
      let isPresent = false;
      prev.forEach(element => {
        if (element === letter) {
          isPresent = true;
        }
      })
      return isPresent ? prev : [...prev, letter];
    });
  }

  // displaying game status section
  function gameStatus() {
    if (!isGameOver && !isLastGuessCorrect) {
      let stringOfLost = "";
      languages.filter((language, index) => (
        index < wrongGuessCount ? true : false
      ))
      .map((language, index) => {
        return index == 0 ? stringOfLost += language.name : stringOfLost += " & " + language.name});
      return <p>"{getFarewellText(stringOfLost)}" 😢</p>;
    }
    return (
      <>
        <h2>{clsx({
          "You win!": isGameWon, 
          "Game over!": isGameLost})}</h2>
        <p>{clsx({
          "Well done! 🎉": isGameWon,
          "You lost! Better start learning Assembly 😭": isGameLost})}</p>
      </> 
    )
  }
  function startNewGame() {
    fetchWord();
    setGuessedLetters([]);
  }
  return (
      <main>
          <header>
            <h1>Assembly: Endgame</h1>
            <p>Guess the word within 8 attempts to 
              keep the programming world safe from Assembly!</p>
          </header>
          <section className={clsx("game-status", {
            lost: isGameLost, 
            win: isGameWon, 
            language_lost: !isGameOver && !isLastGuessCorrect})}>
            {gameStatus()}  
          </section>
          <section className="languages-container">
            {languagesChips}
          </section>
          <section className="letters-container">
            {characterArr}
          </section>
          <section className="keyboard">
            {key}
          </section>
          {isGameOver && <button onClick={startNewGame} className="new-game">New Game</button>}
      </main>
  )
}