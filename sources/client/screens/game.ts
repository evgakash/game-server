//import { deleteCards } from "../game";

/**
 * Заголовок экрана
 */
const title = document.querySelector( 'main.game>h2' ) as HTMLHeadingElement;

/**
 * Блок с картами игрока
 */
const youCards = document.querySelector( 'div.you' ) as HTMLInputElement;

/**
 * Блок с картами противника
 */
const otherCards= document.querySelector("div.enem") as HTMLInputElement; 

/**
 * Блок для возникновения блоков с вопросами
 */
const pole=document.querySelectorAll("div.pole")[1] as HTMLInputElement;
/**
 * Блок с вопросом о количестве карт
 */
const num=pole.querySelectorAll("div.block")[0] as HTMLInputElement;
/**
 * Блок с вопросом о цвете карт
 */
const clr=pole.querySelectorAll("div.block")[1] as HTMLInputElement;
/**
 * Блок с вопросом о масти карт
 */
const suit=pole.querySelectorAll("div.block")[2] as HTMLInputElement;
/**
 * Сундучки
 */
const Chest = youCards.querySelector("div.chest") as HTMLInputElement; 
/**
 * количество карт в стопке
 */
const stopk = document.querySelector("div.stopk") as HTMLInputElement;
/**
 * карты игрока
 */
let list: number[][]=[];

if ( !title || !youCards || !otherCards || !pole || !num || !clr ||!suit ||!Chest||!stopk)
{
	throw new Error( 'Can\'t find required elements on "game" screen' );
}



/**
 * Обновляет экран игры
 * 
 * @param myTurn Ход текущего игрока?
 */
function update( myTurn: boolean ): void
{
	if ( myTurn )
	{
		title.textContent = 'Ваш ход';
		changeUkarta('ukarta');
		return;
	}
	title.textContent = 'Ход противника';
	changeUkarta('ukartaSleep');
}
/**
 * меняет состояние карт
 * 
 * @param name класс состояния карты
 */
function changeUkarta(name:string)
{
	let spis=youCards.childNodes.length;
	for(let i=1;i<spis;++i)
	{
		let cart= youCards.childNodes[i] as HTMLInputElement;
		cart.className=name;
	}
}

/**
 * Проверка пришедшего массива карт на наличие сундучков и добавление карт
 * 
 * @param arr массив добавляемых карт
 */
function dobav(arr:number[]): number
{
	if(arr.length===4)
	{
		Chest.textContent = 0+'';
		list=[[0,1,2,3,4,5,6,7,8],
		  [-1,-1,-1,-1,-1,-1,-1,-1,-1],
		  [-1,-1,-1,-1,-1,-1,-1,-1,-1],
		  [-1,-1,-1,-1,-1,-1,-1,-1,-1],
		  [-1,-1,-1,-1,-1,-1,-1,-1,-1]];
		let j=0;
		let i=0;
		while(i<3)
		{
			if(Math.round(arr[i] / 4)!=Math.round(arr[i+1] / 4))
			{
				j=0;
				i=3;
			}
			else
			{
				j=1;
				++i;
			}
		}
		if(j===1)
		{
			Chest.textContent = 1+'';
			return -1;
		}
	}
	while(arr.length>0)
	{
		const a=arr.shift() as number;
		newCart(a);
	}
	return youCards.childNodes.length-1;
}

/**
 * изменяет количество карт в стопке
 * 
 * @param arr количество карт в стопке
 */
function changeNumberStopk(arr:number)
{
	stopk.textContent  = arr +'';
}

/**
 * сколько карт у соперника
 */
function kolvoCardsOtherPlayers(): number
{
	return otherCards.childNodes.length;
}

/**
 * удаление карты у соперника
 */
function deleteOtherCards()
{
	if(otherCards.firstChild)
		otherCards.firstChild.remove();
}

/**
 * добавление карт на экране сопернику 
 */
function dobavOtherCards ()
{
	const ekrt = document.createElement('div');
	ekrt.className = 'karta';
	otherCards.append(ekrt);
}

/**
 * создание карт из присланных
 * 
 * @param set номер добавляемой карты
 */
