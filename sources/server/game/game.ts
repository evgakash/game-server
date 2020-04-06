import WebSocket from 'ws';
import { onError } from './on-error.js';

import type {
	AnyClientMessage,
	AnyServerMessage,
	GameStartedMessage,
	GameAbortedMessage,
} from '../../common/messages.js';

/**
 * колода
 */
let arr: number[]=[];
/**
 * карты игрока, у которого отгадывают карты
 */
let otherPlayerHave: number[];

/**
 * сумма сундучков
 */
let sumChests:number;

/**
 * Функция перемешевания карт
 * 
 * @param array значение карт
 */
function shuffle(array: number[]): void {
	arr.length=0;
	for (let i = 0; i < 36; ++i)
		arr.push(i);
	array.sort(() => Math.random() - 0.5);
}

/**
 * Класс игры
 * 
 * Запускает игровую сессию.
 */
class Game {
	/**
	 * Количество игроков в сессии
	 */
	static readonly PLAYERS_IN_SESSION = 2;

	/**
	 * Игровая сессия
	 */
	private _session: WebSocket[];
	/**
	 * Информация о ходах игроков
	 */
//	private _playersState!: WeakMap<WebSocket, number | null>;  

	/**
	 * @param session Сессия игры, содержащая перечень соединений с игроками
	 */
	constructor(session: WebSocket[]) {
		this._session = session;

		this._sendStartMessage()
			.then(
				() => {
					this._listenMessages();
				}
			)
			.catch(onError);
	}

	/**
	 * Уничтожает данные игровой сессии
	 */
	destroy(): void {
		// Можно вызвать только один раз
		this.destroy = () => { };

		for (const player of this._session) {
			if (
				(player.readyState !== WebSocket.CLOSED)
				&& (player.readyState !== WebSocket.CLOSING)
			) {
				const message: GameAbortedMessage = {
					type: 'gameAborted',
				};

				this._sendMessage(player, message)
					.catch(onError);
				player.close();
			}
		}

		// Обнуляем ссылки
		this._session = null as unknown as Game['_session'];
	//	this._playersState = null as unknown as Game['_playersState'];
		arr.length=0;
		otherPlayerHave.length=0;
	}

	/**
	 * Отправляет сообщение о начале игры
	 */
	private _sendStartMessage(): Promise<void[]> {
	//	this._playersState = new WeakMap();
		sumChests=0;
		otherPlayerHave=[];
		shuffle(arr);
		let card: number[];
		card = arr.splice(0, 4);
		const data: GameStartedMessage = {
			type: 'gameStarted',
			myTurn: true,
			cards: card,
		};
		const promises: Promise<void>[] = [];
		card = arr.splice(0, 4);
		for (const player of this._session) {
			promises.push(this._sendMessage(player, data));
			data.myTurn = false;
			data.cards = card;
		}

		return Promise.all(promises);
	}

	/**
	 * Присылаем новую карту игроку, который попросил
	 */
	private _sendNewCartMessage(player: WebSocket) {
		let card: number[]=[];
		if(arr.length>0)
			card = arr.splice(0, 1);
		this._sendMessage(
			player,
			{
				type: 'playerNewCards',
				cards: card,
			},
		).catch(onError);
	}

	/**
	 * Отправляет сообщение игроку
	 * 
	 * @param player Игрок
	 * @param message Сообщение
	 */
	private _sendMessage(player: WebSocket, message: AnyServerMessage): Promise<void> {
		return new Promise(
			(resolve, reject) => {
				player.send(
					JSON.stringify(message),
					(error) => {
						if (error) {
							reject();

							return;
						}

						resolve();
					}
				)
			},
		);
	}

	/**
	 * Добавляет слушателя сообщений от игроков
	 */
	private _listenMessages(): void {
		for (const player of this._session) {
			player.on(
				'message',
				(data) => {
					const message = this._parseMessage(data);

					this._processMessage(player, message);
				},
			);

			player.on('close', () => this.destroy());
		}
	}

	/**
	 * Разбирает полученное сообщение
	 * 
	 * @param data Полученное сообщение
	 */
	private _parseMessage(data: unknown): AnyClientMessage {
		if (typeof data !== 'string') {
			return {
				type: 'incorrectRequest',
				message: 'Wrong data type',
			};
		}

		try {
			return JSON.parse(data);
		}
		catch (error) {
			return {
				type: 'incorrectRequest',
				message: 'Can\'t parse JSON data: ' + error,
			};
		}
	};

