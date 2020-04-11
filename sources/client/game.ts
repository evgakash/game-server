import { openScreen } from './screens.js';
import * as GameScreen from './screens/game.js';
import * as ResultScreen from './screens/result.js';
  

GameScreen.setTurnHandler( turnHandler );
GameScreen.setTurnHandler2( turnHandler2 );
GameScreen.setTurnHandler3( turnHandler3 );
GameScreen.setTurnHandler4( turnHandler4 );
ResultScreen.setRestartHandler( restartHandler );

/**
 * Отправляет сообщение на сервер
 */
let sendMessage: typeof import( './connection.js' ).sendMessage;

/**
 * Устанавливает функцию отправки сообщений на сервер
 * 
 * @param sendMessageFunction Функция отправки сообщений
 */
function setSendMessage( sendMessageFunction: typeof sendMessage ): void
{
	sendMessage = sendMessageFunction;
}

/**
 * Обрабатывает ход игрока
 * 
 * @param znach Загаданное пользователем значение
 */
function turnHandler( znach:number ): void
{
	sendMessage( {
		type: 'playerRoll',
		znach,
	} );
}

/**
 * Обрабатывает второй ход игрока
 * 
 * @param kolvo Загаданное пользователем число
 */
function turnHandler2( kolvo: number ): void 
{
	sendMessage( {
		type: 'playerRoll2',
		kolvo
	} );
}

/**
 * Обрабатывает третий ход игрока
 * 
 * @param red Загаданное пользователем число красных карт
 * @param black Загаданное пользователем число чёрных карт
 */
function turnHandler3( black:number, red:number ): void 
{
	sendMessage( {
		type: 'playerRoll3',
		black,
		red,
	} );
}

/**
 * Обрабатывает четвёртый ход игрока
 * 
 * @param chervi наличие червей
 * @param bubi  наличие буби
 * @param tref наличие треф
 * @param piki наличие пики
 */
function turnHandler4( chervi:boolean, bubi:boolean, tref:boolean, piki:boolean ): void 
{
	sendMessage( {
		type: 'playerRoll4',
		chervi,
		bubi,
		tref,
		piki
	} );
}


/**
 * Обрабатывает перезапуск игры
 */
function restartHandler(): void
{
	sendMessage( {
		type: 'repeatGame',
	} );
}

/**
 * Начинает игру
 */
function startGame(arr:number[]): void
{
	openScreen( 'game' );
	dobavCards(arr);
}

/**
 * функция ищет сундучки
 */
function haveChests()
{
	const chests=GameScreen.findingChests();
	if(chests>0)
		sendMessage( {
			type: 'Chests',
			chestsPlayer: chests,
			} )
	dobavCards([]);
}

/**
 * Есть ли у игрока карта определённого значения
 * 
 * @param znach карта спросившего игрока
 */
function findCards( znach:number)
{
	sendMessage( {
		type: 'answerOtherPlayer',
		cards: GameScreen.FindCards(znach),
		} )
}

/**
 * закрыть поле с вопросами
 */
function lockAsk()
{
	GameScreen.LockPole();
}
/**
 * открыть поле и вопрос о количестве
 */
function openWindowNumber()
{
	GameScreen.openNumber();
}
/**
 * открыть вопрос о цвете
 */
function openWindowColor()
{
	GameScreen.openColor();
}
/**
 * открыть поле о масти
 */
function openWingowSuit()
{
	GameScreen.openSuit();
}
/**
 * удаляем карты
 * @param cards карты для удаления
 */
function deleteCards(cards: number[])
{
	for(let i=0;i<cards.length;++i)
		GameScreen.deleteCard(cards[i]);
	dobavCards([]);

}
/**
 * функция добавления карт
 * @param arr массив добавляемых карт
 */
function dobavCards(arr:number[]): void
{
	const kolvo = GameScreen.dobav(arr);
	if(kolvo<1)
	{
		sendMessage( {
		type: 'repeatCart',
		} )
	}
	else
		sendMessage( {
		type: 'OtherPlayerCards',
		cardsKolvo: kolvo,
		} );
}

/**
 * добавляет/удаляет карты сопернику на экране игрока
 * 
 * @param arr количество карт соперника
 */
function dobavOtherPlayerCards(arr:number)
{
	let cardsnow = GameScreen.kolvoCardsOtherPlayers();
	if(cardsnow===arr)
		return;
	if(cardsnow<arr)
		for(;cardsnow!=arr;++cardsnow)
			GameScreen.dobavOtherCards();
	if(cardsnow>arr)
		for(;cardsnow!=arr;--cardsnow)
			GameScreen.deleteOtherCards();
}

/**
 * Меняет активного игрока
 * 
 * @param myTurn Ход текущего игрока?
 */
function changePlayer( myTurn: boolean, koloda:number ): void
{
	GameScreen.update( myTurn );
	GameScreen.changeNumberStopk(koloda);
}

/**
 * Завершает игру
 * 
 * @param result Результат игры
 */
function endGame( result: 'win' | 'loose' | 'abort' ): void
{
	ResultScreen.update( result );
	openScreen( 'result' );
}

export {
	startGame,
	changePlayer,
	dobavCards,
	haveChests,
	findCards,
	lockAsk,
	openWindowNumber,
	openWindowColor,
	openWingowSuit,
	deleteCards,
	endGame,
	setSendMessage,
	dobavOtherPlayerCards,
};