function newCart(set:number): void 
{
	const ekrt = document.createElement('button');
	ekrt.className = 'ukarta';
	const slch = ''+set ;
	ekrt.setAttribute("data-about", slch);
	const slush = set % 4; //какой масти карта
	switch (slush) {
	  case 0:
		ekrt.setAttribute("data-mast", "♥");
		break;
	  case 1:
		ekrt.setAttribute("data-mast", "♦");
		break;
	  case 2:
		ekrt.setAttribute("data-mast", "♣");
		break;
	  case 3:
		ekrt.setAttribute("data-mast", "♠");
		break;
	}
	const zn =Math.round( (set - slush)/4); //какого значения карта
	list[slush+1][zn]=set;
	switch (zn) {
	  case 0:
		ekrt.setAttribute("data-znach", '6');
		break;
	  case 1:
		ekrt.setAttribute("data-znach", '7');

		break;
	  case 2:
		ekrt.setAttribute("data-znach", '8');
		break;
	  case 3:
		ekrt.setAttribute("data-znach", '9');
		break;
	  case 4:
		ekrt.setAttribute("data-znach", '10');
		break;
	  case 5:
		ekrt.setAttribute("data-znach", "В");
		break;
	  case 6:
		ekrt.setAttribute("data-znach","Д");
		break;
	  case 7:
		ekrt.setAttribute("data-znach", "К");
		break;
	  case 8:
		ekrt.setAttribute("data-znach", "Т");
		break;
	}
	ekrt.textContent = ekrt.getAttribute("data-znach") + " " + ekrt.getAttribute("data-mast");
	youCards.append(ekrt);
  }


  /**
 * Обработчик хода игрока
 */
  type TurnHandler = ( znach:number ) => void;
 /**
 * Обработчик хода игрока
 */
  let turnHandler: TurnHandler;
  /**
 * Устанавливает обработчик хода игрока
 * 
 * @param handler Обработчик хода игрока
 */
function setTurnHandler( handler: TurnHandler ): void
{
	turnHandler = handler;
}
	/**
	 * При нажатии на карту, отправляется запрос есть ли у другого игрока карты с таким же значением
	*/	
  youCards.onclick = function(event) 
  {
	let target = event.target as HTMLInputElement; 
	if (target.className != "ukarta") return;
	target.className = "vbr"; 
	turnHandler && turnHandler(Number(target.getAttribute("data-about")) );
  };


    /**
 * Обработчик второго хода игрока
 */
type TurnHandler2 = ( kolvo:number ) => void;
 /**
 * Обработчик второго хода игрока
 */
let turnHandler2: TurnHandler2;
/**
 * количество карт, который выбрал игрок
 */
let kolvoCards:number;
  /**
 * Устанавливает обработчик хода игрока
 * 
 * @param handler Обработчик хода игрока
 */
function setTurnHandler2( handler: TurnHandler2 ): void
{
	turnHandler2 = handler;
}
/**
 * открывает окно с количетвом карт
 */
function openNumber() 
{
  pole.hidden=false;
  num.hidden=false;
}
  /**
 * Игрок спрашивает количество карт
 */
  pole.onclick = function(event) {
	let target = event.target as HTMLInputElement; 
	if (target.className != "num") return;
	kolvoCards=Number(target.textContent);
	turnHandler2 && turnHandler2(kolvoCards);
  };


  /**
 * Обработчик третьего хода игрока
 */
type TurnHandler3 = ( black:number, red:number ) => void;
 /**
 * Обработчик третьегохода игрока
 */
let turnHandler3: TurnHandler3;
/**
 * количество возможных красных карт
 */
let RedCards:number=0;
/**
 * количество возможных чёрных карт
 */
let BlackCards:number=0;
  /**
 * Устанавливает обработчик хода игрока
 * 
 * @param handler Обработчик хода игрока
 */
function setTurnHandler3( handler: TurnHandler3 ): void
{
	turnHandler3 = handler;
}
  /**
   * спросить цвет карт
   * 
   * @param krt карта, которую выбрал игрок
   * @param kolvo количество карт соперника, определённого значения
   */
  function openColor() 
  {
	RedCards=0;
	BlackCards=0;
	num.hidden=true;
	clr.hidden=false;
	const kolvot=clr.querySelector("p") as HTMLInputElement;
	kolvot.textContent = "Количество карт: " + kolvoCards;
	
	const red=clr.querySelector("input") as HTMLInputElement;
	const br=clr.querySelector("div") as HTMLInputElement;

	red.oninput = function() {
	  br.textContent = red.value;
	  RedCards=Number(red.value);
	};
  
	const black=clr.querySelectorAll("input")[1] ;
	const bb=clr.querySelectorAll("div")[1];

	black.oninput = function() {
	  bb.textContent = black.value;
	  BlackCards=Number(black.value);
	};
	const next= clr.querySelector("button") as HTMLInputElement;

	next.onclick = function() {
	  if (Number(red.value) + Number(black.value) != kolvoCards)
		return; //если игрок не добрал или перебрал со цветами
		turnHandler3 && turnHandler3( BlackCards,RedCards);
		red.value='0';
		br.textContent='0';
		black.value='0';
		bb.textContent='0';
	};
  }
  

  /**
 * Обработчик четвёртого хода игрока
 */