	/**
	 * Выполняет действие, соответствующее полученному сообщению
	 * 
	 * @param player Игрок, от которого поступило сообщение
	 * @param message Сообщение
	 */
	private _processMessage(player: WebSocket, message: AnyClientMessage): void {
		switch (message.type) {
			case 'answerOtherPlayer':
				this._fullInfoOtherPlayer(message.cards);
				this._onPlayerRoll(player);
				break;

			case 'playerRoll':
				this._askOtherPlayer(player, message.znach);
				break;

			case 'playerRoll2':
				this._onPlayerRoll2(player, message.kolvo);
				break;

			case 'playerRoll3':
				this._onPlayerRoll3(player, message.red, message.black);
				break;

			case 'playerRoll4':
				this._onPlayerRoll4(player, message.chervi, message.bubi, message.tref, message.piki);
				break;

			case 'repeatGame':
				this._sendStartMessage()
					.catch(onError);
				break;

			case 'incorrectRequest':
				this._sendMessage(player, message)
					.catch(onError);
				break;

			case 'incorrectResponse':
				console.error('Incorrect response: ', message.message);
				break;

			case 'repeatCart':
				this._sendNewCartMessage(player);
				break;

			case 'OtherPlayerCards':
				this._sendOtherPlayerCardsMessage(player, message.cardsKolvo);
				break;
			case 'Chests':
				this._endGame(player, message.chestsPlayer);
				break;	

			default:
				this._sendMessage(
					player,
					{
						type: 'incorrectRequest',
						message: `Unknown message type: "${(message as AnyClientMessage).type}"`,
					},
				)
					.catch(onError);
				break;
		}
	};

	/**
	 * заполняет массив значений другого игрока
	 * 
	 * @param cards карты, которые есть у другого игрока с определённым значением
	 */
	private _fullInfoOtherPlayer(cards: number[]) {
		if(otherPlayerHave)
			otherPlayerHave.length=0;
		for (let i = 0; i < cards.length; ++i)
			otherPlayerHave[i]=cards[i];
	}

	/**
	 * Функция, которая запрашивает у другого игрока карты подходящего значения
	 * 
	 * @param currentPlayer сходивший игрок
	 * @param znach значение, которое игрок выбрал
	 */
	private _askOtherPlayer(currentPlayer: WebSocket, znach: number) {
		for (const player of this._session) {
			if (player != currentPlayer)
			{
				this._sendMessage(
					player,
					{
						type: 'haveCards',
						cardsZn: znach,
					},
				).catch(onError);
			}
		}
	
	}

	/**
	 * посылает количество карт игрока другому игроку
	 * 
	 * @param currentPlayer игрок от которого пришло количество
	 * @param card количество карт
	 */
	private _sendOtherPlayerCardsMessage(currentPlayer: WebSocket, card: number) {
		for (const player of this._session) {
			if (player != currentPlayer)
			{
				this._sendMessage(
					player,
					{
						type: 'OtherPlayerCards',
						cardsKolvo: card,
					},
				).catch(onError);
			}	
		}

	}
/**
 * Убирает поле вопросов спрашивающего игрока, даёт карту, если есть и меняет ходы играков
 * 
 * @param askPlayer спрашивающий игрок
 * @param answerPlayer отвечающий игрок
 */
	private next(askPlayer:WebSocket, answerPlayer:WebSocket)
	{
		this._sendMessage(
				askPlayer,
				{
					type: 'goStep1',
				},
			).catch(onError);

			if (arr.length > 0)//выдать карту, если есть
				this._sendMessage(
					askPlayer,
					{
						type: 'playerNewCards',
						cards: arr.splice(0, 1),
					},
				).catch(onError);

			this._sendMessage(
				askPlayer,
				{
					type: 'changePlayer',
					myTurn: false,
					koloda: arr.length,
				},
			).catch(onError);

			this._sendMessage(
				answerPlayer,
				{
					type: 'changePlayer',
					myTurn: true,
					koloda: arr.length,
				},
			).catch(onError);
	}
	/**
	 * Действуем исходя из информации о том , есть ли у другого игрока карты с таким значением или нет
	 * 
	 * @param currentPlayer Игрок, у которого хотят забрать карты
	 */
	private _onPlayerRoll(currentPlayer: WebSocket): void {
		let stepPlayer:WebSocket=currentPlayer;
		for (const player of this._session) {
			if(player!=currentPlayer)
				stepPlayer= player;
		}
		if (otherPlayerHave.length!=0) {//если у спрашиваемого есть карты такого значения
			this._sendMessage(
				stepPlayer,
				{
					type: 'goStep2',
				},
			).catch(onError);
		}
		else
			this.next(stepPlayer, currentPlayer);
	}

