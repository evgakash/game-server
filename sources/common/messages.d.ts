/**
 * Начало игры
 */
export type GameStartedMessage = {
	/** Тип сообщения */
	type: 'gameStarted';
	/** Мой ход? */
	myTurn: boolean;
	cards: number[];
};

/**
 * Игра прервана
 */
export type GameAbortedMessage = {
	/** Тип сообщения */
	type: 'gameAborted';
};

/**
 * новые карты игрока
 */
export type PlayerNewCards = {
	/** Тип сообщения */
	type: 'playerNewCards';
	/** номера карт игрока*/
	cards: number[];
};

/**
 * сообщение о появлении нового сундучка
 */
export type getChests = {
	/** Тип сообщения */
	type: 'Chests';
	chestsPlayer: number;
};

/**
 * нужна игроку карта
 */
export type DobavCard = {
	/** Тип сообщения */
	type: 'repeatCart';
};
/**
 * удаление определённых карт
 */
export type DeleteCards = {
	/** Тип сообщения */
	type: 'deleteCards';
	cards: number[];
};

/**
 * Есть ли у игрока карты такого значения?
 */
export type HaveCards = {
	/** Тип сообщения */
	type: 'haveCards';
	cardsZn: number;
};

/**
 * сколько карт у другого игрока
 */
export type OtherPlayerCards = {
	/** Тип сообщения */
	type: 'OtherPlayerCards';
	cardsKolvo: number;
};

/**
 * количество сундучков
 */
export type NumberChests = {
	/** Тип сообщения */
	type: 'playerChests';
	/** количество сундучков игрока*/
	chests: number;
};

/**
 * закрытие поля
 */
export type GoStep1 = {
	type: 'goStep1';
};

/**
 * Ход игрока
 */
export type PlayerRollMessage = {
	/** Тип сообщения */
	type: 'playerRoll';
	/**Загаданное значение */
	znach: number;
};
/**
 * открыть вопрос о количестве
 */
export type GoStep2 = {
	type: 'goStep2';
};

/**
 * Ход игрока 2
 */
export type PlayerRollMessage2 = {
	/** Тип сообщения */
	type: 'playerRoll2';
	/**Загаданное значение */
	kolvo: number;
};

/**
 * открыть вопрос о цвете
 */
export type GoStep3 = {
	type: 'goStep3';
};

/**
 * Ход игрока 3
 */
export type PlayerRollMessage3 = {
	/** Тип сообщения */
	type: 'playerRoll3';
	/**Загаданное значение */
	black: number;
	/**Количество красных карт */
	red: number;
};
/**
 * открыть вопрос о масти
 */
export type GoStep4 = {
	type: 'goStep4';
};

/**
 * Ход игрока
 */
export type PlayerRollMessage4 = {
	/** Тип сообщения */
	type: 'playerRoll4';
	/**Количество червей */
	chervi: boolean;
	/**Количество бубей */
	bubi: boolean;
	/**Количество треф */
	tref: boolean;
	/**Количество пик */
	piki: boolean;
};

/**
 * Карты определённого значения другого игрока
 */
export type AnswerOtherPlayer = {
	/** Тип сообщения */
	type: 'answerOtherPlayer';
	/**Карты игрока */
	cards: number[];
};

/**
 * Результат хода игроков
 */
export type GameResultMessage = {
	/** Тип сообщения */
	type: 'gameResult';
	/** Победа? */
	win: boolean;
};

/**
 * Смена игрока
 */
export type ChangePlayerMessage = {
	/** Тип сообщения */
	type: 'changePlayer';
	/** Мой ход? */
	myTurn: boolean;
	/** сколько карт в колоде */
	koloda: number;
};

/**
 * Повтор игры
 */
export type RepeatGame = {
	/** Тип сообщения */
	type: 'repeatGame';
};

/**
 * Некорректный запрос клиента
 */
export type IncorrectRequestMessage = {
	/** Тип сообщения */
	type: 'incorrectRequest';
	/** Сообщение об ошибке */
	message: string;
};

/**
 * Некорректный ответ сервера
 */
export type IncorrectResponseMessage = {
	/** Тип сообщения */
	type: 'incorrectResponse';
	/** Сообщение об ошибке */
	message: string;
};

/**
 * Сообщения от сервера к клиенту
 */
export type AnyServerMessage =
	| GameStartedMessage
	| GameAbortedMessage
	| GameResultMessage
	| ChangePlayerMessage
	| IncorrectRequestMessage
	| PlayerNewCards
	| OtherPlayerCards
	| HaveCards
	| GoStep1
	| GoStep2
	| GoStep3
	| GoStep4
	| DeleteCards
	| IncorrectResponseMessage;

/** 
 * Сообщения от клиента к серверу
 */
export type AnyClientMessage =
	| PlayerRollMessage
	| PlayerRollMessage2
	| PlayerRollMessage3
	| PlayerRollMessage4
	| AnswerOtherPlayer
	| NumberChests
	| RepeatGame
	| DobavCard
	| OtherPlayerCards
	| getChests
	| IncorrectRequestMessage
	| IncorrectResponseMessage;