type TurnHandler4= ( chervi:boolean, bubi:boolean, tref:boolean, piki:boolean ) => void;
/**
* Обработчик хода игрока
*/
let turnHandler4: TurnHandler4;
 /**
* Устанавливает обработчик хода игрока
* 
* @param handler Обработчик хода игрока
*/
function setTurnHandler4( handler: TurnHandler4 ): void
{
   turnHandler4 = handler;
}
/**
 * спросить масти
 * 
 * @param krt карта, которую выбрал игрок
 * @param red количество красных карт соперника
 * @param black количетво чёрных карт соперника
 */
  function openSuit () 
  {
	clr.hidden=true;
	suit.hidden=false;
	const cred=suit.querySelector("p") as HTMLInputElement;
	cred.textContent = "Красные: " + RedCards;
	const cbl=suit.querySelectorAll("p")[1];
	cbl.textContent = "Чёрные: " + BlackCards;
	const C1=suit.querySelectorAll("div.suit")[0] as HTMLInputElement;
	C1.value='0';
	const C2=suit.querySelectorAll("div.suit")[1] as HTMLInputElement;
	C2.value='0';
	const C3=suit.querySelectorAll("div.suit")[2] as HTMLInputElement;
	C3.value='0';
	const C4=suit.querySelectorAll("div.suit")[3] as HTMLInputElement;
	C4.value='0';
	const next=suit.querySelector("button") as HTMLInputElement;
	
	suit.onclick = function(event) {
	  //игрок должен видеть на что нажал
	  let target = event.target as HTMLInputElement;
	  if (target.className == "suit red") {
		target.value = '1';
		target.className = "suit pom red";
		return;
	  }
	  if (target.className == "suit pom red") {
		target.value = '0';
		target.className = "suit red";
		return;
	  }
	  if (target.className == "suit black") {
		target.value = '1';
		target.className = "suit pom black";
		return;
	  }
	  if (target.className == "suit pom black") {
		target.value = '0';
		target.className = "suit black";
		return;
	  }
	};

	next.onclick = function() {
	  if (Number(C1.value) + Number(C2.value) != RedCards) return; 
	  if (Number(C3.value) + Number(C4.value) != BlackCards) return;
	  let c: boolean = Number(C1.value)!=0?true:false;
	  let b: boolean = Number(C2.value)!=0?true:false;
	  let t: boolean = Number(C3.value)!=0?true:false;
	  let p: boolean = Number(C4.value)!=0?true:false;
	  turnHandler4 && turnHandler4(c,b,t,p);
	   C1.value='0';
	  C1.className = "suit red";
	  C2.value='0';
	  C2.className = "suit red"
	  C3.value='0';
	  C3.className = "suit black"
	  C4.value='0';
	  C4.className = "suit black";
	};
  }

  /**
   * Ищет среди карт полные сундучки и убирает их, возвращает количество сундучков
   */
  function findingChests():number
  {
	for(let i=0; i<9;++i)
	{
		let q=0;
		for(let j=1;j<5;++j)
			if(list[j][i]>-1)
				++q;
		if(q==4)
		{
			for(let w=0;w<4;++w)
				deleteCard((i*4)+w);
			Chest.textContent=(Number(Chest.textContent)+1)+'';
			return Number(Chest.textContent);
		}
	}
	return -1;
  }

  /**
   * Удвляет карту определённого значения
   * 
   * @param card карта, которую надо удалить
   */
  function deleteCard(card:number)
  {
	const spisok=youCards.childNodes.length;
	for(let i=1; i<spisok;++i)
	{
		let elem=youCards.childNodes[i] as HTMLInputElement;
		if(Number(elem.getAttribute("data-about"))===card)
		{
			list[(card%4)+1][Math.round((card-(card%4))/4)]=-1;
			elem.remove();
			return;
		}
	}
  }
/**
 * ищем карты , которые подходят по значению
 * @param znach карта спросившего
 */
  function FindCards(znach:number):number[]
  {
	  let takecards : number[]=[];
	  const zn=Math.round((znach-(znach%4))/4);
	  for(let i=1;i<5;++i)
	  {
		  if(list[i][zn]>-1)
		  	takecards.push(list[i][zn]);
	  }
	  return takecards;
  }

  /**
   * закрываем поле вопроса и приводим карты в одинаковый вид
   */
  function LockPole()
  {
	kolvoCards=0;
	RedCards=0;
	BlackCards=0;

	num.hidden=true;
	clr.hidden=true;
	suit.hidden=true;
	pole.hidden=true;
	 
	for(let i=1;i<youCards.childNodes.length;++i)
	{
		const cart=youCards.childNodes[i] as HTMLInputElement;
		cart.className='ukarta';
	}

  }


export {
	update,
	setTurnHandler,
	setTurnHandler2,
	setTurnHandler3,
	setTurnHandler4,
	dobav,
	changeNumberStopk,
	openNumber,
	openColor,
	openSuit,
	findingChests,
	deleteCard,
	FindCards,
	LockPole,
	kolvoCardsOtherPlayers,
	deleteOtherCards,
	dobavOtherCards,
};
