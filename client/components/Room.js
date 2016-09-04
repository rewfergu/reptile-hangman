import React from 'react';
import ServerAPI from '../models/ServerAPI';
import GameBoard from './GameBoard';
import Outcome from './Outcome.js';
import Players from './Players';


export default class Room extends React.Component {

	constructor(props) {
		super(props);
		this.state = {	
	        word: [], // keep state immutable
    		guessedLetters: [],
    		remainingGuesses: 6,
    		isDone: false,
			players:[]
		};

		this.outcome = {
			win: true,
			player: "",
		}

		// player = {
		// 	playerId: null,
		// 	guessedLetters: [],
		// 	correctLetters: 0,
		// 	incorrectLetters:0
		// }

		// setup socket
		this.serverAPI = new ServerAPI(4000);
		this.serverAPI.connect();	
		// enter room
		this.serverAPI.onEnterRoom((res)=>{
			console.log("Enter Room", res.gameState);

			this.setState({
				'player' : res.players,
				'playerId' : res.playerId,
		        'word':  res.gameState.word, // keep state immutable
	    		'guessedLetters': res.gameState.guessedLetters,
	    		'remainingGuesses': res.gameState.remainingGuesses,
	    		'isDone': res.gameState.isDone
			});
		})

		this.serverAPI.onPlayerEnterRoom((res)=>{
			console.log("Player enter room", res);
			var playerList = this.state.players;
			playerList.push(res.playerId);
			this.setState({
				players: playerList
			})
		});

		this.serverAPI.onPlayerLeaveRoom((res)=>{
			console.log("Player Leave room", res);
			var playerList = this.state.players;
			playerList.splice(playerList.indexOf(res.playerId), 1);
			this.setState({
				players: playerList
			})
		});

		this.serverAPI.onStartGame( (res) => {
			console.log("Start game", res);
			this.setGameState(res);
		});

		this.serverAPI.onIncorrectGuess((res)=>{
			console.log("Incorrect Guess", res);
			this.setGameState(res.gameState);
		})

		this.serverAPI.onCorrectGuess((res)=>{
			console.log("Correct Guess", res);
			this.setGameState(res.gameState);
		})

		this.serverAPI.onWin((res)=>{
			console.log("win!", res)
			this.outcome.win = true;
			this.outcome.player = res.playerId;
			this.setGameState(res.gameState);
		})

		this.serverAPI.onLose((res)=>{
			console.log("lose!", res)
			this.outcome.win = false;
			this.outcome.player = res.playerId;
			this.setGameState(res.gameState);
		})
	}

	setGameState(gameState){
		console.log("setting game state: ", gameState)
		this.setState({
	        'word':  gameState.word, // keep state immutable
    		'guessedLetters': gameState.guessedLetters,
    		'remainingGuesses': gameState.remainingGuesses,
    		'isDone': gameState.isDone
		});
	}

	render() {
		console.log("render", this.state)
		var guessedLettersUpper = this.state.guessedLetters.map((letter)=>{return letter.toUpperCase()});
		return(
			<div className="room">
				{
					(this.state.isDone)?<Outcome outcome={this.outcome} models={this.serverAPI} />: null
				}	
				<GameBoard 
					word={this.state.word} 
					guessedLetters={guessedLettersUpper} 
					remainingGuesses={this.state.remainingGuesses} 
					models = {this.serverAPI}/>
				<Players players={this.state.players}/>

			</div>
		)
	}

}