	/** 
	 * угадал ли игрок с количеством
	 * 
	 * @param currentPlayer //ходящий игрок
	 * @param kolvo количество возможных карт у другого игрока
	 */
	private _onPlayerRoll2(currentPlayer: WebSocket, kolvo: number) {
		let stepPlayer:WebSocket=currentPlayer;
		for (const player of this._session) 
			if(player!=currentPlayer)
				stepPlayer= player;
		if (otherPlayerHave.length === kolvo)
			this._sendMessage(
				currentPlayer,
				{
					type: 'goStep3',
				},
			).catch(onError);
		else {
			otherPlayerHave.length=0;
			this.next (currentPlayer, stepPlayer);
		}
	}
	/**
	 * Угадал ли игрок с количеством возможных чёрных и красных карт
	 * 
	 * @param currentPlayer ходящий игрок
	 * @param red возможное количество красных
	 * @param black возможное количество чёрных
	 */
	private _onPlayerRoll3(currentPlayer: WebSocket, red: number, black: number) {
		let stepPlayer:WebSocket=currentPlayer;
		for (const player of this._session) 
			if(player!=currentPlayer)
				stepPlayer= player;
		let r: number = 0;
		let b: number = 0;
		for (let i = 0; i < otherPlayerHave.length; ++i) {
			if (otherPlayerHave[i] % 4 < 2)
				++r;
			else
				++b;
		}
		if (r === red && b === black)
			this._sendMessage(
				currentPlayer,
				{
					type: 'goStep4',
				},
			).catch(onError);
		else {
			otherPlayerHave.length=0;
			this.next (currentPlayer, stepPlayer);
		}
	}
	/**
	 * Угадал ли игрок масти
	 * @param currentPlayer угадывающий игрок
	 * @param chervi черви
	 * @param bubi буби
	 * @param tref крести
	 * @param piki пики
	 */
	private _onPlayerRoll4(currentPlayer: WebSocket, chervi: boolean, bubi: boolean, tref: boolean, piki: boolean) {
		let c: boolean = false;
		let b: boolean = false;
		let t: boolean = false;
		let p: boolean = false;
		for (let i = 0; i < otherPlayerHave.length; ++i) {
			if (otherPlayerHave[i] % 4 === 0)
				c = true;
			if (otherPlayerHave[i] % 4 === 1)
				b = true;
			if (otherPlayerHave[i] % 4 === 2)
				t = true;
			if (otherPlayerHave[i] % 4 === 3)
				p = true;
		}
		let otherPlayer:WebSocket=currentPlayer;
		for (const player of this._session)
			{
				if (player != currentPlayer) 
					otherPlayer=player;
			}
		if (c === chervi && b === bubi && t === tref && p === piki) {
			this._sendMessage(
				currentPlayer,
				{
					type: 'playerNewCards',
					cards: otherPlayerHave,
				},
				).catch(onError);
			this._sendMessage(
				otherPlayer,
				{
					type: 'deleteCards',
					cards: otherPlayerHave,
				},
				).catch(onError);	
			this._sendMessage(
				currentPlayer,
				{
					type: 'goStep1',
				},
				).catch(onError);
		}
		else 
			this.next (currentPlayer, otherPlayer);
		otherPlayerHave.length=0;
	}

/**
 * Узнаём кончилась ли игра?
 * 
 * @param currentPlayer игрок, который собрал сундук
 * @param chests //количество сундуков игрока
 */
private _endGame(currentPlayer: WebSocket, chests:number)
	{
	++sumChests;
	if(sumChests==9)
		for(const player of this._session)
		{
			if(player===currentPlayer)
				this._sendMessage(
					player,
					{
						type: 'gameResult',
						win: (chests>4)
					},
				)
					.catch( onError );
			else
			this._sendMessage(
				player,
				{
					type: 'gameResult',
					win: (chests<5)
				},
			)
				.catch( onError );
		}
	}
}


export {
	Game,
};
